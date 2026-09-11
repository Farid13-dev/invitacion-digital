import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConfigRsvp } from "@/config/tipos";
import { guardarRsvpLocal, leerRsvpLocal } from "@/lib/almacenamiento";
import { yaPaso } from "@/lib/fechas";
import { consultarEstado, enviarConfirmacion } from "@/lib/rsvp";
import type { Invitado } from "./useInvitado";

export type FaseRsvp = "cargando" | "listo" | "enviando" | "enviado";

export type Rsvp = {
  fase: FaseRsvp;
  /**
   * Una casilla por persona del grupo, en el mismo orden que `grupo.todos`.
   * Va por posición y no por nombre a propósito: dos invitados que se llaman
   * igual (un padre y un hijo, algo corriente) son dos personas y necesitan
   * dos casillas independientes.
   */
  asistencia: boolean[];
  mensaje: string;
  error: string | null;
  /** Si ya había respondido antes, el formulario dice "actualizar", no "confirmar". */
  yaConfirmo: boolean;
  puedeConfirmar: boolean;
  /** Texto que explica por qué está cerrado, o `null` si está abierto. */
  motivoCierre: string | null;
  /** El servidor rechazó la firma del enlace. Se sabe antes de rellenar nada. */
  enlaceInvalido: boolean;
  alternar: (indice: number) => void;
  escribirMensaje: (texto: string) => void;
  confirmar: () => Promise<void>;
  limpiar: () => void;
};

/**
 * Estado completo de la confirmación de asistencia.
 *
 * Regla central: **la hoja de cálculo es la fuente de verdad, pero un fallo de
 * red nunca degrada lo que ya sabíamos.** Si el invitado ya había confirmado y
 * la consulta falla, se conserva la respuesta cacheada en vez de mostrarle un
 * formulario en blanco — es un fallo que ya ocurrió en producción, y por eso
 * la regla está escrita aquí y no en la cabeza de alguien.
 *
 * Segunda regla: **la hoja no manda sobre quién está invitado.** Lo que llega
 * del servidor solo puede marcar o desmarcar a las personas que vienen en el
 * enlace; un nombre que ya no está en el grupo se ignora.
 */
export function useRsvp(invitado: Invitado, config: ConfigRsvp): Rsvp {
  const { grupo, grupoBruto, telefono, firma } = invitado;

  // Por defecto se asume que va todo el grupo: es la respuesta más común y
  // deja al invitado solo el trabajo de desmarcar excepciones.
  const asistenciaInicial = useMemo(() => grupo.todos.map(() => true), [grupo.todos]);

  const [asistencia, setAsistencia] = useState<boolean[]>(asistenciaInicial);
  const [mensaje, setMensaje] = useState("");
  const [fase, setFase] = useState<FaseRsvp>("cargando");
  const [error, setError] = useState<string | null>(null);
  const [yaConfirmo, setYaConfirmo] = useState(false);
  const [enlaceInvalido, setEnlaceInvalido] = useState(false);

  const { endpoint } = config;
  // `useInvitado` resuelve la URL una sola vez, así que esta referencia es
  // estable durante toda la vida de la página y sirve como dependencia.
  const nombres = grupo.todos;

  useEffect(() => {
    if (!telefono || nombres.length === 0) {
      setFase("listo");
      return;
    }

    let cancelado = false;

    // 1) Respaldo inmediato: evita el parpadeo de "nunca confirmaste" y actúa
    //    de red de seguridad si la consulta de abajo falla.
    const cache = leerRsvpLocal(telefono, nombres);
    const base = cache ? cache.asistencia : nombres.map(() => true);

    if (cache) {
      setYaConfirmo(true);
      setAsistencia(base);
      if (cache.mensaje) setMensaje(cache.mensaje);
    }

    if (!endpoint) {
      if (import.meta.env.DEV) {
        console.warn(
          "[rsvp] VITE_RSVP_ENDPOINT no está configurado: la confirmación no se guardará. " +
            "Ver apps-script/README.md.",
        );
      }
      setFase("listo");
      return;
    }

    // 2) Fuente de verdad. Si responde, manda; si no, nos quedamos con (1).
    consultarEstado(endpoint, telefono, firma)
      .then((estado) => {
        if (cancelado) return;

        if (!estado.autorizado) {
          setEnlaceInvalido(true);
          return;
        }

        if (!estado.encontrado) return;

        // La hoja guarda nombres; las casillas van por posición. Se proyecta
        // lo uno sobre lo otro y se descarta cualquier nombre que ya no
        // pertenezca al grupo del enlace.
        const asisten = new Set(estado.asisten);
        const noAsisten = new Set(estado.noAsisten);

        const fusionada = nombres.map((nombre, i) => {
          if (asisten.has(nombre)) return true;
          if (noAsisten.has(nombre)) return false;
          return base[i] ?? true;
        });

        setYaConfirmo(true);
        setAsistencia(fusionada);
        if (estado.mensaje) setMensaje(estado.mensaje);

        guardarRsvpLocal(telefono, { nombres, asistencia: fusionada, mensaje: estado.mensaje });
      })
      .catch((err: unknown) => {
        // A propósito NO se hace setYaConfirmo(false): perder la conexión no
        // significa que el invitado no haya confirmado.
        console.error("[rsvp] no se pudo verificar el estado de confirmación:", err);
      })
      .finally(() => {
        if (!cancelado) setFase("listo");
      });

    return () => {
      cancelado = true;
    };
  }, [telefono, firma, endpoint, nombres]);

  // Dos cierres independientes. El de actualizaciones es más tardío porque
  // quien ya respondió solo está corrigiendo un número que ya contamos.
  const motivoCierre = useMemo(() => {
    if (yaConfirmo) {
      return yaPaso(config.cierreActualizaciones)
        ? "El plazo para actualizar tu confirmación ya cerró."
        : null;
    }
    return yaPaso(config.cierreNuevos)
      ? "El plazo para confirmar nuevas asistencias ya cerró."
      : null;
  }, [yaConfirmo, config.cierreNuevos, config.cierreActualizaciones]);

  const alternar = useCallback((indice: number) => {
    setAsistencia((prev) => prev.map((va, i) => (i === indice ? !va : va)));
  }, []);

  const limpiar = useCallback(() => {
    setError(null);
    setFase((actual) => (actual === "enviado" ? "listo" : actual));
  }, []);

  const confirmar = useCallback(async () => {
    setFase("enviando");
    setError(null);

    const asisten = nombres.filter((_, i) => asistencia[i]);
    const noAsisten = nombres.filter((_, i) => !asistencia[i]);

    const resultado = await enviarConfirmacion(endpoint, {
      grupo: grupoBruto,
      telefono,
      firma,
      asisten,
      noAsisten,
      mensaje,
    });

    if (resultado.tipo === "ok") {
      setYaConfirmo(true);
      setFase("enviado");
      guardarRsvpLocal(telefono, { nombres, asistencia, mensaje });
      return;
    }

    setFase("listo");
    setError(
      resultado.tipo === "cerrado"
        ? resultado.mensaje
        : resultado.tipo === "noAutorizado"
          ? "Este enlace no es válido. Usa el que te enviamos por WhatsApp."
          : resultado.mensaje,
    );
  }, [asistencia, endpoint, firma, grupoBruto, mensaje, nombres, telefono]);

  return {
    fase,
    asistencia,
    mensaje,
    error,
    yaConfirmo,
    puedeConfirmar: motivoCierre === null,
    motivoCierre,
    enlaceInvalido,
    alternar,
    escribirMensaje: setMensaje,
    confirmar,
    limpiar,
  };
}
