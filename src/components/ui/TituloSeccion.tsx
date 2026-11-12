import type { NombreIcono } from "@/config/tipos";
import { cn } from "@/lib/cn";
import { Icono } from "./Icono";

type Props = {
  children: string;
  subtitulo?: string;
  /** Icono rosa bajo el subtítulo, como en la referencia. */
  icono?: NombreIcono;
  className?: string;
};

export function TituloSeccion({ children, subtitulo, icono, className }: Props) {
  return (
    <div className={cn("relative text-center", className)}>
      <h2 className="font-display text-4xl text-balance text-oliva">{children}</h2>
      {subtitulo ? (
        <p className="mx-auto mt-3 max-w-2xl text-base text-pretty text-tenue">{subtitulo}</p>
      ) : null}
      {icono ? <Icono nombre={icono} className="mx-auto mt-4 size-10 text-rosa-claro" /> : null}
    </div>
  );
}
