/**
 * Las fechas de la configuración son cadenas ISO con offset explícito
 * ("2027-05-15T16:00:00-05:00"). El offset importa: sin él, `new Date()`
 * interpreta la hora en la zona del navegador y un invitado que abra la
 * invitación desde otro país vería la cuenta regresiva desfasada.
 */
export function aFecha(iso: string): Date {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    throw new Error(
      `Fecha inválida en la configuración: "${iso}". ` +
        `Se espera ISO 8601 con offset, por ejemplo "2027-05-15T16:00:00-05:00".`,
    );
  }
  return fecha;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/**
 * "2026-11-23T23:59:00-05:00" → "23 de noviembre".
 *
 * Lee el día tal como está escrito, sin pasarlo por la zona horaria del
 * navegador: las 23:59 del 23 en Colombia ya son el 24 en España, y un
 * invitado que abriera desde allí leería un plazo que no es.
 */
export function fechaLegible(iso: string): string {
  aFecha(iso); // valida antes de recortar
  const [, mes, dia] = /^\d{4}-(\d{2})-(\d{2})/.exec(iso) ?? [];
  return `${Number(dia)} de ${MESES[Number(mes) - 1]}`;
}

export function yaPaso(iso: string, ahora: Date = new Date()): boolean {
  return ahora.getTime() > aFecha(iso).getTime();
}

export type Restante = { dias: number; horas: number; minutos: number; segundos: number };

export function tiempoRestante(objetivo: Date, ahora: number = Date.now()): Restante {
  const ms = Math.max(0, objetivo.getTime() - ahora);
  return {
    dias: Math.floor(ms / 86_400_000),
    horas: Math.floor(ms / 3_600_000) % 24,
    minutos: Math.floor(ms / 60_000) % 60,
    segundos: Math.floor(ms / 1000) % 60,
  };
}
