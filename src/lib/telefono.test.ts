import { describe, expect, it } from "vitest";
import { esTelefonoPlausible, normalizarTelefono } from "./telefono";

describe("normalizarTelefono", () => {
  it("deja solo dígitos", () => {
    expect(normalizarTelefono("+57 300 123 4567")).toBe("573001234567");
    expect(normalizarTelefono("(300) 123-4567")).toBe("3001234567");
  });

  it("elimina las marcas de dirección invisibles de Excel y WhatsApp", () => {
    // U+202A … U+202C. A la vista no existen, pero hacen que dos teléfonos
    // idénticos no coincidan: es la llave primaria de todo el RSVP.
    expect(normalizarTelefono("‪3001234567‬")).toBe("3001234567");
  });

  it("tolera null, undefined y números", () => {
    expect(normalizarTelefono(null)).toBe("");
    expect(normalizarTelefono(undefined)).toBe("");
    expect(normalizarTelefono(3001234567)).toBe("3001234567");
  });
});

describe("esTelefonoPlausible", () => {
  it("acepta de 7 a 15 dígitos", () => {
    expect(esTelefonoPlausible("3001234567")).toBe(true);
    expect(esTelefonoPlausible("+57 300 123 4567")).toBe(true);
  });

  it("rechaza lo que no puede ser un teléfono", () => {
    expect(esTelefonoPlausible("12345")).toBe(false);
    expect(esTelefonoPlausible("")).toBe(false);
    expect(esTelefonoPlausible("1234567890123456")).toBe(false);
  });
});
