import { useRef, type TouchEvent } from "react";
import type { ImagenResponsive } from "@/config/tipos";
import { useAtajosTeclado } from "@/hooks/useAtajosTeclado";
import { useBloqueoScroll } from "@/hooks/useBloqueoScroll";
import { Imagen } from "./Imagen";

type Props = {
  fotos: ImagenResponsive[];
  /** Índice visible, o `null` si el lightbox está cerrado. */
  indice: number | null;
  alCerrar: () => void;
  alAnterior: () => void;
  alSiguiente: () => void;
};

const UMBRAL_SWIPE_PX = 50;

const FLECHA =
  "absolute z-10 rounded-full p-2 text-cream/80 transition-colors hover:bg-cream/10 " +
  "hover:text-cream focus-visible:outline-2 focus-visible:outline-gold";

/** Visor a pantalla completa: teclado en escritorio, gestos en móvil. */
export function Lightbox({ fotos, indice, alCerrar, alAnterior, alSiguiente }: Props) {
  const abierto = indice !== null;
  const inicioX = useRef<number | null>(null);

  useBloqueoScroll(abierto);
  useAtajosTeclado(abierto, {
    Escape: alCerrar,
    ArrowLeft: alAnterior,
    ArrowRight: alSiguiente,
  });

  if (indice === null) return null;

  const foto = fotos[indice];
  if (!foto) return null;

  const alTocar = (e: TouchEvent) => {
    inicioX.current = e.touches[0]?.clientX ?? null;
  };

  const alSoltarTacto = (e: TouchEvent) => {
    if (inicioX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - inicioX.current;
    if (delta > UMBRAL_SWIPE_PX) alAnterior();
    if (delta < -UMBRAL_SWIPE_PX) alSiguiente();
    inicioX.current = null;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${indice + 1} de ${fotos.length}`}
      className="animate-fade-up fixed inset-0 z-[60] flex items-center justify-center bg-black/90 px-4"
      onClick={alCerrar}
      onTouchStart={alTocar}
      onTouchEnd={alSoltarTacto}
    >
      <button
        type="button"
        onClick={alCerrar}
        aria-label="Cerrar"
        className={`${FLECHA} right-5 top-5`}
      >
        <IconoCerrar />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          alAnterior();
        }}
        aria-label="Foto anterior"
        className={`${FLECHA} left-2 sm:left-6`}
      >
        <IconoFlecha direccion="izquierda" />
      </button>

      <Imagen
        imagen={foto}
        alt={`Recuerdo ${indice + 1} de ${fotos.length}`}
        sizes="90vw"
        loading="eager"
        className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl"
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          alSiguiente();
        }}
        aria-label="Foto siguiente"
        className={`${FLECHA} right-2 sm:right-6`}
      >
        <IconoFlecha direccion="derecha" />
      </button>

      <p className="absolute bottom-6 text-xs tracking-widest-xl text-cream/60">
        {indice + 1} / {fotos.length}
      </p>
    </div>
  );
}

function IconoCerrar() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function IconoFlecha({ direccion }: { direccion: "izquierda" | "derecha" }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d={direccion === "izquierda" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
