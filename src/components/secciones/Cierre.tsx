import { Boton } from "@/components/ui/Boton";
import { NombresPareja } from "@/components/ui/NombresPareja";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { ConfigEvento } from "@/config/tipos";
import { urlCalendario, urlHashtagInstagram } from "@/lib/enlaces";

type Props = Pick<ConfigEvento, "pareja" | "cierre" | "eventos"> & {
  /** Si hay tarjeta de canciones, el pie enlaza a ella. */
  hayCancion: boolean;
};

// `py-2.5` lleva cada enlace a ~44 px de alto: el mínimo cómodo para el dedo.
const ENLACE = "py-2.5 transition-colors hover:text-oliva focus-visible:text-oliva";

export function Cierre({ pareja, cierre, eventos, hayCancion }: Props) {
  return (
    <>
      {/* El hashtag, sobre la banda durazno ondulada. */}
      <section className="banda-durazno px-6 py-24 text-center md:py-36">
        <TituloSeccion subtitulo={cierre.subtitulo} icono="instagram">
          {cierre.mensaje}
        </TituloSeccion>
        <p className="mt-3 font-display text-4xl text-oliva">{cierre.hashtag}</p>
        <Boton href={urlHashtagInstagram(cierre.hashtag)} target="_blank" className="mt-5">
          Ver en Instagram
        </Boton>
      </section>

      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-10 px-6 py-20 md:flex-row">
        <NombresPareja pareja={pareja} como="p" tamano="mediano" />

        <nav
          aria-label="Atajos"
          className="flex flex-col items-center text-base text-tenue md:items-end"
        >
          <a href="#rsvp" className={ENLACE}>
            Confirmar asistencia
          </a>
          {hayCancion ? (
            <a href="#cancion" className={ENLACE}>
              Sugerir canción
            </a>
          ) : null}
          {eventos.map((evento) => (
            <a
              key={evento.id}
              href={urlCalendario(evento)}
              target="_blank"
              rel="noopener noreferrer"
              className={ENLACE}
            >
              Agendar {evento.titulo.toLowerCase()}
            </a>
          ))}
        </nav>
      </div>

      <footer className="bg-oliva px-6 py-6 text-center text-sm text-marfil">
        Hecho con{" "}
        <span aria-label="amor" role="img">
          ♥
        </span>{" "}
        para {pareja.nombreA} &amp; {pareja.nombreB}
      </footer>
    </>
  );
}
