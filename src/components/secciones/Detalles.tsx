import { useState, type ReactNode } from "react";
import { Boton } from "@/components/ui/Boton";
import { CAMPO } from "@/components/ui/campo";
import { Icono } from "@/components/ui/Icono";
import { Modal } from "@/components/ui/Modal";
import { MuestrasColor } from "@/components/ui/MuestrasColor";
import { Hilos } from "@/components/ui/Ondas";
import { Ramo } from "@/components/ui/Ornamento";
import { TextoRico } from "@/components/ui/TextoRico";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { ConfigEvento, Detalle, Tarjeta as DatosTarjeta } from "@/config/tipos";
import { useCancion } from "@/hooks/useCancion";
import type { Invitado } from "@/hooks/useInvitado";
import { SIN_IDENTIFICAR } from "@/lib/rsvp";

type Props = {
  detalles: ConfigEvento["detalles"];
  invitado: Invitado;
  endpoint: string;
};

/**
 * La celebración: sugerir canción, dress code, tips... Las tarjetas salen de
 * la configuración —añadir una es añadir un objeto, no escribir JSX— y la
 * cuadrícula hace tantas columnas iguales como tarjetas haya.
 */
export function Detalles({ detalles, invitado, endpoint }: Props) {
  const [abierto, setAbierto] = useState<Detalle | "cancion" | null>(null);
  const cerrar = () => setAbierto(null);

  return (
    <section id="celebracion" className="relative px-6 py-16 text-center md:py-24">
      <Hilos variante="simple" className="top-0 h-16" />
      <TituloSeccion subtitulo={detalles.subtitulo}>{detalles.titulo}</TituloSeccion>

      <div className="relative mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-6">
        <Ramo className="absolute -left-16 -top-12 hidden w-32 md:block" />

        {detalles.cancion ? (
          <Tarjeta id="cancion" tarjeta={detalles.cancion} alAbrir={() => setAbierto("cancion")} />
        ) : null}

        {detalles.items.map((item) => (
          <Tarjeta key={item.id} tarjeta={item} alAbrir={() => setAbierto(item)}>
            {item.coloresEvitar ? (
              <MuestrasColor colores={item.coloresEvitar} className="mt-5" />
            ) : null}
          </Tarjeta>
        ))}
      </div>

      {abierto === "cancion" && detalles.cancion ? (
        <Modal abierto alCerrar={cerrar} titulo={detalles.cancion.cta}>
          <SugerirCancion
            invitado={invitado}
            endpoint={endpoint}
            pregunta={detalles.cancion.resumen}
          />
        </Modal>
      ) : null}

      {abierto && abierto !== "cancion" ? (
        <Modal abierto alCerrar={cerrar} titulo={abierto.titulo}>
          <TextoRico texto={abierto.contenido} />
          {abierto.coloresEvitar ? (
            <MuestrasColor colores={abierto.coloresEvitar} className="mt-6" />
          ) : null}
        </Modal>
      ) : null}
    </section>
  );
}

function Tarjeta({
  id,
  tarjeta,
  alAbrir,
  children,
}: {
  id?: string;
  tarjeta: DatosTarjeta;
  alAbrir: () => void;
  children?: ReactNode;
}) {
  return (
    <article
      id={id}
      className="relative flex w-full scroll-mt-8 flex-col items-center rounded-2xl border border-borde bg-tarjeta px-6 py-10 shadow-tarjeta sm:w-[calc(50%-0.75rem)] lg:w-[calc((100%-3rem)/3)]"
    >
      <h3 className="text-base font-semibold uppercase tracking-[0.2em]">{tarjeta.titulo}</h3>
      {tarjeta.icono ? (
        <Icono nombre={tarjeta.icono} className="mt-5 size-12 text-rosa-claro" />
      ) : null}
      <p className="mt-5 text-sm text-pretty text-tenue">{tarjeta.resumen}</p>
      {children}
      <div className="mt-auto pt-5">
        <Boton variante="suave" onClick={alAbrir}>
          {tarjeta.cta}
        </Boton>
      </div>
    </article>
  );
}

/**
 * Formulario de una sola línea: la canción y el artista. Cada envío es una
 * fila en la pestaña "Canciones" de la hoja, firmada como la confirmación.
 */
function SugerirCancion({
  invitado,
  endpoint,
  pregunta,
}: {
  invitado: Invitado;
  endpoint: string;
  pregunta: string;
}) {
  const [texto, setTexto] = useState("");
  const { fase, error, enviar, otra } = useCancion(invitado, endpoint);

  if (!invitado.identificado) return <p>{SIN_IDENTIFICAR}</p>;

  if (fase === "enviada") {
    return (
      <>
        <p className="font-display text-xl text-oliva">¡Gracias! Ya está en la lista.</p>
        <Boton
          variante="suave"
          className="mt-5"
          onClick={() => {
            setTexto("");
            otra();
          }}
        >
          Sugerir otra
        </Boton>
      </>
    );
  }

  const enviando = fase === "enviando";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void enviar(texto);
      }}
      className="space-y-3"
    >
      <p>{pregunta}</p>
      <label className="block">
        <span className="sr-only">Canción y artista</span>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={enviando}
          maxLength={200}
          required
          placeholder="Canción y artista"
          className={`${CAMPO} rounded-full`}
        />
      </label>
      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
      <Boton type="submit" disabled={enviando || !texto.trim()} className="w-full">
        {enviando ? "Enviando…" : "Enviar"}
      </Boton>
    </form>
  );
}
