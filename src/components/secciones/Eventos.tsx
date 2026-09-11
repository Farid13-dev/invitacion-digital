import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { Ornamento } from "@/components/ui/Ornamento";
import type { EventoDelDia } from "@/config/tipos";
import { urlCalendario, urlMapaEmbebido, urlMapaExterno } from "@/lib/enlaces";

/**
 * Ceremonia y celebración: cuándo, dónde y los dos atajos que de verdad usa un
 * invitado — agendarlo y saber cómo llegar.
 *
 * El mapa vive en un modal y no incrustado en la tarjeta: un `<iframe>` de
 * Google Maps por evento carga cientos de kilobytes de scripts de terceros que
 * la mayoría de invitados no llega a abrir.
 */
export function Eventos({ eventos }: { eventos: EventoDelDia[] }) {
  const [mapaAbierto, setMapaAbierto] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden bg-sage px-6 py-24">
      <Ornamento className="-bottom-16 -left-16 h-64 w-64 opacity-20" />

      <div className="relative z-10 mx-auto grid max-w-4xl gap-10 sm:grid-cols-2">
        {eventos.map((evento) => (
          <article
            key={evento.id}
            className="rounded-3xl border border-cream/20 px-8 py-12 text-center"
          >
            <h2 className="font-script text-4xl text-cream">{evento.titulo}</h2>
            <span className="mx-auto mt-4 block h-px w-12 bg-gold" />

            <p className="mt-8 text-[0.65rem] uppercase tracking-widest-xl text-gold-soft">Día</p>
            <p className="mt-2 font-display text-xl font-light text-cream">{evento.cuando}</p>
            <div className="mt-5">
              <Boton href={urlCalendario(evento)} target="_blank" variante="contorno">
                Agendar
              </Boton>
            </div>

            <p className="mt-10 text-[0.65rem] uppercase tracking-widest-xl text-gold-soft">
              Lugar
            </p>
            <p className="mt-2 font-display text-xl font-light text-cream">{evento.lugar.nombre}</p>
            <p className="mt-1 text-sm font-light text-cream/70">{evento.lugar.direccion}</p>
            <div className="mt-5">
              <Boton onClick={() => setMapaAbierto(evento.id)} variante="contorno">
                ¿Cómo llegar?
              </Boton>
            </div>
          </article>
        ))}
      </div>

      {eventos.map((evento) => (
        <Modal
          key={evento.id}
          abierto={mapaAbierto === evento.id}
          alCerrar={() => setMapaAbierto(null)}
          titulo={evento.lugar.nombre}
        >
          <div className="mb-4 h-64 w-full overflow-hidden rounded-xl bg-black/30">
            <iframe
              title={`Mapa de ${evento.lugar.nombre}`}
              src={urlMapaEmbebido(evento.lugar.coordenadas)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>

          <Boton href={urlMapaExterno(evento.lugar.coordenadas)} target="_blank">
            Ampliar en Google Maps
          </Boton>
        </Modal>
      ))}
    </section>
  );
}
