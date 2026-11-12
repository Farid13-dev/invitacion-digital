import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Ola de mantequilla a rosa que separa las secciones.
 *
 * El id del degradado sale de `useId` y no es fijo: con tres olas en la
 * página, un id repetido haría que todas pintaran con el degradado de la
 * primera, y si esa se desmontara las demás se quedarían sin color.
 */
export function Ola({ invertida = false, className }: { invertida?: boolean; className?: string }) {
  const id = `ola-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      className={cn("block h-28 w-full md:h-44", invertida && "-scale-x-100", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-mantequilla)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-rosa-claro)" }} />
        </linearGradient>
      </defs>
      <path
        d="M0 120 C 300 20, 520 40, 760 110 S 1200 200, 1440 40 L1440 90 C 1200 230, 950 190, 720 150 S 260 120, 0 200 Z"
        fill={`url(#${id})`}
      />
      <path
        d="M0 110 C 300 10, 520 30, 760 100 S 1200 190, 1440 30 L1440 50 C 1200 200, 950 160, 720 125 S 260 60, 0 140 Z"
        className="fill-mantequilla"
        opacity="0.7"
      />
    </svg>
  );
}

const HILOS = {
  doble: [
    "M0 60 C 360 0, 720 120, 1080 40 S 1440 70, 1440 70",
    "M0 80 C 400 120, 700 10, 1100 80 S 1440 30, 1440 30",
  ],
  simple: ["M0 70 C 500 -10, 900 90, 1440 20"],
} as const;

/** Hilos rosas finos que cruzan una sección de lado a lado. */
export function Hilos({
  variante = "doble",
  className,
}: {
  variante?: keyof typeof HILOS;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={cn("pointer-events-none absolute inset-x-0 w-full text-rosa-claro", className)}
    >
      {HILOS[variante].map((d, i) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          opacity={i === 0 ? 1 : 0.6}
        />
      ))}
    </svg>
  );
}
