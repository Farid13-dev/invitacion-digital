import { Ornamento } from "@/components/ui/Ornamento";

type Props = {
  saludo: string;
  /** `null` cuando el evento no tiene música configurada. */
  notaMusica: string | null;
  alEntrar: (conMusica: boolean) => void;
};

const BOTON_BASE =
  "rounded-full px-7 py-3 text-[0.68rem] uppercase tracking-widest-xl transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream";

/**
 * Portón de entrada.
 *
 * Existe por una restricción de los navegadores: el audio no puede empezar
 * solo, hace falta un gesto del usuario. En vez de disimularlo con un botón de
 * play flotante, lo convertimos en la primera pantalla — y de paso deja entrar
 * en silencio a quien abre la invitación en mitad de una reunión.
 */
export function Bienvenida({ saludo, notaMusica, alEntrar }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-sage px-6 text-center">
      <Ornamento className="-left-16 -top-16 h-72 w-72 opacity-25" />
      <Ornamento className="-bottom-20 -right-16 h-80 w-80 rotate-180 opacity-25" />

      <div className="animate-fade-up max-w-lg">
        <p className="whitespace-pre-line font-display text-3xl font-light leading-snug text-cream sm:text-4xl">
          {saludo}
        </p>

        {notaMusica ? (
          <>
            <p className="mt-4 text-sm font-light text-gold-soft">{notaMusica}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => alEntrar(true)}
                className={`${BOTON_BASE} bg-gold text-cream hover:bg-gold-soft hover:text-sage-deep`}
              >
                Ingresar con música
              </button>
              <button
                type="button"
                onClick={() => alEntrar(false)}
                className={`${BOTON_BASE} border border-gold text-gold hover:bg-gold hover:text-cream`}
              >
                Ingresar sin música
              </button>
            </div>
          </>
        ) : (
          <div className="mt-8">
            <button
              type="button"
              autoFocus
              onClick={() => alEntrar(false)}
              className={`${BOTON_BASE} bg-gold text-cream hover:bg-gold-soft hover:text-sage-deep`}
            >
              Ingresar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
