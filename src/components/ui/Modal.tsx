import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useAtajosTeclado } from "@/hooks/useAtajosTeclado";
import { useBloqueoScroll } from "@/hooks/useBloqueoScroll";

type Props = {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: ReactNode;
};

const FOCUSABLES =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible.
 *
 * Además de verse bien hace las cuatro cosas que un modal debe hacer y que la
 * primera versión de este proyecto no hacía: cerrarse con Escape, atrapar el
 * foco mientras está abierto, devolver el foco al elemento que lo abrió y
 * bloquear el scroll del fondo.
 */
export function Modal({ abierto, alCerrar, titulo, children }: Props) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);

  useBloqueoScroll(abierto);
  useAtajosTeclado(abierto, { Escape: alCerrar });

  useEffect(() => {
    if (!abierto) return;

    focoPrevio.current = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    return () => {
      // Devolver el foco a quien abrió el modal: sin esto, quien navega con
      // teclado vuelve al principio de la página cada vez que cierra uno.
      focoPrevio.current?.focus?.();
    };
  }, [abierto]);

  if (!abierto) return null;

  const atraparTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panel.current) return;

    const focusables = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLES));
    if (focusables.length === 0) return;

    const primero = focusables[0]!;
    const ultimo = focusables[focusables.length - 1]!;
    const activo = document.activeElement;

    if (e.shiftKey && (activo === primero || activo === panel.current)) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && activo === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={alCerrar}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={atraparTab}
        className="animate-fade-up relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-cream/20 bg-sage-deep p-8 text-cream shadow-2xl outline-none"
      >
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar"
          className="absolute right-5 top-4 rounded-full p-1 text-2xl leading-none text-cream/60 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-gold"
        >
          ✕
        </button>

        <h3 id={idTitulo} className="mb-6 text-center font-script text-3xl text-gold-soft">
          {titulo}
        </h3>

        <div className="text-center text-sm font-light leading-relaxed text-cream/90">
          {children}
        </div>
      </div>
    </div>
  );
}
