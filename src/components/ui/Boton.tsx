import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Comun = {
  children: ReactNode;
  variante?: "solido" | "contorno";
  className?: string;
};

type PropsBoton = Comun & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type PropsEnlace = Comun & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const BASE =
  "inline-flex cursor-pointer items-center justify-center rounded-full px-8 py-3 " +
  "text-[0.68rem] uppercase tracking-widest-xl transition-all duration-300 " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTES = {
  solido: "bg-gold text-cream hover:bg-gold-soft hover:text-sage-deep",
  contorno: "border border-gold text-gold hover:bg-gold hover:text-cream",
} as const;

/**
 * Botón dorado, en versión `<button>` o `<a>` según reciba `href`.
 *
 * La unión discriminada evita el problema de la primera versión, donde el tipo
 * era la unión de atributos de botón y de enlace y había que castear en cada
 * uso: aquí, pasar `target` sin `href` es un error de compilación.
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
