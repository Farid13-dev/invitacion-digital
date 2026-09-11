import { describe, expect, it } from "vitest";
import { aFecha, tiempoRestante, yaPaso } from "./fechas";

describe("aFecha", () => {
  it("respeta el offset de la configuración, no la zona del navegador", () => {
    // Es el punto entero de exigir offset explícito: un invitado que abre la
    // invitación desde otro país tiene que ver la misma cuenta regresiva.
    expect(aFecha("2027-05-15T16:00:00-05:00").toISOString()).toBe("2027-05-15T21:00:00.000Z");
  });

  it("falla con un mensaje útil si la fecha no es válida", () => {
    expect(() => aFecha("15/05/2027")).toThrow(/ISO 8601 con offset/);
  });
});

describe("yaPaso", () => {
  const ahora = new Date("2027-05-02T12:00:00-05:00");

  it("compara contra el instante dado", () => {
    expect(yaPaso("2027-05-01T23:59:00-05:00", ahora)).toBe(true);
    expect(yaPaso("2027-05-12T23:59:00-05:00", ahora)).toBe(false);
  });
});

describe("tiempoRestante", () => {
  it("descompone el tiempo que falta", () => {
    const objetivo = new Date("2027-05-15T16:00:00-05:00");
    const ahora = new Date("2027-05-13T14:30:30-05:00").getTime();

    expect(tiempoRestante(objetivo, ahora)).toEqual({
      dias: 2,
      horas: 1,
      minutos: 29,
      segundos: 30,
    });
  });

  it("se queda en cero cuando la fecha ya pasó, sin números negativos", () => {
    const objetivo = new Date("2027-05-15T16:00:00-05:00");
    const despues = new Date("2027-05-16T00:00:00-05:00").getTime();

    expect(tiempoRestante(objetivo, despues)).toEqual({
      dias: 0,
      horas: 0,
      minutos: 0,
      segundos: 0,
    });
  });
});
