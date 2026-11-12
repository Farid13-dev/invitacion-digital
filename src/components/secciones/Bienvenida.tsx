import { useEffect } from "react";
import { Boton } from "@/components/ui/Boton";
import { NombresPareja } from "@/components/ui/NombresPareja";
import { Guirnalda } from "@/components/ui/Ornamento";
import type { Pareja } from "@/config/tipos";
import { cn } from "@/lib/cn";

type Props = {
  pareja: Pareja;
  saludo: string;
  /** `null` cuando el evento no tiene música configurada. */
  notaMusica: string | null;
  /** `true` desde que el invitado pulsa entrar: el portón se desvanece. */
  saliendo: boolean;
  alEntrar: (conMusica: boolean) => void;
  /** El desvanecido terminó y el portón ya se puede desmontar. */
  alTerminar: () => void;
};

/** Lo que dura el desvanecido; coincide con `duration-700` de abajo. */
const SALIDA_MS = 700;

const Filete = () => (
  <span
    aria-hidden="true"
    className="block h-px w-full max-w-96 bg-linear-to-r from-transparent via-borde to-transparent"
  />
);

/**
 * Portón de entrada: los nombres entre dos guirnaldas.
 *
 * Existe por una restricción de los navegadores: el audio no puede empezar
 * solo, hace falta un gesto del usuario. En vez de disimularlo con un botón de
 * play flotante, lo convertimos en la primera pantalla — y de paso deja entrar
 * en silencio a quien abre la invitación en mitad de una reunión.
 *
 * Al pulsar, `alEntrar` se llama en el acto —la música tiene que arrancar
 * dentro del gesto, o iOS la bloquea— y el portón se queda montado solo lo
 * que dura el desvanecido, para que la portada aparezca detrás.
 */
export function Bienvenida({ pareja, saludo, notaMusica, saliendo, alEntrar, alTerminar }: Props) {
  useEffect(() => {
    if (!saliendo) return;
    // Un temporizador y no `transitionend`: ese evento no llega si el
    // navegador se salta la transición (pestaña en segundo plano), y el
    // portón se quedaría tapando la invitación.
    const id = window.setTimeout(alTerminar, SALIDA_MS);
    return () => window.clearTimeout(id);
  }, [saliendo, alTerminar]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto bg-marfil transition-[opacity,visibility] duration-700",
        saliendo && "pointer-events-none invisible opacity-0",
      )}
    >
      <div className="flex min-h-full items-center justify-center px-6 py-10 text-center">
        <div className="animate-fade-up flex w-full max-w-xl flex-col items-center">
          <Guirnalda className="w-56 sm:w-80 lg:w-96" />
          <Filete />
          <p className="mt-5 font-display text-2xl text-balance text-oliva">{saludo}</p>
          <NombresPareja pareja={pareja} como="p" className="my-4" />
          <Filete />
          <Guirnalda invertida className="w-56 sm:w-80 lg:w-96" />

          {notaMusica ? (
            <>
              <p className="mt-4 text-pretty text-tenue">{notaMusica}</p>
              <div className="par-botones mt-4 flex flex-wrap justify-center gap-2">
                <Boton onClick={() => alEntrar(true)}>Ingresar con música</Boton>
                <Boton variante="suave" onClick={() => alEntrar(false)}>
                  Ingresar sin música
                </Boton>
              </div>
            </>
          ) : (
            <Boton className="mt-6" onClick={() => alEntrar(false)}>
              Ingresar
            </Boton>
          )}
        </div>
      </div>
    </div>
  );
}
