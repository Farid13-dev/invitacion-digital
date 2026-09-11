import { useEffect, useRef, useState } from "react";

/**
 * Música de fondo.
 *
 * Este componente solo se monta si el invitado eligió "Ingresar con música",
 * y ese es todo el truco de rendimiento: el archivo de audio suele ser lo más
 * pesado de la invitación (varios megas), y quien entra en silencio no lo
 * descarga nunca. Antes se incluía en la página siempre.
 *
 * El botón flotante existe porque una canción que no se puede callar es una
 * canción que hace cerrar la pestaña.
 */
export function MusicaFondo({ archivo }: { archivo: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [sonando, setSonando] = useState(true);

  useEffect(() => {
    // El navegador puede rechazar la reproducción aunque venga de un clic
    // (política de autoplay en iOS). Si pasa, el botón deja reintentarlo.
    audio.current?.play().catch(() => setSonando(false));
  }, []);

  const alternar = () => {
    const el = audio.current;
    if (!el) return;

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
      <audio ref={audio} src={archivo} loop preload="auto" />

      <button
        type="button"
        onClick={alternar}
        aria-pressed={sonando}
        aria-label={sonando ? "Silenciar la música" : "Activar la música"}
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
