import { useEffect, useRef, useState } from "react";

type Props = {
  /** Ruta del archivo, bajo `public/`. */
  archivo: string;
  /** `true` si el invitado entró eligiendo "Ingresar con música". */
  arrancarSonando: boolean;
};

/**
 * Música de fondo, con su botón flotante.
 *
 * Se monta siempre que el evento tenga canción, entrara el invitado con música
 * o en silencio. Lo que **no** se hace siempre es ponerle `src` al `<audio>`:
 * un elemento de audio sin `src` no descarga ni un byte, y el archivo suele ser
 * lo más pesado de la invitación.
 *
 * Esa separación es la que permite que quien entró en silencio pueda encender
 * la música más tarde sin recargar la página. Antes el componente solo existía
 * si habías elegido música al entrar, así que cambiar de idea obligaba a
 * recargar y volver a pasar por la pantalla de bienvenida.
 *
 * El `src` se asigna **dentro del manejador del clic**, no en un efecto
 * posterior: Safari en iOS solo concede el permiso de reproducción a la
 * llamada que nace directamente del gesto del usuario, y un `play()` diferido
 * a un efecto puede quedarse sin él.
 */
export function MusicaFondo({ archivo, arrancarSonando }: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const [sonando, setSonando] = useState(arrancarSonando);

  useEffect(() => {
    if (!arrancarSonando) return;

    const el = audio.current;
    if (!el) return;

    // Aquí sí venimos de un gesto: el clic en "Ingresar con música".
    el.src = archivo;
    // El navegador puede rechazar la reproducción de todos modos (política de
    // autoplay en iOS). Si pasa, el botón deja reintentarlo.
    void el.play().catch(() => setSonando(false));
  }, [arrancarSonando, archivo]);

  const alternar = () => {
    const el = audio.current;
    if (!el) return;

    // Primera vez que se pide la música en una visita que entró en silencio:
    // la descarga empieza exactamente aquí, y no antes.
    if (!el.src) el.src = archivo;

    if (el.paused) {
      void el
        .play()
        .then(() => setSonando(true))
        .catch(() => setSonando(false));
    } else {
      el.pause();
      setSonando(false);
    }
  };

  return (
    <>
      {/* Sin `src`: hasta que alguien pida la música, esto no pesa nada. */}
      <audio ref={audio} loop preload="auto" />

      <button
        type="button"
        onClick={alternar}
        aria-pressed={sonando}
        aria-label={sonando ? "Silenciar la música" : "Activar la música"}
        title={sonando ? "Silenciar la música" : "Activar la música"}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-sage-deep/80 p-3 text-cream/90 shadow-soft backdrop-blur-sm transition-colors hover:bg-sage-deep hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <IconoAltavoz sonando={sonando} />
      </button>
    </>
  );
}

function IconoAltavoz({ sonando }: { sonando: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      {sonando ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <path d="M17 9.5 22 14.5M22 9.5 17 14.5" />
      )}
    </svg>
  );
}
