import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { Ornamento } from "@/components/ui/Ornamento";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { Rsvp } from "@/hooks/useRsvp";
import type { GrupoInvitado } from "@/lib/invitados";

type Props = {
  grupo: GrupoInvitado;
  /**
   * Falso si al enlace le falta el nombre o el teléfono. Sin teléfono no hay
   * fila que escribir ni firma que validar: el formulario fallaría siempre en
   * el servidor, así que ni se muestra.
   */
  identificado: boolean;
  rsvp: Rsvp;
};

/**
 * Confirmación de asistencia, persona por persona.
 *
 * La granularidad es el punto: un grupo familiar puede responder "vamos dos de
 * los tres" sin que nadie tenga que interpretar un mensaje de WhatsApp para
 * darle un número al catering.
 */
export function Confirmacion({ grupo, identificado, rsvp }: Props) {
  const [abierto, setAbierto] = useState(false);

  const cerrar = () => {
    setAbierto(false);
    rsvp.limpiar();
  };

  const etiquetaBoton = rsvp.yaConfirmo ? "Actualizar asistencia" : "Confirmar asistencia";

  return (
    <section id="rsvp" className="relative overflow-hidden px-6 py-24 text-center">
      <Ornamento className="-right-14 -top-10 h-56 w-56 rotate-180 opacity-20" />

      <div className="relative z-10 mx-auto max-w-lg">
        <TituloSeccion subtitulo="Es importante que confirmes tu asistencia">
          Confirmar Asistencia
        </TituloSeccion>

        <div className="mt-8">
          {/* Va atado a `yaConfirmo` y no a la fase "enviado": así el aviso
              sigue ahí al cerrar el modal y también cuando el invitado vuelve
              días después a cambiar su respuesta. Antes solo se pintaba
              mientras el modal lo tapaba, es decir, nunca. */}
          {rsvp.yaConfirmo && (
            <p className="animate-fade-up mb-6 font-display text-xl text-gold-soft">
              ¡Ya hemos recibido tu confirmación! 🎉
            </p>
          )}

          <Boton onClick={() => setAbierto(true)}>{etiquetaBoton}</Boton>
        </div>
      </div>

      <Modal
        abierto={abierto}
        alCerrar={cerrar}
        titulo={rsvp.fase === "enviado" ? "¡Gracias!" : "Confirmar Asistencia"}
      >
        <ContenidoRsvp grupo={grupo} identificado={identificado} rsvp={rsvp} />
      </Modal>
    </section>
  );
}

function ContenidoRsvp({ grupo, identificado, rsvp }: Props) {
  if (rsvp.fase === "enviado") {
    return (
      <div className="py-4">
        <p className="text-lg text-cream">Hemos recibido tu confirmación.</p>
        <p className="mt-2 text-sm text-cream/70">¡Nos vemos en la boda!</p>
      </div>
    );
  }

  if (!identificado || rsvp.enlaceInvalido) {
    return (
      <p className="py-4 text-sm text-cream">
        No pudimos identificar tu invitación. Por favor usa el enlace que te enviamos por WhatsApp.
      </p>
    );
  }

  if (rsvp.fase === "cargando") {
    return (
      <p className="py-8 text-center text-sm text-cream/70" role="status">
        Cargando…
      </p>
    );
  }

  if (!rsvp.puedeConfirmar) {
    return (
      <div className="py-4">
        <p className="text-sm text-cream">{rsvp.motivoCierre}</p>
        <p className="mt-2 text-xs text-cream/70">
          Si necesitas hacer un cambio de último momento, escríbenos directamente por WhatsApp.
        </p>
      </div>
    );
  }

  return <Formulario grupo={grupo} identificado={identificado} rsvp={rsvp} />;
}

function Formulario({ grupo, rsvp }: Props) {
  const enviando = rsvp.fase === "enviando";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void rsvp.confirmar();
      }}
      className="space-y-4 text-left"
    >
      <p className="text-center text-sm text-cream/70">Marca quiénes de ustedes podrán asistir:</p>

      {rsvp.yaConfirmo && (
        <p className="text-center text-xs text-gold-soft">
          Ya habías confirmado antes. Puedes actualizar tu respuesta.
        </p>
      )}

      <fieldset disabled={enviando} className="space-y-3">
        <legend className="sr-only">Asistentes</legend>

        {/* La clave es la posición, no el nombre: en un grupo puede haber dos
            personas que se llamen igual y son dos casillas distintas. */}
        {grupo.todos.map((nombre, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-center justify-between rounded-xl border border-cream/30 bg-sage/50 px-4 py-3 transition-colors hover:border-gold has-[:focus-visible]:border-gold"
          >
            <span className="text-sm text-cream">{nombre}</span>
            <input
              type="checkbox"
              checked={rsvp.asistencia[i] ?? false}
              onChange={() => rsvp.alternar(i)}
              className="h-5 w-5 accent-gold"
            />
          </label>
        ))}
      </fieldset>

      <label className="block">
        <span className="sr-only">Mensaje para los novios</span>
        <textarea
          value={rsvp.mensaje}
          onChange={(e) => rsvp.escribirMensaje(e.target.value)}
          disabled={enviando}
          maxLength={500}
          rows={3}
          placeholder="Puedes dejar un mensaje de cariño a los novios…"
          className="w-full resize-none rounded-xl border border-cream/30 bg-sage/50 px-4 py-3 text-sm text-cream outline-none transition-colors placeholder:text-cream/50 focus:border-gold"
        />
      </label>

      {rsvp.error && (
        <p role="alert" className="text-center text-xs text-red-400">
          {rsvp.error}
        </p>
      )}

      <div className="pt-4 text-center">
        <Boton type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Confirmar asistencia"}
        </Boton>
      </div>
    </form>
  );
}
