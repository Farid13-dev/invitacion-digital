import { beforeEach, describe, expect, it, vi } from "vitest";
import { guardarRsvpLocal, leerRsvpLocal } from "./almacenamiento";

function localStorageDePrueba() {
  const datos = new Map<string, string>();
  return {
    getItem: (k: string) => datos.get(k) ?? null,
    setItem: (k: string, v: string) => void datos.set(k, v),
    removeItem: (k: string) => void datos.delete(k),
    clear: () => datos.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

const GRUPO = ["Andrés Betancur", "Laura Mejía", "Tomás"];

beforeEach(() => {
  vi.stubGlobal("localStorage", localStorageDePrueba());
});

describe("respaldo local del RSVP", () => {
  it("guarda y recupera la respuesta del mismo grupo", () => {
    guardarRsvpLocal("300 123 4567", {
      nombres: GRUPO,
      asistencia: [true, true, false],
      mensaje: "¡Allá nos vemos!",
    });

    expect(leerRsvpLocal("3001234567", GRUPO)).toEqual({
      nombres: GRUPO,
      asistencia: [true, true, false],
      mensaje: "¡Allá nos vemos!",
    });
  });

  it("descarta el respaldo si el grupo del enlace cambió", () => {
    // Se corrigió la invitación y se reenvió sin Tomás: lo que había guardado
    // ya no describe a este grupo y arrastrarlo colaría a un invitado de más.
    guardarRsvpLocal("3001234567", {
      nombres: GRUPO,
      asistencia: [true, true, true],
      mensaje: "",
    });

    expect(leerRsvpLocal("3001234567", ["Andrés Betancur", "Laura Mejía"])).toBeNull();
  });

  it("ignora un respaldo con otro formato", () => {
    localStorage.setItem("rsvp_3001234567", JSON.stringify({ asistencia: { Tomás: true } }));
    expect(leerRsvpLocal("3001234567", GRUPO)).toBeNull();
  });

  it("no lanza si localStorage no está disponible", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("acceso denegado");
      },
      setItem: () => {
        throw new Error("acceso denegado");
      },
    } as unknown as Storage);

    // En incógnito o con las cookies bloqueadas, localStorage lanza al leerlo.
    // Perder el respaldo es aceptable; tumbar la invitación no.
    expect(() =>
      guardarRsvpLocal("3001234567", { nombres: GRUPO, asistencia: [], mensaje: "" }),
    ).not.toThrow();
    expect(leerRsvpLocal("3001234567", GRUPO)).toBeNull();
  });
});
