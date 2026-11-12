/**
 * Cliente del endpoint de confirmación (Google Apps Script + Google Sheets).
 *
 * Dos detalles que no son obvios y que costaron encontrar:
 *
 * 1. Apps Script **no responde al preflight de CORS**. Un POST con
 *    `Content-Type: application/json` dispara el preflight y falla. Enviarlo
 *    como `text/plain;charset=utf-8` lo convierte en una "petición simple",
 *    el navegador se salta el preflight y —a diferencia de `mode: "no-cors"`—
 *    sí podemos leer la respuesta real del servidor.
 *
 * 2. Apps Script responde **200 con una página HTML de error** cuando algo
 *    falla de su lado. Por eso nunca confiamos en `res.ok`: parseamos el
 *    cuerpo y validamos la forma.
 */
import { normalizarTelefono } from "./telefono";

const TIMEOUT_MS = 12_000;

export type EstadoInvitado = {
  encontrado: boolean;
  /**
   * Falso si el servidor rechazó la firma del enlace. Se distingue de
   * "no encontrado" a propósito: un enlace al que WhatsApp le comió el `&f=`
   * daba un formulario en blanco que solo fallaba al pulsar enviar.
   */
  autorizado: boolean;
  asisten: string[];
  noAsisten: string[];
  mensaje: string;
};

export type ResultadoEnvio =
  | { tipo: "ok" }
  | { tipo: "cerrado"; mensaje: string }
  | { tipo: "noAutorizado" }
  | { tipo: "error"; mensaje: string };

export type DatosConfirmacion = {
  grupo: string;
  telefono: string;
  /** Firma HMAC que viaja en la URL (`?f=`). Prueba que el enlace es legítimo. */
  firma: string;
  asisten: string[];
  noAsisten: string[];
  mensaje: string;
};

function separarLista(valor: unknown): string[] {
  return String(valor ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function leerJson(res: Response): Promise<Record<string, unknown>> {
  const texto = await res.text();
  try {
    const datos = JSON.parse(texto) as unknown;
    if (typeof datos !== "object" || datos === null) throw new Error("forma inesperada");
    return datos as Record<string, unknown>;
  } catch {
    // Apps Script devolvió su página HTML de error con estado 200.
    throw new Error(`Respuesta no válida del servidor de confirmaciones (${res.status}).`);
  }
}

/** Consulta qué había respondido antes este invitado, si es que respondió. */
export async function consultarEstado(
  endpoint: string,
  telefono: string,
  firma: string,
): Promise<EstadoInvitado> {
  const params = new URLSearchParams({
    telefono: normalizarTelefono(telefono),
    firma,
  });

  const res = await fetch(`${endpoint}?${params}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const datos = await leerJson(res);

  return {
    encontrado: datos.found === true,
    autorizado: datos.status !== "unauthorized",
    asisten: separarLista(datos.asisten),
    noAsisten: separarLista(datos.noAsisten),
    mensaje: String(datos.mensaje ?? ""),
  };
}

export type DatosCancion = Pick<DatosConfirmacion, "grupo" | "telefono" | "firma"> & {
  cancion: string;
};

/** Lo que se le dice al invitado cuando el servidor rechaza la firma del enlace. */
export const ENLACE_INVALIDO = "Este enlace no es válido. Usa el que te enviamos por WhatsApp.";

/** Y cuando el enlace ni siquiera trae nombre o teléfono. */
export const SIN_IDENTIFICAR =
  "No pudimos identificar tu invitación. Por favor usa el enlace que te enviamos por WhatsApp.";

/** Escribe o actualiza la fila del invitado en la hoja de cálculo. */
export function enviarConfirmacion(
  endpoint: string,
  datos: DatosConfirmacion,
): Promise<ResultadoEnvio> {
  return publicar(endpoint, {
    grupo: datos.grupo,
    telefono: normalizarTelefono(datos.telefono),
    firma: datos.firma,
    asisten: datos.asisten.join(", "),
    noAsisten: datos.noAsisten.join(", "),
    mensaje: datos.mensaje,
  });
}

/**
 * Añade una canción a la pestaña "Canciones" de la hoja. Va firmada igual
 * que la confirmación: sin firma, cualquiera podría llenar la lista.
 *
 * El invitado viaja dentro de `autor` y **no** en la raíz del cuerpo. Un
 * Apps Script anterior a las canciones no conoce `accion`: si encontrara
 * `telefono` en la raíz tomaría esto por una confirmación y vaciaría la fila
 * del invitado. Sin él, responde "Falta el teléfono" y no escribe nada.
 */
export function enviarCancion(endpoint: string, datos: DatosCancion): Promise<ResultadoEnvio> {
  return publicar(endpoint, {
    accion: "cancion",
    autor: {
      grupo: datos.grupo,
      telefono: normalizarTelefono(datos.telefono),
      firma: datos.firma,
    },
    cancion: datos.cancion,
  });
}

/** POST al Apps Script y traducción de su respuesta. */
async function publicar(endpoint: string, cuerpo: object): Promise<ResultadoEnvio> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      // Ver el punto 1 del comentario de cabecera: esto evita el preflight.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const respuesta = await leerJson(res);
    const estado = String(respuesta.status ?? "");

    if (estado === "success") return { tipo: "ok" };

    // "limit": el invitado ya agotó sus sugerencias de canciones. Para la
    // interfaz es lo mismo que un plazo cerrado: no se puede, y el servidor
    // explica por qué.
    if (estado === "closed" || estado === "closed_update" || estado === "limit") {
      return {
        tipo: "cerrado",
        mensaje: String(respuesta.message ?? "El plazo ya cerró."),
      };
    }

    if (estado === "unauthorized") return { tipo: "noAutorizado" };

    return {
      tipo: "error",
      mensaje: String(respuesta.message ?? "No pudimos guardar tu respuesta."),
    };
  } catch (error) {
    const esTimeout = error instanceof DOMException && error.name === "TimeoutError";
    return {
      tipo: "error",
      mensaje: esTimeout
        ? "El servidor tardó demasiado en responder. Intenta de nuevo."
        : "Error de conexión. Revisa tu internet e intenta de nuevo.",
    };
  }
}
