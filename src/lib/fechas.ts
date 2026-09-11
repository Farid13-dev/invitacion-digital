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
