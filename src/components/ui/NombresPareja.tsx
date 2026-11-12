import type { Pareja } from "@/config/tipos";
import { cn } from "@/lib/cn";

/**
 * Tamaño de los nombres. Cada nombre va entero en una línea, así que el
 * límite lo pone el más largo ("Claudia Patricia" mide 6.5 em en Overlock):
 *
 *  - `grande` ocupa toda la columna en móvil (12vw cabe hasta en 320 px) y,
 *    desde `md`, media pantalla en la portada a dos columnas (6.5vw).
 *  - `mediano` es el del pie, que comparte fila con los atajos.
 *
 * Si los nombres de otra pareja son más largos, baja estos vw.
 */
const TAMANOS = {
  grande: "text-[clamp(2.4rem,12vw,4.5rem)] md:text-[clamp(3rem,6.5vw,5.5rem)]",
  mediano: "text-[clamp(2.2rem,10vw,4rem)]",
} as const;

type Props = {
  pareja: Pareja;
  tamano?: keyof typeof TAMANOS;
  /** `h1` en la portada; `p` en el portón y el pie, que no son el título. */
  como?: "h1" | "p";
  className?: string;
};

/**
 * Los nombres en rosa, uno sobre otro, con un "&" enorme en mantequilla
 * detrás que los abraza a los dos.
 *
 * El "&" se mide en `em`, relativo a los nombres: así crece y se encoge con
 * ellos sin una segunda escala que mantener sincronizada. Queda fuera del
 * árbol de accesibilidad y un lector de pantalla oye "y" en su lugar.
 */
export function NombresPareja({
  pareja,
  tamano = "grande",
  como: Etiqueta = "h1",
  className,
}: Props) {
  return (
    <Etiqueta
      className={cn(
        "relative isolate text-center font-display font-bold leading-[0.95] text-rosa",
        TAMANOS[tamano],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none text-[2.4em] leading-none text-mantequilla"
      >
        &amp;
      </span>
      <span className="block whitespace-nowrap">{pareja.nombreA}</span>
      <span className="sr-only"> y </span>
      <span className="block whitespace-nowrap">{pareja.nombreB}</span>
    </Etiqueta>
  );
}
