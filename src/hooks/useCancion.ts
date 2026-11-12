import { useCallback, useRef, useState } from "react";
import { ENLACE_INVALIDO, enviarCancion } from "@/lib/rsvp";
import type { Invitado } from "./useInvitado";

export type FaseCancion = "lista" | "enviando" | "enviada";

export type Cancion = {
  fase: FaseCancion;
  error: string | null;
  enviar: (cancion: string) => Promise<void>;
  /** Vuelve al formulario para sugerir otra. */
  otra: () => void;
};

/**
 * Sugerencias de canciones para la playlist de la celebración.
 *
 * Es mucho más simple que `useRsvp` porque no hay nada que reconciliar: cada
 * sugerencia es una fila nueva, y repetir una canción no hace daño. Lo único
 * que se cuida es el doble toque, con el mismo cerrojo por ref.
 */
export function useCancion(invitado: Invitado, endpoint: string): Cancion {
  const [fase, setFase] = useState<FaseCancion>("lista");
  const [error, setError] = useState<string | null>(null);
  const enviando = useRef(false);
  const { grupoBruto, telefono, firma } = invitado;

  const enviar = useCallback(
    async (cancion: string) => {
      const limpia = cancion.trim();
      if (!limpia || enviando.current) return;
      enviando.current = true;
      setFase("enviando");
      setError(null);

      try {
        const resultado = await enviarCancion(endpoint, {
          grupo: grupoBruto,
          telefono,
          firma,
          cancion: limpia,
        });

        if (resultado.tipo === "ok") {
          setFase("enviada");
          return;
        }

        setFase("lista");
        setError(resultado.tipo === "noAutorizado" ? ENLACE_INVALIDO : resultado.mensaje);
      } finally {
        enviando.current = false;
      }
    },
    [endpoint, firma, grupoBruto, telefono],
  );

  const otra = useCallback(() => {
    setFase("lista");
    setError(null);
  }, []);

  return { fase, error, enviar, otra };
}
