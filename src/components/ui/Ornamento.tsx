import hojas from "@/assets/ornamentos/hojas.png?w=320;640&format=avif;webp;png&as=picture";
import { cn } from "@/lib/cn";
import { Imagen } from "./Imagen";

/**
 * Rama decorativa que se asoma por las esquinas de cada sección.
 *
 * Es puramente ornamental: va con `alt=""` y `aria-hidden` para que un lector
 * de pantalla no anuncie diez "imagen" seguidos, y con `pointer-events-none`
 * para que no robe clics a los botones que quedan debajo.
 *
 * `visible` marca los dos que salen en la pantalla de bienvenida. Son las
 * únicas imágenes que el invitado ve al abrir el enlace, así que se cargan de
 * inmediato en vez de esperar a que entren en el viewport — que ya lo están.
 */
export function Ornamento({
  className,
  visible = false,
}: {
  className?: string;
  visible?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute select-none motion-safe:animate-sway", className)}
    >
      <Imagen
        imagen={hojas}
        alt=""
        sizes="(max-width: 640px) 220px, 380px"
        loading={visible ? "eager" : "lazy"}
        fetchPriority={visible ? "high" : undefined}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
