import { useCallback, useRef, type MouseEvent } from "react";

const UMBRAL_ARRASTRE_PX = 5;

/**
 * Carrusel arrastrable con el ratón.
 *
 * En móvil el scroll táctil nativo ya funciona; en escritorio, en cambio, una
 * fila con `overflow-x: auto` solo se mueve con la rueda o la barra, que casi
 * nadie descubre. Esto la hace arrastrable como una galería de fotos.
 *
 * `huboArrastre()` distingue un arrastre de un clic: sin eso, soltar el ratón
 * al final de un desplazamiento abría el lightbox de la foto que quedara debajo.
 */
export function useCarruselArrastre() {
  const pista = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);
  const inicioX = useRef(0);
  const scrollInicial = useRef(0);
  const seMovio = useRef(false);

  const alPresionar = useCallback((e: MouseEvent) => {
    if (!pista.current) return;
    arrastrando.current = true;
    seMovio.current = false;
    inicioX.current = e.pageX;
    scrollInicial.current = pista.current.scrollLeft;
  }, []);

  const alMover = useCallback((e: MouseEvent) => {
    if (!arrastrando.current || !pista.current) return;
    const delta = e.pageX - inicioX.current;
    if (Math.abs(delta) > UMBRAL_ARRASTRE_PX) seMovio.current = true;
    pista.current.scrollLeft = scrollInicial.current - delta;
  }, []);

  const alSoltar = useCallback(() => {
    arrastrando.current = false;
  }, []);

  /** Avanza o retrocede aproximadamente una tarjeta. */
  const desplazar = useCallback((direccion: 1 | -1) => {
    if (!pista.current) return;
    const paso = pista.current.clientWidth * 0.7;
    pista.current.scrollBy({ left: direccion * paso, behavior: "smooth" });
  }, []);

  const huboArrastre = useCallback(() => seMovio.current, []);

  return {
    pista,
    desplazar,
    huboArrastre,
    manejadores: {
      onMouseDown: alPresionar,
      onMouseMove: alMover,
      onMouseUp: alSoltar,
      onMouseLeave: alSoltar,
    },
  };
}
