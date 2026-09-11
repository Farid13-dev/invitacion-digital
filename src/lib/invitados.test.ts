import { describe, expect, it } from "vitest";
import { parseInvitado } from "./invitados";

describe("parseInvitado", () => {
  it("separa titulares de acompañantes", () => {
    expect(parseInvitado("Andrés & Laura (Tomás, Sara)")).toEqual({
      principales: ["Andrés", "Laura"],
      extras: ["Tomás", "Sara"],
      todos: ["Andrés", "Laura", "Tomás", "Sara"],
    });
  });

  it("acepta una sola persona", () => {
    expect(parseInvitado("Camila").todos).toEqual(["Camila"]);
  });

  it("acepta la coma como separador entre titulares", () => {
    expect(parseInvitado("Camila, Julián").principales).toEqual(["Camila", "Julián"]);
  });

  it("devuelve un grupo vacío si no hay nombre", () => {
    expect(parseInvitado("").todos).toEqual([]);
    expect(parseInvitado("   ").todos).toEqual([]);
  });

  it("conserva los apellidos compuestos con guion", () => {
    // El guion solo hace de espacio en el formato heredado, y solo cuando no
    // hay ningún espacio en el nombre. Un apellido con guion tiene que
    // sobrevivir intacto.
    expect(parseInvitado("Familia Quintero-Rivas").todos).toEqual(["Familia Quintero-Rivas"]);
  });

  it("traduce el formato heredado de guiones", () => {
    expect(parseInvitado("Ana-Sofia").todos).toEqual(["Ana Sofia"]);
  });

  it("mantiene dos personas que se llaman igual como dos personas", () => {
    // Un padre y un hijo con el mismo nombre son dos asientos y dos comidas.
    expect(parseInvitado("Julián & Julián").todos).toHaveLength(2);
  });

  it("ignora los paréntesis vacíos", () => {
    expect(parseInvitado("Camila ()").todos).toEqual(["Camila"]);
  });
});
