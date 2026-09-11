import type { EventoDelDia } from "@/config/tipos";
import { aFecha } from "./fechas";

/** Formato compacto UTC que exige Google Calendar: 20270515T210000Z */
function aFormatoCalendario(fecha: Date): string {
  return `${fecha.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/**
 * Enlace "Agregar a Google Calendar" con la duración real del evento.
 * Dar por hecho que todo dura dos horas es fácil y deja la recepción cortada
 * en el calendario del invitado.
 */
export function urlCalendario(evento: EventoDelDia): string {
  const inicio = aFecha(evento.inicio);
  const fin = new Date(inicio.getTime() + evento.duracionMinutos * 60_000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evento.titulo,
    dates: `${aFormatoCalendario(inicio)}/${aFormatoCalendario(fin)}`,
    location: `${evento.lugar.nombre}, ${evento.lugar.direccion}`,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Las coordenadas se limpian: un espacio suelto rompe el enlace de Maps. */
function limpiarCoordenadas(coordenadas: string): string {
  return coordenadas.replace(/\s+/g, "");
}

export function urlMapaEmbebido(coordenadas: string): string {
  return `https://maps.google.com/maps?q=${limpiarCoordenadas(coordenadas)}&output=embed`;
}

export function urlMapaExterno(coordenadas: string): string {
  const params = new URLSearchParams({ api: "1", query: limpiarCoordenadas(coordenadas) });
  return `https://www.google.com/maps/search/?${params}`;
}
