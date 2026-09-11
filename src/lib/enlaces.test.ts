import { describe, expect, it } from "vitest";
import type { EventoDelDia } from "@/config/tipos";
import { urlCalendario, urlMapaEmbebido, urlMapaExterno } from "./enlaces";

const celebracion: EventoDelDia = {
  id: "celebracion",
  titulo: "Celebración",
  inicio: "2027-05-15T18:30:00-05:00",
  duracionMinutos: 210,
  cuando: "Sábado 15 de mayo",
  lugar: {
    nombre: "Hacienda El Mirador",
    direccion: "Envigado, Antioquia",
    coordenadas: "6.166893, -75.583961",
  },
};

describe("urlCalendario", () => {
  it("usa la duración real del evento, no una fija", () => {
    // 18:30-05:00 = 23:30Z, más 3 h 30 min = 03:00Z del día siguiente.
    const url = new URL(urlCalendario(celebracion));
    expect(url.searchParams.get("dates")).toBe("20270515T233000Z/20270516T030000Z");
  });

  it("lleva el título y el lugar", () => {
    const url = new URL(urlCalendario(celebracion));
    expect(url.searchParams.get("text")).toBe("Celebración");
    expect(url.searchParams.get("location")).toBe("Hacienda El Mirador, Envigado, Antioquia");
  });
});

describe("enlaces de mapas", () => {
  it("limpia los espacios de las coordenadas", () => {
    // Un espacio suelto tras la coma rompe el enlace de Google Maps.
    expect(urlMapaEmbebido(celebracion.lugar.coordenadas)).toContain("q=6.166893,-75.583961");
    expect(urlMapaExterno(celebracion.lugar.coordenadas)).toContain("query=6.166893%2C-75.583961");
  });
});
