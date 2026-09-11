import type { ImagenResponsive } from "@/config/tipos";

type Props = {
  imagen: ImagenResponsive;
  /** Vacío ("") para imágenes puramente decorativas. */
  alt: string;
  /** Ancho que ocupará la imagen, para que el navegador elija la variante justa. */
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
};

/**
 * Imagen responsive con AVIF → WebP → JPG.
 *
 * Las variantes las genera vite-imagetools en el build a partir del import
 * (`?w=...&format=avif;webp;jpg&as=picture`), y el navegador descarga solo la
 * primera que entiende en el tamaño que necesita. Sobre la portada de ejemplo,
 * el AVIF pesa la mitad que el JPG equivalente.
 *
 * `width`/`height` son los del original: fijan la relación de aspecto y evitan
 * que el texto salte cuando la foto termina de cargar.
 */
export function Imagen({
  imagen,
  alt,
  sizes = "100vw",
  className,
  loading = "lazy",
  fetchPriority,
}: Props) {
  return (
    <picture>
      {Object.entries(imagen.sources).map(([formato, srcSet]) => (
        <source key={formato} type={`image/${formato}`} srcSet={srcSet} sizes={sizes} />
      ))}
      <img
        src={imagen.img.src}
        width={imagen.img.w}
        height={imagen.img.h}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        draggable={false}
        className={className}
      />
    </picture>
  );
}
