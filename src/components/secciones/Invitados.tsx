import type { ConfigEvento } from "@/config/tipos";
import { textoCupos, type GrupoInvitado } from "@/lib/invitados";

type Props = {
  grupo: GrupoInvitado;
  textos: ConfigEvento["invitados"];
};

/**
 * El saludo personalizado: el motivo por el que cada invitado recibe un enlace
 * distinto en vez de la misma imagen reenviada ochenta veces.
 */
export function Invitados({ grupo, textos }: Props) {
  const { todos } = grupo;

  if (todos.length === 0) {
    return (
      <section className="px-6 pt-6 text-center">
        <h2 className="font-display text-2xl">{textos.sinInvitado.titulo}</h2>
        <p className="mx-auto mt-2 max-w-md text-base text-tenue">{textos.sinInvitado.mensaje}</p>
      </section>
    );
  }

  return (
    <section className="px-6 pt-6 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-rosa text-base font-semibold text-marfil">
        {todos.length}
      </span>
      <h2 className="mt-2 font-display text-xl uppercase tracking-[0.2em]">{textos.etiqueta}</h2>
      <p className="mt-1 text-sm text-tenue">{textoCupos(todos.length)}</p>

      {/* La clave es la posición, no el nombre: en un grupo puede haber dos
          personas que se llamen igual. */}
      <ul className="mt-4 space-y-2 text-lg">
        {todos.map((nombre, i) => (
          <li key={i} className="mx-auto w-fit border-b border-borde px-4 pb-1">
            {nombre}
          </li>
        ))}
      </ul>

      <p className="mx-auto mt-5 max-w-md text-base text-tenue">{textos.mensaje}</p>
    </section>
  );
}
