import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { describe, expect, it } from "vitest";
// Se importa renombrado a propósito. Con un identificador llamado `meta` en el
// módulo, la transformación de Vite se pisa con la expresión `import.meta` de
// la línea de abajo y el test ni siquiera llega a cargar.
import { meta as metadatos } from "./meta";

// Se lee el archivo en crudo en vez de importarlo con `?raw`: ese sufijo
// sigue pasando por el plugin de Tailwind, que devuelve el CSS ya compilado y
// sin el bloque `@theme` que necesitamos leer.
const RUTA_TEMA = "../styles/tema.css";

/**
 * El color de la barra del navegador está escrito dos veces: como hex en
 * `meta.colorTema`, porque una etiqueta `<meta>` no entiende de variables CSS,
 * y como `oklch` en `tema.css`, que es donde vive la paleta de verdad.
 *
 * Es la misma clase de duplicación que las fechas de corte del RSVP, y el
 * mismo remedio: si alguien ajusta la paleta y se olvida del hex, que lo diga
 * un test y no la franja de la barra de direcciones el día que un invitado
 * abra la invitación en un Android.
 */

/** oklch → sRGB, con el mismo redondeo que hacen los navegadores. */
function oklchAHex(L: number, C: number, gradosH: number): string {
  const h = (gradosH * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  const lineal = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];

  const canales = lineal.map((v) => {
    const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(v, 0) ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, srgb)) * 255)
      .toString(16)
      .padStart(2, "0");
  });

  return `#${canales.join("")}`;
}

/** Busca una variable de la paleta en `tema.css` y la devuelve en hex. */
function colorDeLaPaleta(variable: string): string {
  const css = readFileSync(fileURLToPath(new URL(RUTA_TEMA, import.meta.url)), "utf8");
  const encontrado = css.match(new RegExp(`${variable}:\\s*oklch\\(([^)]+)\\)`));

  expect(encontrado, `no se encontró ${variable} en tema.css`).not.toBeNull();

  const [L, C, H] = encontrado![1]!.trim().split(/\s+/).map(Number);
  return oklchAHex(L!, C!, H!);
}

describe("color de la barra del navegador", () => {
  it("coincide con el verde oscuro de la paleta", () => {
    // En Android, Chrome pinta la barra de direcciones con `meta.colorTema`.
    // Si no es exactamente el mismo verde que el pie de la invitación, queda
    // una franja que no encaja justo encima del contenido.
    expect(metadatos.colorTema).toBe(colorDeLaPaleta("--color-sage-deep"));
  });

  it("es un hex de seis dígitos, que es lo único que entiende `<meta>`", () => {
    expect(metadatos.colorTema).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("conversión oklch → hex", () => {
  it("convierte los colores conocidos de la paleta", () => {
    // Vectores fijos: si alguien toca la conversión, esto lo detiene antes de
    // que el test de arriba empiece a dar falsos positivos.
    expect(oklchAHex(0.36, 0.03, 166)).toBe("#2e4239"); // sage-deep
    expect(oklchAHex(0.72, 0.062, 78)).toBe("#baa079"); // gold
  });

  it("los extremos no se salen del rango", () => {
    expect(oklchAHex(0, 0, 0)).toBe("#000000");
    expect(oklchAHex(1, 0, 0)).toBe("#ffffff");
  });
});
