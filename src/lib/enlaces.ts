import type { EventoDelDia, Ubicacion } from "@/config/tipos";
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

/**
 * Qué se le pide a Google Maps: las coordenadas si las hay, y si no el nombre
 * del lugar con su ciudad.
 *
 * Las coordenadas se limpian porque un espacio suelto tras la coma rompe el
 * enlace. El nombre no se toca: ahí los espacios son parte de la búsqueda.
 */
export function consultaMapa(lugar: Ubicacion): string {
  const coordenadas = lugar.coordenadas?.replace(/\s+/g, "");
  return coordenadas || `${lugar.nombre}, ${lugar.direccion}`;
}

export function urlMapaEmbebido(lugar: Ubicacion): string {
  const params = new URLSearchParams({ q: consultaMapa(lugar), output: "embed" });
  return `https://maps.google.com/maps?${params}`;
}

export function urlMapaExterno(lugar: Ubicacion): string {
  const params = new URLSearchParams({ api: "1", query: consultaMapa(lugar) });
  return `https://www.google.com/maps/search/?${params}`;
}

/** Página de Instagram de una etiqueta: "#JohnYClaudia" → .../tags/johnyclaudia/ */
export function urlHashtagInstagram(hashtag: string): string {
  const etiqueta = hashtag.replace(/^#/, "").trim().toLowerCase();
  return `https://www.instagram.com/explore/tags/${encodeURIComponent(etiqueta)}/`;
}
