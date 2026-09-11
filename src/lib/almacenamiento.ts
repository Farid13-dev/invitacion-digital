import { normalizarTelefono } from "./telefono";

/**
 * Respaldo local de la confirmación.
 *
 * La fuente de verdad es la hoja de cálculo, pero Apps Script se cae o tarda
 * más de la cuenta con cierta frecuencia. Sin este respaldo, un invitado que
 * ya había confirmado y recarga la página en un momento malo se encuentra el
 * formulario en blanco, como si nunca hubiera respondido.
 *
 * Se guarda también la lista de nombres, no solo las casillas: si el enlace
 * del invitado cambia (porque se corrigió el grupo y se reenvió), el respaldo
 * anterior deja de ser válido y se descarta en vez de arrastrar a alguien que
 * ya no está invitado.
 *
 * Todos los accesos van envueltos en try/catch: en modo incógnito o con las
 * cookies bloqueadas, `localStorage` lanza al leerlo, no solo al escribirlo.
 */
export type RsvpGuardado = {
  /** Los nombres del grupo, en orden. Identifican a qué invitación pertenece. */
  nombres: string[];
  /** Una casilla por nombre, en el mismo orden. */
  asistencia: boolean[];
  mensaje: string;
};

const PREFIJO = "rsvp";

function clave(telefono: string): string {
  return `${PREFIJO}_${normalizarTelefono(telefono)}`;
}

function esListaDeTexto(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((v) => typeof v === "string");
}

/**
 * Devuelve el respaldo solo si corresponde a este mismo grupo. Cualquier otra
 * cosa (un formato viejo, un grupo distinto) se trata como si no hubiera nada.
 */
export function leerRsvpLocal(telefono: string, nombres: string[]): RsvpGuardado | null {
  try {
    const bruto = localStorage.getItem(clave(telefono));
    if (!bruto) return null;

    const datos = JSON.parse(bruto) as Partial<RsvpGuardado>;
    if (!datos || !esListaDeTexto(datos.nombres) || !Array.isArray(datos.asistencia)) {
      return null;
    }

    const mismoGrupo =
      datos.nombres.length === nombres.length && datos.nombres.every((n, i) => n === nombres[i]);

    if (!mismoGrupo || datos.asistencia.length !== nombres.length) return null;

    return {
      nombres,
      asistencia: datos.asistencia.map(Boolean),
      mensaje: String(datos.mensaje ?? ""),
    };
  } catch {
    return null;
  }
}

export function guardarRsvpLocal(telefono: string, datos: RsvpGuardado): void {
  try {
    localStorage.setItem(clave(telefono), JSON.stringify(datos));
  } catch {
    // Sin almacenamiento disponible seguimos funcionando: solo perdemos el
    // respaldo offline, no la confirmación, que ya viajó al servidor.
  }
}
