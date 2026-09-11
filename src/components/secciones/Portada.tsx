import { Imagen } from "@/components/ui/Imagen";
import { Ornamento } from "@/components/ui/Ornamento";
import type { ConfigEvento } from "@/config/tipos";

type Props = Pick<ConfigEvento, "pareja" | "portada">;

export function Portada({ pareja, portada }: Props) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <Imagen
        imagen={portada.imagen}
        alt={`${pareja.nombreA} y ${pareja.nombreB}`}
        sizes="100vw"
        // Es la imagen más grande y la primera que se ve. Cargarla con `lazy`
        // solo retrasaría el LCP: aquí la prioridad es lo contrario.
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-sage-deep/80" />

      <Ornamento className="-left-20 -top-24 h-[22rem] w-[22rem] opacity-30" />
      <Ornamento className="-bottom-24 -right-20 h-[24rem] w-[24rem] rotate-180 opacity-30" />

      <div className="animate-fade-up relative z-10 px-6 text-center">
        <div className="flex items-center justify-center gap-4 text-cream/80">
          <span className="h-px w-12 bg-cream/40" />
          <span className="text-xs tracking-widest-xl">{portada.fechaCorta}</span>
          <span className="h-px w-12 bg-cream/40" />
        </div>

        <h1 className="mt-6 font-script text-6xl leading-[1.05] text-cream sm:text-8xl">
          {pareja.nombreA}{" "}
          <span className="align-middle font-display text-4xl text-gold-soft sm:text-5xl">&</span>{" "}
          {pareja.nombreB}
        </h1>

        <figure className="mx-auto mt-10 max-w-xl">
          <span
            aria-hidden="true"
            className="block font-script text-6xl leading-none text-gold-soft"
          >
            &ldquo;
          </span>
          <blockquote className="-mt-6 font-display text-2xl font-light italic leading-relaxed text-cream/90">
            {portada.frase}
          </blockquote>
          <span
            aria-hidden="true"
            className="block font-script text-6xl leading-none text-gold-soft"
          >
            &rdquo;
          </span>
        </figure>

        <div className="mt-12 flex justify-center text-cream/70 motion-safe:animate-bob">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}
