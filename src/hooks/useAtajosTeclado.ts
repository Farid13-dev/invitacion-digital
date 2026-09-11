import { useEffect, useRef } from "react";

type Atajos = Partial<Record<"Escape" | "ArrowLeft" | "ArrowRight", () => void>>;

/**
 * Atajos de teclado para modales y lightbox.
 *
 * Los manejadores se guardan en una ref y el listener se registra una sola vez
 * por apertura: así las funciones siempre son las del último render sin tener
 * que desmontar y volver a montar el listener en cada pulsación de estado.
 */
export function useAtajosTeclado(activo: boolean, atajos: Atajos): void {
  const ref = useRef(atajos);

  useEffect(() => {
    ref.current = atajos;
  });

  useEffect(() => {
    if (!activo) return;

    const alPulsar = (e: KeyboardEvent) => {
      const accion = ref.current[e.key as keyof Atajos];
      if (!accion) return;
      e.preventDefault();
      accion();
    };

    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [activo]);
}
