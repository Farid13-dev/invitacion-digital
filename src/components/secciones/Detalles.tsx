import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { Ornamento } from "@/components/ui/Ornamento";
import { TextoRico } from "@/components/ui/TextoRico";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { ConfigEvento } from "@/config/tipos";

/**
 * Bloques informativos (dress code, tips, lo que haga falta).
 *
 * Se generan a partir de `detalles.items` de la configuración: añadir una
 * tarjeta nueva es añadir un objeto, no escribir JSX.
 */
export function Detalles({ detalles }: { detalles: ConfigEvento["detalles"] }) {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <section className="relative overflow-hidden px-6 py-24">
      <Ornamento className="-left-16 top-10 h-60 w-60 opacity-20" />

      <div className="relative z-10">
        <TituloSeccion subtitulo={detalles.subtitulo}>{detalles.titulo}</TituloSeccion>

        <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
          {detalles.items.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-sage-soft bg-card/60 px-6 py-10 text-center shadow-soft"
            >
              <h3 className="font-display text-2xl text-sage-deep">{item.titulo}</h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-ink/70">{item.resumen}</p>
              <div className="mt-6">
                <Boton onClick={() => setAbierto(item.id)} variante="contorno">
                  {item.cta}
                </Boton>
              </div>
            </article>
          ))}
        </div>
      </div>

      {detalles.items.map((item) => (
        <Modal
          key={item.id}
          abierto={abierto === item.id}
          alCerrar={() => setAbierto(null)}
          titulo={item.titulo}
        >
          <TextoRico texto={item.contenido} />
        </Modal>
      ))}
    </section>
  );
}
