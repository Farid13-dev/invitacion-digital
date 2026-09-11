import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { ConfigEvento } from "@/config/tipos";

type Props = Pick<ConfigEvento, "pareja" | "cierre" | "portada">;

export function Cierre({ pareja, cierre, portada }: Props) {
  return (
    <>
      <section className="px-6 py-24 text-center">
        <TituloSeccion>{cierre.mensaje}</TituloSeccion>
        <p className="mt-8 font-display text-3xl text-gold">{cierre.hashtag}</p>
      </section>

      <footer className="bg-sage-deep py-10 text-center">
        <p className="font-script text-3xl text-cream">
          {pareja.nombreA} &amp; {pareja.nombreB}
        </p>
        <p className="mt-2 text-[0.65rem] uppercase tracking-widest-xl text-gold-soft">
          {portada.fechaCorta}
        </p>
      </footer>
    </>
  );
}
