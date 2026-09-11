import hojas from "@/assets/ornamentos/hojas.png?w=320;640&format=avif;webp;png&as=picture";
import { cn } from "@/lib/cn";
import { Imagen } from "./Imagen";

/**
 * Rama decorativa que se asoma por las esquinas de cada sección.
 *
 * Es puramente ornamental: va con `alt=""` y `aria-hidden` para que un lector
 * de pantalla no anuncie diez "imagen" seguidos, y con `pointer-events-none`
 * para que no robe clics a los botones que quedan debajo.
 */
export function Ornamento({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute select-none motion-safe:animate-sway", className)}
    >
      <Imagen
        imagen={hojas}
        alt=""
        sizes="(max-width: 640px) 220px, 380px"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
