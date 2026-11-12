import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
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
 * Además de verse bien hace las cuatro cosas que un modal debe hacer y que casi
 * ningún modal casero hace: cerrarse con Escape, atrapar el foco mientras está
 * abierto, devolver el foco al elemento que lo abrió y bloquear el scroll del
 * fondo.
 */
export function Modal({ abierto, alCerrar, titulo, children }: Props) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const focoPrevio = useRef<HTMLElement | null>(null);
  const inicioEnElFondo = useRef(false);

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

  // Cerrar en el `click` del fondo no basta: si alguien selecciona el texto
  // del formulario y suelta el ratón fuera del panel, el click cae en el
  // fondo y el modal se cierra llevándose lo que había escrito. Solo cuenta
  // si el gesto empezó y terminó en el fondo.
  const gestoEnElFondo = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) inicioEnElFondo.current = true;
  };

  const cerrarSiVieneDelFondo = (e: MouseEvent<HTMLDivElement>) => {
    const desdeElFondo = inicioEnElFondo.current && e.target === e.currentTarget;
    inicioEnElFondo.current = false;
    if (desdeElFondo) alCerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-oliva/40 p-4 backdrop-blur-sm"
      onMouseDown={gestoEnElFondo}
      onClick={cerrarSiVieneDelFondo}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={atraparTab}
        className="animate-fade-up relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-marfil px-6 pb-8 pt-10 text-center sm:px-10 shadow-2xl outline-none"
      >
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-1 text-tenue transition-colors hover:text-oliva focus-visible:outline-2 focus-visible:outline-oliva"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <h3 id={idTitulo} className="font-display text-3xl text-rosa">
          {titulo}
        </h3>

        <div className="mt-4 text-base leading-relaxed text-tenue">{children}</div>
      </div>
    </div>
  );
}
