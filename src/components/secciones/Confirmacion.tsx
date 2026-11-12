import { useState } from "react";
import { Boton } from "@/components/ui/Boton";
import { CAMPO } from "@/components/ui/campo";
import { Icono } from "@/components/ui/Icono";
import { Modal } from "@/components/ui/Modal";
import { TituloSeccion } from "@/components/ui/TituloSeccion";
import type { ConfigEvento, ConfigRsvp } from "@/config/tipos";
import type { Rsvp } from "@/hooks/useRsvp";
import { despedida, etiquetaAccion, resumenGuardado, resumirAsistencia } from "@/lib/confirmacion";
import { fechaLegible } from "@/lib/fechas";
import type { GrupoInvitado } from "@/lib/invitados";
import { SIN_IDENTIFICAR } from "@/lib/rsvp";

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
 * Todos los textos salen de `lib/confirmacion`, incluido el de la despedida:
 * celebrar con un "¡Nos vemos en la boda! 🎉" a quien acaba de avisar que no
 * puede ir es un error de producto, y conviene que esa decisión se pueda
 * probar.
 */
export function Confirmacion({
  grupo,
  identificado,
  rsvp,
  textos,
  cierres,
}: Props & {
  textos: ConfigEvento["confirmacion"];
  cierres: Pick<ConfigRsvp, "cierreNuevos" | "cierreActualizaciones">;
}) {
  const [abierto, setAbierto] = useState(false);
  const accion = etiquetaAccion(rsvp.yaConfirmo);

  // El plazo que le importa a cada invitado: quien no ha respondido ve el de
  // confirmar; quien ya respondió, el de corregir. Cerrado, no se muestra: el
  // formulario ya explica por qué.
  const plazo = !rsvp.puedeConfirmar
    ? null
    : rsvp.yaConfirmo
      ? `Puedes cambiarla hasta el ${fechaLegible(cierres.cierreActualizaciones)}`
      : `Antes del ${fechaLegible(cierres.cierreNuevos)}`;

  const cerrar = () => {
    setAbierto(false);
    rsvp.limpiar();
  };

  return (
    <section id="rsvp" className="scroll-mt-8 px-6 py-16 text-center md:py-24">
      <TituloSeccion subtitulo={textos.subtitulo}>{textos.titulo}</TituloSeccion>

      {/* El plazo, a la vista y antes del botón: es la información que hace
          que alguien confirme hoy en vez de "luego". */}
      {plazo ? (
        <p className="mt-5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-borde px-4 py-2 text-sm text-oliva sm:px-5">
          <Icono nombre="calendario" className="size-5 text-rosa-claro" />
          {plazo}
        </p>
      ) : null}

      {/* Describe lo que quedó registrado en la hoja, no un genérico: así el
          invitado comprueba de un vistazo que dice lo que quiso decir. Sale de
          `guardado` y no del borrador, para que desmarcar una casilla sin
          enviar no cambie lo que afirma esta línea. */}
      {rsvp.guardado ? (
        <p className="animate-fade-up mt-4 font-display text-lg text-rosa">
          {resumenGuardado(resumirAsistencia(grupo.todos, rsvp.guardado.asistencia))}
        </p>
      ) : null}

      <div>
        <Boton variante="suave" className="mt-5" onClick={() => setAbierto(true)}>
          {accion}
        </Boton>
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
      <>
        <p className="font-display text-xl text-oliva">{resumenGuardado(resumen)}</p>
        <p className="mt-2">{despedida(resumen)}</p>
      </>
    );
  }

  if (!identificado || rsvp.enlaceInvalido) return <p>{SIN_IDENTIFICAR}</p>;

  if (rsvp.fase === "cargando") return <p role="status">Cargando…</p>;

  if (!rsvp.puedeConfirmar) {
    return (
      <>
        <p className="text-oliva">{rsvp.motivoCierre}</p>
        <p className="mt-2 text-xs">
          Si necesitas hacer un cambio de último momento, escríbenos directamente por WhatsApp.
        </p>
      </>
    );
  }

  return <Formulario grupo={grupo} rsvp={rsvp} />;
}

function Formulario({ grupo, rsvp }: Pick<Props, "grupo" | "rsvp">) {
  const enviando = rsvp.fase === "enviando";
  const resumen = resumirAsistencia(grupo.todos, rsvp.asistencia);

  // Sin cambios no hay nada que escribir en la hoja: cada pulsación
  // reescribiría la misma fila, y sería una oportunidad más de que un timeout
  // se mostrara como error sobre una respuesta ya guardada.
  const bloqueado = enviando || !rsvp.hayCambios;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!bloqueado) void rsvp.confirmar();
      }}
      className="space-y-3"
    >
      <p>Marca quiénes de ustedes podrán asistir:</p>

      {rsvp.yaConfirmo ? (
        <p className="text-xs text-rosa">
          Ya habías confirmado antes. Puedes actualizar tu respuesta.
        </p>
      ) : null}

      <fieldset disabled={enviando} className="space-y-2 text-left">
        <legend className="sr-only">Asistentes</legend>
        {/* La clave es la posición, no el nombre: en un grupo puede haber dos
            personas que se llamen igual y son dos casillas distintas. */}
        {grupo.todos.map((nombre, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-center justify-between rounded-full border border-borde bg-tarjeta px-5 py-2.5 text-oliva transition-colors has-[:checked]:bg-mantequilla has-[:focus-visible]:border-rosa"
          >
            {nombre}
            <input
              type="checkbox"
              checked={rsvp.asistencia[i] ?? false}
              onChange={() => rsvp.alternar(i)}
              className="size-5 accent-oliva"
            />
          </label>
        ))}
      </fieldset>

      {/* Desmarcar a todo el mundo es una respuesta legítima, no un error de
          formulario. Pero conviene decirlo en voz alta antes de enviarlo. */}
      {resumen.nadieAsiste && grupo.todos.length > 0 ? (
        <p role="status" className="text-xs">
          {grupo.todos.length === 1
            ? "Vas a enviar que no podrás acompañarnos."
            : "Vas a enviar que ninguno podrá acompañarnos."}
        </p>
      ) : null}

      <label className="block">
        <span className="sr-only">Mensaje para los novios</span>
        <textarea
          value={rsvp.mensaje}
          onChange={(e) => rsvp.escribirMensaje(e.target.value)}
          disabled={enviando}
          maxLength={500}
          rows={3}
          placeholder="Puedes dejar un mensaje de cariño a los novios…"
          className={`${CAMPO} resize-none`}
        />
      </label>

      {rsvp.error ? (
        <p role="alert" className="text-xs text-red-700">
          {rsvp.error}
        </p>
      ) : null}

      <Boton type="submit" disabled={bloqueado} className="w-full">
        {enviando ? "Enviando…" : etiquetaAccion(rsvp.yaConfirmo)}
      </Boton>

      {!rsvp.hayCambios && !enviando ? (
        <p className="text-xs">
          Tu respuesta ya está guardada. Cambia algo si quieres actualizarla.
        </p>
      ) : null}
    </form>
  );
}
