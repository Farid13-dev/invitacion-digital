import { Ornamento } from "@/components/ui/Ornamento";
import type { ConfigEvento } from "@/config/tipos";
import type { GrupoInvitado } from "@/lib/invitados";

type Props = {
  grupo: GrupoInvitado;
  textos: ConfigEvento["invitados"];
};

/**
 * El saludo personalizado: el motivo por el que cada invitado recibe un enlace
 * distinto en vez de la misma imagen reenviada ochenta veces.
 */
export function Invitados({ grupo, textos }: Props) {
  const { principales, extras } = grupo;

  return (
    <section className="relative overflow-hidden px-6 py-24">
      <Ornamento className="-right-16 top-4 h-56 w-56 rotate-180 opacity-20" />

      <div className="relative z-10 mx-auto max-w-md rounded-3xl border border-sage-soft bg-card/60 px-8 py-12 text-center shadow-soft">
        <h2 className="text-xs uppercase tracking-widest-xl text-gold">{textos.etiqueta}</h2>

        {principales.length > 0 ? (
          <div className="mt-8">
            <div className="space-y-1">
              {principales.map((nombre) => (
                <p key={nombre} className="font-display text-3xl text-sage-deep">
                  {nombre}
                </p>
              ))}
            </div>

            {extras.length > 0 && (
              <p className="mt-3 text-xs font-light italic text-ink/60">
                Acompañantes: {extras.join(", ")}
              </p>
            )}

            <p className="mt-8 text-sm font-light italic text-ink/70">{textos.mensaje}</p>
          </div>
        ) : (
          <div className="mt-8">
            <p className="font-display text-2xl text-sage-deep">{textos.sinInvitado.titulo}</p>
            <p className="mt-4 text-sm font-light text-ink/70">{textos.sinInvitado.mensaje}</p>
          </div>
        )}
      </div>
    </section>
  );
}
