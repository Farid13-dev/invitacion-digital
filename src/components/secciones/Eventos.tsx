import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { CirculoIcono } from "@/components/ui/Icono";
import { Modal } from "@/components/ui/Modal";
import { Hilos } from "@/components/ui/Ondas";
import { Ramo } from "@/components/ui/Ornamento";
import type { EventoDelDia } from "@/config/tipos";
import { urlCalendario, urlMapaEmbebido, urlMapaExterno } from "@/lib/enlaces";

/**
 * Ceremonia y recepción: cuándo, dónde y los dos atajos que de verdad usa un
 * invitado — agendarlo y saber cómo llegar.
 *
 * El mapa vive en un modal y no incrustado en la tarjeta: un `<iframe>` de
 * Google Maps por evento carga cientos de kilobytes de scripts de terceros que
 * la mayoría de invitados no llega a abrir.
 */
export function Eventos({ eventos }: { eventos: EventoDelDia[] }) {
  const [mapaAbierto, setMapaAbierto] = useState<EventoDelDia | null>(null);

  return (
    <section className="relative mt-16 pb-10">
      <Hilos className="top-10 h-24" />
      <Ramo className="absolute -left-10 bottom-0 w-28 opacity-90 md:w-40" />

      <div className="relative mx-auto grid max-w-4xl gap-16 px-6 md:grid-cols-2">
        {eventos.map((evento) => (
          <article key={evento.id} className="text-center">
            {evento.icono ? <CirculoIcono nombre={evento.icono} /> : null}

            {/* Cinta con las puntas en cola de golondrina. */}
            <h3 className="mx-auto mt-6 w-56 bg-linear-to-r from-rosa to-rosa-claro py-2 font-display text-2xl text-marfil [clip-path:polygon(0_0,100%_0,94%_50%,100%_100%,0_100%,6%_50%)]">
              {evento.titulo}
            </h3>

            <p className="mt-6 font-display text-xl">Día</p>
            <p className="text-base text-tenue">{evento.cuando}</p>
            <p className="text-base font-semibold text-oliva">{evento.hora}</p>
            <Boton
              href={urlCalendario(evento)}
              target="_blank"
              variante="suave"
              className="mt-4 min-w-44"
            >
              Agendar
            </Boton>

            <p className="mt-8 font-display text-xl">Lugar</p>
            <p className="text-base text-tenue">{evento.lugar.nombre}</p>
            <p className="text-base text-tenue">{evento.lugar.direccion}</p>
            <Boton
              variante="suave"
              className="mt-4 min-w-44"
              onClick={() => setMapaAbierto(evento)}
            >
              ¿Cómo llegar?
            </Boton>
          </article>
        ))}
      </div>

      {mapaAbierto ? (
        <Modal abierto alCerrar={() => setMapaAbierto(null)} titulo={mapaAbierto.lugar.nombre}>
          <div className="mb-6 h-64 w-full overflow-hidden rounded-2xl bg-mantequilla">
            <iframe
              title={`Mapa de ${mapaAbierto.lugar.nombre}`}
              src={urlMapaEmbebido(mapaAbierto.lugar)}
              loading="lazy"
              // La URL de la invitación lleva el nombre y el teléfono del
              // invitado en la query. Sin esto el navegador se los manda a
              // Google en la cabecera Referer cada vez que se abre el mapa.
              referrerPolicy="no-referrer"
              className="h-full w-full border-0"
            />
          </div>
          <Boton href={urlMapaExterno(mapaAbierto.lugar)} target="_blank">
            Abrir en Google Maps
          </Boton>
        </Modal>
      ) : null}
    </section>
  );
}
