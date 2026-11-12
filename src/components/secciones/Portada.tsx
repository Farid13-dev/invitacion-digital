import type { CSSProperties } from "react";
import { Imagen } from "@/components/ui/Imagen";
import { NombresPareja } from "@/components/ui/NombresPareja";
import { Ola } from "@/components/ui/Ondas";
import { Ramo } from "@/components/ui/Ornamento";
import type { ConfigEvento } from "@/config/tipos";
import { cn } from "@/lib/cn";

type Props = Pick<ConfigEvento, "pareja" | "portada"> & {
  /**
   * `false` mientras el portón de entrada la tapa. La entrada escalonada
   * espera a que el invitado la vea: animarla detrás del portón era gastarla
   * sin público.
   */
  revelada: boolean;
};

export function Portada({ pareja, portada, revelada }: Props) {
  const entrada = (
    retrasoMs: number,
    clases?: string,
  ): { className: string; style?: CSSProperties } => ({
    className: cn(clases, revelada ? "animate-fade-up" : "opacity-0"),
    style: revelada ? { animationDelay: `${retrasoMs}ms` } : undefined,
  });

  return (
    <section className="relative">
      <div className="grid md:grid-cols-2">
        {/* La foto se recorta con una elipse anclada arriba a la izquierda:
            el borde curvo es el que se funde con la ola de abajo. */}
        <div className="relative h-[60vh] md:h-[80vh]">
          <Imagen
            imagen={portada.imagen}
            alt={`${pareja.nombreA} y ${pareja.nombreB}`}
            sizes="(min-width: 768px) 50vw, 100vw"
            // `eager` para que esté lista al pulsar "Ingresar", pero con
            // prioridad baja: mientras se ve el portón, la foto está tapada y
            // pedirla en alta le robaba el ancho de banda a lo que sí se ve.
            loading="eager"
            fetchPriority="low"
            className="h-full w-full object-cover [clip-path:ellipse(100%_100%_at_0%_0%)] md:[clip-path:ellipse(98%_120%_at_0%_0%)]"
            style={{ objectPosition: portada.encuadre }}
          />
        </div>

        {/* `pb-28`/`md:pb-36`: la ola de abajo sube sobre esta sección, y sin
            ese margen tapaba la cita. */}
        <div className="flex flex-col items-center justify-center px-6 pb-28 pt-10 text-center md:pb-36">
          <div {...entrada(100, "flex flex-col items-center")}>
            <Ramo className="w-36 -scale-x-100 motion-safe:animate-flotar md:w-48" />
            <span aria-hidden="true" className="mt-2 block h-px w-48 bg-borde" />
            <p className="mt-3 text-base tracking-[0.25em] text-tenue">{portada.fechaCorta}</p>
          </div>

          <div {...entrada(250, "mt-4")}>
            <NombresPareja pareja={pareja} />
          </div>

          <figure {...entrada(400, "mt-8 max-w-md")}>
            <blockquote className="text-base text-pretty text-tenue">
              <span
                aria-hidden="true"
                className="block font-display text-3xl leading-none text-rosa"
              >
                &ldquo;
              </span>
              {portada.frase}
              <span
                aria-hidden="true"
                className="block font-display text-3xl leading-none text-rosa"
              >
                &rdquo;
              </span>
            </blockquote>
            {portada.fraseFuente ? (
              <figcaption className="text-xs tracking-[0.2em] text-tenue">
                {portada.fraseFuente}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </div>

      <Ola className="-mt-20 md:-mt-32" />
    </section>
  );
}
