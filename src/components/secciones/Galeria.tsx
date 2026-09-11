import { useCallback, useState } from "react";
import { Imagen } from "@/components/ui/Imagen";
import { Lightbox } from "@/components/ui/Lightbox";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { ConfigEvento } from "@/config/tipos";
import { useCarruselArrastre } from "@/hooks/useCarruselArrastre";

const FLECHA_CARRUSEL =
  "absolute top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-cream/80 p-2 text-sage-deep " +
  "shadow-md transition-transform hover:scale-110 focus-visible:outline-2 " +
  "focus-visible:outline-gold sm:flex";

export function Galeria({ galeria }: { galeria: ConfigEvento["galeria"] }) {
  const { fotos } = galeria;
  const { pista, desplazar, huboArrastre, manejadores } = useCarruselArrastre();
  const [ampliada, setAmpliada] = useState<number | null>(null);

  const anterior = useCallback(
    () => setAmpliada((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length],
  );

  const siguiente = useCallback(
    () => setAmpliada((i) => (i === null ? null : (i + 1) % fotos.length)),
    [fotos.length],
  );

  return (
    <section className="bg-sage py-24">
      <div className="px-6">
        <TituloSeccion tono="claro" subtitulo={galeria.subtitulo}>
          {galeria.titulo}
        </TituloSeccion>
      </div>

      <div className="relative mt-12">
        <button
          type="button"
          onClick={() => desplazar(-1)}
          aria-label="Ver fotos anteriores"
          className={`${FLECHA_CARRUSEL} left-2`}
        >
          <Chevron direccion="izquierda" />
        </button>

        <div
          ref={pista}
          {...manejadores}
          className="flex snap-x snap-mandatory cursor-grab select-none items-center gap-4 overflow-x-auto px-6 pb-4 active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((foto, i) => (
            <button
              key={foto.img.src}
              type="button"
              onClick={() => {
                // Soltar el ratón tras arrastrar no debe abrir el visor.
                if (huboArrastre()) return;
                setAmpliada(i);
              }}
              aria-label={`Ver foto ${i + 1} en grande`}
              className="group relative h-[26rem] flex-none snap-center overflow-hidden rounded-2xl shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Imagen
                imagen={foto}
                alt={`Recuerdo ${i + 1}`}
                sizes="(max-width: 640px) 70vw, 380px"
                className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />

              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
                <svg
                  className="h-8 w-8 text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  <path d="M11 8v6M8 11h6" strokeLinecap="round" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => desplazar(1)}
          aria-label="Ver más fotos"
          className={`${FLECHA_CARRUSEL} right-2`}
        >
          <Chevron direccion="derecha" />
        </button>
      </div>

      <Lightbox
        fotos={fotos}
        indice={ampliada}
        alCerrar={() => setAmpliada(null)}
        alAnterior={anterior}
        alSiguiente={siguiente}
      />
    </section>
  );
}

function Chevron({ direccion }: { direccion: "izquierda" | "derecha" }) {
  return (
    <svg
      width="22"
      height="22"
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
