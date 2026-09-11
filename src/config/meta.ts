/**
 * Metadatos de la página: lo que se ve en la pestaña del navegador, en Google
 * y —lo que más importa aquí— en la vista previa cuando alguien pega el enlace
 * en WhatsApp.
 *
 * Vive separado de `evento.ts` por una razón técnica: los rastreadores de
 * WhatsApp, Facebook y Twitter **no ejecutan JavaScript**. Si estas etiquetas
 * se pusieran desde React, la vista previa saldría vacía. Por eso este archivo
 * no importa nada de Vite y `vite.config.ts` puede leerlo para inyectarlas en
 * el HTML durante el build.
 *
 * Junto con `evento.ts`, es uno de los dos únicos archivos que hay que tocar
 * para un evento nuevo.
 */
export const meta = {
  idioma: "es",

  titulo: "Valentina & Mateo — Invitación de Matrimonio · 15.05.2027",

  descripcion:
    "Nos casamos. Acompáñanos el sábado 15 de mayo de 2027 en Medellín. Confirma tu asistencia.",

  /**
   * Dominio público, sin barra final. Debe ser absoluto: las etiquetas
   * Open Graph con rutas relativas se ignoran.
   *
   * No se lee de `.env` a propósito: este archivo lo importan tanto Vite
   * (Node) como el navegador, y `process.env` no existe en el segundo.
   */
  sitioUrl: "https://invitacion-digital.vercel.app",

  /**
   * Imagen de la vista previa, bajo `public/`.
   * Formato recomendado: 1200 × 630 px, menos de 300 KB.
   */
  imagenOg: "/og.jpg",

  /** Color de la barra del navegador en móvil. */
  colorTema: "#3d4a3f",
} as const;
