/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RSVP_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Tipo de los imports de imágenes procesados por vite-imagetools con
 * `?...&as=picture`. El paquete no publica estas declaraciones, así que la
 * forma del objeto se declara aquí (verificada contra la salida real del
 * plugin: `{ sources: { avif, webp, jpeg }, img: { src, w, h } }`).
 */
declare module "*&as=picture" {
  const imagen: {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number };
  };
  export default imagen;
}
