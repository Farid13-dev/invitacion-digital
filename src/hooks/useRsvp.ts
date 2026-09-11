import { useCallback, useEffect, useMemo, useState } from "react";
import type { ConfigRsvp } from "@/config/tipos";
import { guardarRsvpLocal, leerRsvpLocal } from "@/lib/almacenamiento";
import { yaPaso } from "@/lib/fechas";
import { consultarEstado, enviarConfirmacion } from "@/lib/rsvp";
import type { Invitado } from "./useInvitado";

export type FaseRsvp = "cargando" | "listo" | "enviando" | "enviado";

export type Rsvp = {
  fase: FaseRsvp;
  /** Una entrada por persona del grupo: true = asiste. */
  asistencia: Record<string, boolean>;
  mensaje: string;
  error: string | null;
  /** Si ya había respondido antes, el formulario dice "actualizar", no "confirmar". */
  yaConfirmo: boolean;
  puedeConfirmar: boolean;
  /** Texto que explica por qué está cerrado, o `null` si está abierto. */
  motivoCierre: string | null;
  alternar: (nombre: string) => void;
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
 * formulario en blanco — ese fue el bug de producción que cerró la primera
 * versión de este proyecto.
 */
export function useRsvp(invitado: Invitado, config: ConfigRsvp): Rsvp {
  const { grupo, grupoBruto, telefono, firma } = invitado;

  // Por defecto se asume que va todo el grupo: es la respuesta más común y
  // deja al invitado solo el trabajo de desmarcar excepciones.
  const asistenciaInicial = useMemo(
    () => Object.fromEntries(grupo.todos.map((nombre) => [nombre, true])),
    [grupo.todos],
  );

  const [asistencia, setAsistencia] = useState<Record<string, boolean>>(asistenciaInicial);
  const [mensaje, setMensaje] = useState("");
  const [fase, setFase] = useState<FaseRsvp>("cargando");
  const [error, setError] = useState<string | null>(null);
  const [yaConfirmo, setYaConfirmo] = useState(false);

  const { endpoint } = config;
  const clavesGrupo = grupo.todos.join("|");

  useEffect(() => {
    if (!telefono) {
      setFase("listo");
      return;
    }

    let cancelado = false;

    // 1) Respaldo inmediato: evita el parpadeo de "nunca confirmaste" y actúa
    //    de red de seguridad si la consulta de abajo falla.
    const cache = leerRsvpLocal(telefono);
    const base: Record<string, boolean> = cache
      ? { ...asistenciaInicial, ...cache.asistencia }
      : asistenciaInicial;

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
        if (cancelado || !estado.encontrado) return;

        const fusionada = { ...base };
        estado.asisten.forEach((nombre) => (fusionada[nombre] = true));
        estado.noAsisten.forEach((nombre) => (fusionada[nombre] = false));

        setYaConfirmo(true);
        setAsistencia(fusionada);
        if (estado.mensaje) setMensaje(estado.mensaje);

        guardarRsvpLocal(telefono, { asistencia: fusionada, mensaje: estado.mensaje });
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
    // `clavesGrupo` sustituye a `asistenciaInicial` como dependencia: es su
    // identidad estable en forma de cadena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telefono, firma, endpoint, clavesGrupo]);

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

  const alternar = useCallback((nombre: string) => {
    setAsistencia((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  }, []);

  const limpiar = useCallback(() => {
    setError(null);
    setFase((actual) => (actual === "enviado" ? "listo" : actual));
  }, []);

  const confirmar = useCallback(async () => {
    setFase("enviando");
    setError(null);

    const entradas = Object.entries(asistencia);
    const asisten = entradas.filter(([, va]) => va).map(([nombre]) => nombre);
    const noAsisten = entradas.filter(([, va]) => !va).map(([nombre]) => nombre);

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
      guardarRsvpLocal(telefono, { asistencia, mensaje });
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
  }, [asistencia, endpoint, firma, grupoBruto, mensaje, telefono]);

  return {
    fase,
    asistencia,
    mensaje,
    error,
    yaConfirmo,
    puedeConfirmar: motivoCierre === null,
    motivoCierre,
    alternar,
    escribirMensaje: setMensaje,
    confirmar,
    limpiar,
  };
}
