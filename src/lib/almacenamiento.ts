import { normalizarTelefono } from "./telefono";

/**
 * Respaldo local de la confirmación.
 *
 * La fuente de verdad es la hoja de cálculo, pero Apps Script se cae o tarda
 * más de la cuenta con cierta frecuencia. Sin este respaldo, un invitado que
 * ya había confirmado y recarga la página en un momento malo se encuentra el
 * formulario en blanco, como si nunca hubiera respondido.
 *
 * Todos los accesos van envueltos en try/catch: en modo incógnito o con las
 * cookies bloqueadas, `localStorage` lanza al leerlo, no solo al escribirlo.
 */
export type RsvpGuardado = {
  asistencia: Record<string, boolean>;
  mensaje: string;
};

const PREFIJO = "rsvp";

function clave(telefono: string): string {
  return `${PREFIJO}_${normalizarTelefono(telefono)}`;
}

export function leerRsvpLocal(telefono: string): RsvpGuardado | null {
  try {
    const bruto = localStorage.getItem(clave(telefono));
    if (!bruto) return null;

    const datos = JSON.parse(bruto) as Partial<RsvpGuardado>;
    if (!datos || typeof datos.asistencia !== "object" || datos.asistencia === null) {
      return null;
    }
    return { asistencia: datos.asistencia, mensaje: String(datos.mensaje ?? "") };
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
