import { Corona } from "@/components/ui/Ornamento";
import { useCuentaRegresiva } from "@/hooks/useCuentaRegresiva";

type Props = { etiqueta: string; hasta: string };

/** La cuenta regresiva dentro de la corona de flores, montada sobre la ola. */
export function CuentaRegresiva({ etiqueta, hasta }: Props) {
  const { dias, horas, minutos, segundos } = useCuentaRegresiva(hasta);

  const unidades: Array<[number, string]> = [
    [dias, "días"],
    [horas, "hs"],
    [minutos, "min"],
    [segundos, "seg"],
  ];

  return (
    <section className="relative -mt-24 px-6 text-center md:-mt-40">
      <div className="relative mx-auto size-[min(22rem,90vw)] md:size-[26rem]">
        <Corona className="absolute inset-0" />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-3xl">{etiqueta}</p>

          {/* Un lector de pantalla no debería recitar un contador que cambia
              cada segundo: se anuncia una vez y el resto queda oculto. */}
          <p className="sr-only">
            Faltan {dias} días, {horas} horas y {minutos} minutos.
          </p>

          <div aria-hidden="true" className="mt-1 flex gap-3 sm:gap-4">
            {unidades.map(([valor, nombre]) => (
              <div key={nombre}>
                <div className="font-display text-2xl tabular-nums text-rosa">{valor}</div>
                <div className="text-xs text-tenue">{nombre}</div>
              </div>
            ))}
          </div>

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-3 size-6 fill-rosa motion-safe:animate-latir"
          >
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.2 1.7-2 3.1-3.2 5.3-3.2 3.7 0 5.8 3.8 4.3 7.3C19.5 16.4 12 21 12 21Z" />
          </svg>
        </div>
      </div>
    </section>
  );
}
