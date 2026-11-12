import { useCallback, useEffect, useState } from "react";
import { Imagen } from "@/components/ui/Imagen";
import { Lightbox } from "@/components/ui/Lightbox";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { ConfigEvento } from "@/config/tipos";

const INTERVALO_MS = 4500;

/**
 * Polaroids que avanzan solas, de una en una.
 *
 * Cuánto se desplaza cada paso depende de cuántas fotos caben a la vez —una
 * en móvil, dos en tableta, tres en escritorio—, así que el paso es una
 * variable CSS por breakpoint y no un tercio fijo: con un tercio fijo, en
 * móvil cada avance movía la foto a medias.
 *
 * La tira lleva las fotos dos veces seguidas para que al llegar a la última
 * los huecos de la derecha no queden vacíos.
 */
export function Galeria({ galeria }: { galeria: ConfigEvento["galeria"] }) {
  const { fotos } = galeria;
  const [actual, setActual] = useState(0);
  const [pausada, setPausada] = useState(false);
  const [ampliada, setAmpliada] = useState<number | null>(null);

  useEffect(() => {
    if (pausada || ampliada !== null || fotos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => setActual((i) => (i + 1) % fotos.length), INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [pausada, ampliada, fotos.length]);

  const mover = useCallback(
    (paso: number) =>
      setAmpliada((i) => (i === null ? null : (i + paso + fotos.length) % fotos.length)),
    [fotos.length],
  );

  return (
    <section className="pb-16 text-center md:pb-24">
      <TituloSeccion subtitulo={galeria.subtitulo} icono="camara" className="px-6">
        {galeria.titulo}
      </TituloSeccion>

      <div
        className="mt-8 overflow-hidden"
        onMouseEnter={() => setPausada(true)}
        onMouseLeave={() => setPausada(false)}
        onFocus={() => setPausada(true)}
        onBlur={() => setPausada(false)}
      >
        <div
          className="flex transition-transform duration-700 [--paso:100%] sm:[--paso:50%] md:[--paso:calc(100%/3)]"
          style={{ transform: `translateX(calc(var(--paso) * ${-actual}))` }}
        >
          {[...fotos, ...fotos].map((foto, i) => {
            const indice = i % fotos.length;
            const copia = i >= fotos.length;
            return (
              <div
                key={i}
                aria-hidden={copia || undefined}
                className="w-full shrink-0 p-2 sm:w-1/2 md:w-1/3"
              >
                <button
                  type="button"
                  tabIndex={copia ? -1 : undefined}
                  onClick={() => setAmpliada(indice)}
                  aria-label={`Ver foto ${indice + 1} en grande`}
                  className="block w-full cursor-zoom-in bg-tarjeta p-3 pb-10 shadow-md transition-transform duration-300 hover:-rotate-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosa"
                >
                  <Imagen
                    imagen={foto}
                    alt={`Recuerdo ${indice + 1}`}
                    sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        {fotos.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir a la foto ${i + 1}`}
            aria-current={i === actual || undefined}
            onClick={() => setActual(i)}
            className="group flex size-11 items-center justify-center"
          >
            <span
              className={`h-2 rounded-full transition-all ${i === actual ? "w-6 bg-rosa" : "w-2 bg-rosa-claro/50 group-hover:bg-rosa-claro"}`}
            />
          </button>
        ))}
      </div>

      <Lightbox
        fotos={fotos}
        indice={ampliada}
        alCerrar={() => setAmpliada(null)}
        alAnterior={() => mover(-1)}
        alSiguiente={() => mover(1)}
      />
    </section>
  );
}
