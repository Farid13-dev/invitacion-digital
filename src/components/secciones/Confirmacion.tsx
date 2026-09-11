import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { Modal } from "@/components/ui/Modal";
import { Ornamento } from "@/components/ui/Ornamento";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { Rsvp } from "@/hooks/useRsvp";
import { despedida, etiquetaAccion, resumenGuardado, resumirAsistencia } from "@/lib/confirmacion";
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
 *
 * Todos los textos salen de `lib/confirmacion`, incluido el de la despedida.
 * No es manía de arquitectura: celebrar con un "¡Nos vemos en la boda! 🎉" a
 * quien acaba de avisar que no puede ir es un error de producto, y conviene
 * que esa decisión esté en un sitio que se pueda probar.
 */
export function Confirmacion({ grupo, identificado, rsvp }: Props) {
  const [abierto, setAbierto] = useState(false);

  const cerrar = () => {
    setAbierto(false);
    rsvp.limpiar();
  };

  const accion = etiquetaAccion(rsvp.yaConfirmo);

  return (
    <section id="rsvp" className="relative overflow-hidden px-6 py-24 text-center">
      <Ornamento className="-right-14 -top-10 h-56 w-56 rotate-180 opacity-20" />

      <div className="relative z-10 mx-auto max-w-lg">
        <TituloSeccion subtitulo="Es importante que confirmes tu asistencia">
          Confirmar Asistencia
        </TituloSeccion>

        <div className="mt-8">
          {/* Describe lo que quedó registrado en la hoja, no un genérico: así
              el invitado comprueba de un vistazo que dice lo que quiso decir.
              Sale de `guardado` y no del borrador, para que desmarcar una
              casilla sin enviar no cambie lo que afirma esta línea. */}
          {rsvp.guardado && (
            <p className="animate-fade-up mb-6 font-display text-xl text-gold-soft">
              {resumenGuardado(resumirAsistencia(grupo.todos, rsvp.guardado.asistencia))}
            </p>
          )}

          <Boton onClick={() => setAbierto(true)}>{accion}</Boton>
        </div>
      </div>

      <Modal
        abierto={abierto}
        alCerrar={cerrar}
        titulo={rsvp.fase === "enviado" ? "¡Gracias!" : accion}
      >
        <ContenidoRsvp grupo={grupo} identificado={identificado} rsvp={rsvp} />
      </Modal>
    </section>
  );
}

function ContenidoRsvp({ grupo, identificado, rsvp }: Props) {
  if (rsvp.fase === "enviado" && rsvp.guardado) {
    const resumen = resumirAsistencia(grupo.todos, rsvp.guardado.asistencia);

    return (
      <div className="py-4">
        <p className="text-lg text-cream">{resumenGuardado(resumen)}</p>
        <p className="mt-2 text-sm text-cream/70">{despedida(resumen)}</p>
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
  const resumen = resumirAsistencia(grupo.todos, rsvp.asistencia);

  // Sin cambios no hay nada que escribir en la hoja. Antes el botón seguía
  // activo, y cada pulsación reescribía la misma fila: una escritura inútil y
  // una oportunidad más de que un timeout se mostrara como error sobre una
  // respuesta que ya estaba guardada.
  const bloqueado = enviando || !rsvp.hayCambios;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (bloqueado) return;
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

      {/* Desmarcar a todo el mundo es una respuesta legítima, no un error de
          formulario. Pero conviene decirlo en voz alta antes de enviarlo, que
          es distinto a dejar que ocurra en silencio. */}
      {resumen.nadieAsiste && grupo.todos.length > 0 && (
        <p role="status" className="text-center text-xs text-cream/80">
          {grupo.todos.length === 1
            ? "Vas a enviar que no podrás acompañarnos."
            : "Vas a enviar que ninguno podrá acompañarnos."}
        </p>
      )}

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
        <Boton type="submit" disabled={bloqueado}>
          {enviando ? "Enviando…" : etiquetaAccion(rsvp.yaConfirmo)}
        </Boton>

        {!rsvp.hayCambios && !enviando && (
          <p className="mt-3 text-xs text-cream/60">
            Tu respuesta ya está guardada. Cambia algo si quieres actualizarla.
          </p>
        )}
      </div>
    </form>
  );
}
