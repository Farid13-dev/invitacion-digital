import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Comun = {
  children: ReactNode;
  variante?: Variante;
  className?: string;
};

type PropsBoton = Comun & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type PropsEnlace = Comun & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type Variante = keyof typeof VARIANTES;

const BASE =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-7 py-3 " +
  "text-sm font-semibold shadow-boton " +
  "transition-[background-color,color,translate] duration-300 ease-out " +
  "hover:-translate-y-0.5 active:translate-y-0 " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oliva " +
  "disabled:pointer-events-none disabled:opacity-60";

/**
 * Las dos variantes son la misma pareja de colores invertida: el hover de una
 * es el reposo de la otra. Así, en un par de botones, el que tiene el puntero
 * encima siempre es el oliva —el "elegido"— y el ojo sabe dónde va el clic.
 */
const VARIANTES = {
  solido: "bg-oliva text-marfil hover:bg-mantequilla hover:text-oliva",
  suave: "bg-mantequilla text-oliva hover:bg-oliva hover:text-marfil",
} as const;

/**
 * Botón de la invitación, en versión `<button>` o `<a>` según reciba `href`.
 *
 * La unión discriminada evita el problema clásico de mezclar los atributos de
 * botón y de enlace en un solo tipo, que obliga a castear en cada uso: aquí,
 * pasar `target` sin `href` es un error de compilación.
 */
export function Boton(props: PropsBoton | PropsEnlace) {
  const { children, variante = "solido", className, ...resto } = props;
  const clases = cn(BASE, VARIANTES[variante], className);

  if (resto.href !== undefined) {
    const { href, target, rel, ...atributos } = resto as AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
    };

    return (
      <a
        href={href}
        target={target}
        // Un enlace que abre pestaña sin `noreferrer` deja a la página destino
        // acceso a `window.opener`. Se pone siempre, sin depender de recordarlo.
        rel={target === "_blank" ? cn("noopener noreferrer", rel) : rel}
        className={clases}
        {...atributos}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={clases} {...(resto as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
