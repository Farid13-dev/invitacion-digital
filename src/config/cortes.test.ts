import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Las fechas de cierre del RSVP están escritas dos veces: en `evento.ts`, que
 * decide si el formulario se muestra, y en el Apps Script, que decide si la
 * escritura se acepta. Tienen que coincidir.
 *
 * Desincronizarlas produce el peor fallo posible de este proyecto: el invitado
 * ve un formulario perfectamente normal, lo rellena, y el servidor lo rechaza.
 * Como la duplicación es inevitable (una vive en el navegador y la otra en
 * Google), al menos que salte aquí y no el día de la boda.
 */
function leer(ruta: string): string {
  return readFileSync(fileURLToPath(new URL(ruta, import.meta.url)), "utf8");
}

function extraer(texto: string, patron: RegExp): string {
  const encontrado = texto.match(patron)?.[1];
  expect(encontrado, `no se encontró ${patron}`).toBeDefined();
  return encontrado!;
}

describe("fechas de corte del RSVP", () => {
  const evento = leer("./evento.ts");
  const appsScript = leer("../../apps-script/Codigo.gs");

  it("cierreNuevos coincide con CIERRE_NUEVOS", () => {
    expect(extraer(evento, /cierreNuevos:\s*"([^"]+)"/)).toBe(
      extraer(appsScript, /CIERRE_NUEVOS:\s*"([^"]+)"/),
    );
  });

  it("cierreActualizaciones coincide con CIERRE_ACTUALIZACIONES", () => {
    expect(extraer(evento, /cierreActualizaciones:\s*"([^"]+)"/)).toBe(
      extraer(appsScript, /CIERRE_ACTUALIZACIONES:\s*"([^"]+)"/),
    );
  });

  it("las actualizaciones cierran después que las altas nuevas", () => {
    const nuevos = new Date(extraer(evento, /cierreNuevos:\s*"([^"]+)"/));
    const actualizaciones = new Date(extraer(evento, /cierreActualizaciones:\s*"([^"]+)"/));
    expect(actualizaciones.getTime()).toBeGreaterThan(nuevos.getTime());
  });

  it("las dos fechas llevan offset explícito", () => {
    for (const patron of [/cierreNuevos:\s*"([^"]+)"/, /cierreActualizaciones:\s*"([^"]+)"/]) {
      expect(extraer(evento, patron)).toMatch(/[+-]\d{2}:\d{2}$/);
    }
  });
});
