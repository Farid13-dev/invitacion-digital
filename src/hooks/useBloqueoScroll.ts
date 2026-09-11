import { useEffect } from "react";

/**
 * Congela el scroll del fondo mientras hay un modal o el lightbox abiertos.
 *
 * Cuenta cuántos overlays lo piden a la vez: si el invitado abre el lightbox
 * desde dentro de un modal, cerrar solo el de arriba no debe devolver el
 * scroll mientras el otro sigue abierto.
 */
let abiertos = 0;
let overflowOriginal = "";

export function useBloqueoScroll(activo: boolean): void {
  useEffect(() => {
    if (!activo) return;

    if (abiertos === 0) {
      overflowOriginal = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    abiertos += 1;

    return () => {
      abiertos -= 1;
      if (abiertos === 0) document.body.style.overflow = overflowOriginal;
    };
  }, [activo]);
}
