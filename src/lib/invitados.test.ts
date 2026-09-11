import { describe, expect, it } from "vitest";
import { parseInvitado } from "./invitados";

describe("parseInvitado", () => {
  it("separa titulares de acompañantes", () => {
    expect(parseInvitado("Andrés Betancur & Laura Mejía (Tomás, Sara)")).toEqual({
      principales: ["Andrés Betancur", "Laura Mejía"],
      extras: ["Tomás", "Sara"],
      todos: ["Andrés Betancur", "Laura Mejía", "Tomás", "Sara"],
    });
  });

  it("acepta una sola persona", () => {
    expect(parseInvitado("Camila Ospina").todos).toEqual(["Camila Ospina"]);
  });

  it("acepta la coma como separador entre titulares", () => {
    expect(parseInvitado("Camila Ospina, Julián Arango").principales).toEqual([
      "Camila Ospina",
      "Julián Arango",
    ]);
  });

  it("devuelve un grupo vacío si no hay nombre", () => {
    expect(parseInvitado("").todos).toEqual([]);
    expect(parseInvitado("   ").todos).toEqual([]);
  });

  it("conserva los apellidos compuestos con guion", () => {
    // El guion solo hace de espacio en el formato heredado, cuando no hay
    // ningún espacio en el nombre. "García-López" tiene que sobrevivir.
    expect(parseInvitado("Ana García-López").todos).toEqual(["Ana García-López"]);
  });

  it("traduce el formato heredado de guiones", () => {
    expect(parseInvitado("Camila-Ospina").todos).toEqual(["Camila Ospina"]);
  });

  it("mantiene dos personas que se llaman igual como dos personas", () => {
    // Un padre y un hijo con el mismo nombre son dos asientos y dos comidas.
    expect(parseInvitado("Julián Arango & Julián Arango").todos).toHaveLength(2);
  });

  it("ignora los paréntesis vacíos", () => {
    expect(parseInvitado("Camila Ospina ()").todos).toEqual(["Camila Ospina"]);
  });
});
