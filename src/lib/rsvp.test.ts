import { afterEach, describe, expect, it, vi } from "vitest";
import { enviarCancion, enviarConfirmacion } from "./rsvp";

const ENDPOINT = "https://script.google.com/macros/s/prueba/exec";

/** Sustituye `fetch` y devuelve el cuerpo que se le habría enviado. */
function capturarEnvio(respuesta: object = { status: "success" }) {
  const espia = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(respuesta)));
  vi.stubGlobal("fetch", espia);
  return () => JSON.parse(String(espia.mock.calls[0]?.[1]?.body)) as Record<string, unknown>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("enviarCancion", () => {
  it("no lleva el teléfono en la raíz del cuerpo", async () => {
    // Un Apps Script anterior a las canciones no conoce `accion`. Si viera
    // `telefono` en la raíz, tomaría la canción por una confirmación y
    // vaciaría la fila de asistencia del invitado.
    const cuerpo = capturarEnvio();
    await enviarCancion(ENDPOINT, {
      grupo: "Andrés & Laura",
      telefono: "300 123 4567",
      firma: "a1b2c3d4e5f6",
      cancion: "Vivir mi vida — Marc Anthony",
    });

    const enviado = cuerpo();
    expect(enviado).not.toHaveProperty("telefono");
    expect(enviado).toEqual({
      accion: "cancion",
      autor: { grupo: "Andrés & Laura", telefono: "3001234567", firma: "a1b2c3d4e5f6" },
      cancion: "Vivir mi vida — Marc Anthony",
    });
  });

  it("traduce el tope de canciones a un mensaje para el invitado", async () => {
    capturarEnvio({ status: "limit", message: "Ya nos sugeriste 5 canciones. ¡Gracias!" });
    const resultado = await enviarCancion(ENDPOINT, {
      grupo: "Camila",
      telefono: "3001234567",
      firma: "x",
      cancion: "Otra",
    });
    expect(resultado).toEqual({
      tipo: "cerrado",
      mensaje: "Ya nos sugeriste 5 canciones. ¡Gracias!",
    });
  });
});

describe("enviarConfirmacion", () => {
  it("manda el teléfono normalizado y las listas separadas por comas", async () => {
    const cuerpo = capturarEnvio();
    const resultado = await enviarConfirmacion(ENDPOINT, {
      grupo: "Andrés & Laura (Tomás)",
      telefono: "+57 300-123-4567",
      firma: "a1b2c3d4e5f6",
      asisten: ["Andrés", "Laura"],
      noAsisten: ["Tomás"],
      mensaje: "¡Felicidades!",
    });

    expect(resultado).toEqual({ tipo: "ok" });
    expect(cuerpo()).toMatchObject({
      telefono: "573001234567",
      asisten: "Andrés, Laura",
      noAsisten: "Tomás",
    });
  });

  it("no confunde la página HTML de error de Apps Script con un éxito", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>Error</html>", { status: 200 })),
    );
    const resultado = await enviarConfirmacion(ENDPOINT, {
      grupo: "Camila",
      telefono: "3001234567",
      firma: "x",
      asisten: ["Camila"],
      noAsisten: [],
      mensaje: "",
    });
    expect(resultado.tipo).toBe("error");
  });
});
