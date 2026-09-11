import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { imagetools } from "vite-imagetools";
import { meta } from "./src/config/meta";

/**
 * Inyecta el `<title>` y las etiquetas Open Graph en el HTML durante el build.
 *
 * No se pueden poner desde React: los rastreadores de WhatsApp y Facebook no
 * ejecutan JavaScript, así que verían la página vacía y la vista previa del
 * enlace saldría en blanco. Leerlas de `src/config/meta.ts` mantiene el título
 * de la pestaña, el de Google y el de la vista previa en un único sitio.
 */
function metadatosDelEvento(): Plugin {
  const urlAbsoluta = (ruta: string) => `${meta.sitioUrl.replace(/\/$/, "")}${ruta}`;

  const porNombre = [
    ["description", meta.descripcion],
    ["theme-color", meta.colorTema],
    ["twitter:card", "summary_large_image"],
    ["twitter:title", meta.titulo],
    ["twitter:description", meta.descripcion],
    ["twitter:image", urlAbsoluta(meta.imagenOg)],
  ] as const;

  const porPropiedad = [
    ["og:type", "website"],
    ["og:locale", "es_CO"],
    ["og:title", meta.titulo],
    ["og:description", meta.descripcion],
    ["og:url", meta.sitioUrl],
    ["og:image", urlAbsoluta(meta.imagenOg)],
    ["og:image:width", "1200"],
    ["og:image:height", "630"],
  ] as const;

  return {
    name: "metadatos-del-evento",
    transformIndexHtml: {
      order: "pre",
      handler: (html: string) => ({
        html,
        tags: [
          { tag: "title", children: meta.titulo, injectTo: "head" as const },
          ...porNombre.map(([name, content]) => ({
            tag: "meta",
            attrs: { name, content },
            injectTo: "head" as const,
          })),
          ...porPropiedad.map(([property, content]) => ({
            tag: "meta",
            attrs: { property, content },
            injectTo: "head" as const,
          })),
        ],
      }),
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Resuelve los `?w=…&format=avif;webp;jpg&as=picture` de los imports de
    // imágenes: genera cada variante durante el build y las sirve con hash
    // inmutable, para que el navegador descargue solo la que necesita.
    imagetools(),
    metadatosDelEvento(),
  ],

  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },

  server: { port: 8080, host: true },
  preview: { port: 8080 },

  build: {
    target: "es2022",
    // La invitación es una sola vista: partir el CSS solo añadiría una cascada
    // de peticiones en la conexión móvil desde la que la abre casi todo el mundo.
    cssCodeSplit: false,
  },
});
