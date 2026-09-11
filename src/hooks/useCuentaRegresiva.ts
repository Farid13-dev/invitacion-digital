import { useEffect, useState } from "react";
import { aFecha, tiempoRestante, type Restante } from "@/lib/fechas";

/**
 * Cuenta regresiva al segundo. El intervalo se detiene solo cuando la pestaña
 * pasa a segundo plano: los navegadores móviles lo estrangulan de todos modos
 * y así no gastamos batería del invitado durante una recepción de cuatro horas.
 */
export function useCuentaRegresiva(iso: string): Restante {
  const [restante, setRestante] = useState<Restante>(() => tiempoRestante(aFecha(iso)));

  useEffect(() => {
    const destino = aFecha(iso);
    let intervalo: number | undefined;

    const actualizar = () => setRestante(tiempoRestante(destino));

    const arrancar = () => {
      if (intervalo !== undefined) return;
      actualizar();
      intervalo = window.setInterval(actualizar, 1000);
    };

    const parar = () => {
      if (intervalo === undefined) return;
      window.clearInterval(intervalo);
      intervalo = undefined;
    };

    const alCambiarVisibilidad = () => (document.hidden ? parar() : arrancar());

    arrancar();
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      parar();
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, [iso]);

  return restante;
}
