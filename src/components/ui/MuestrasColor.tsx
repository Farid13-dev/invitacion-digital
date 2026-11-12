import type { Detalle } from "@/config/tipos";
import { cn } from "@/lib/cn";

type Props = {
  colores: NonNullable<Detalle["coloresEvitar"]>;
  className?: string;
};

/**
 * Círculos de color tachados: los tonos que se pide no llevar.
 *
 * El nombre va siempre escrito debajo, y no solo como texto alternativo: un
 * círculo blanco sobre fondo marfil, o un amarillo en una pantalla con el
 * brillo al mínimo, no se distinguen sin él.
 *
 * Dos columnas siempre: en la tarjeta más estrecha (un móvil de 320 px) cuatro
 * en fila obligaban a encoger los nombres hasta hacerlos ilegibles.
 */
export function MuestrasColor({ colores, className }: Props) {
  return (
    <ul
      aria-label="Colores a evitar"
      className={cn("mx-auto grid w-fit grid-cols-2 gap-x-8 gap-y-4", className)}
    >
      {colores.map((c) => (
        <li key={c.nombre} className="flex flex-col items-center gap-1.5">
          <span
            className="relative block size-11 overflow-hidden rounded-full shadow-sm ring-1 ring-oliva/20"
            style={{ backgroundColor: c.color }}
          >
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-0.5 w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-oliva/75"
            />
          </span>
          <span className="text-xs text-oliva/80">{c.nombre}</span>
        </li>
      ))}
    </ul>
  );
}
