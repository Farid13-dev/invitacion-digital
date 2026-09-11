import { Ornamento } from "@/components/ui/Ornamento";
import { useCuentaRegresiva } from "@/hooks/useCuentaRegresiva";

type Props = { etiqueta: string; hasta: string };

export function CuentaRegresiva({ etiqueta, hasta }: Props) {
  const { dias, horas, minutos, segundos } = useCuentaRegresiva(hasta);

  const unidades: Array<[number, string]> = [
    [dias, "días"],
    [horas, "hs"],
    [minutos, "min"],
    [segundos, "seg"],
  ];

  return (
    <section className="relative overflow-hidden bg-sage py-20">
      <Ornamento className="-left-14 -top-10 h-56 w-56 opacity-20" />

      <div className="relative z-10 px-6 text-center">
        <p className="mb-6 font-script text-3xl text-gold-soft">{etiqueta}</p>

        {/* Un lector de pantalla no debería recitar un contador que cambia
            cada segundo: se anuncia una vez y el resto queda oculto. */}
        <p className="sr-only">
          Faltan {dias} días, {horas} horas y {minutos} minutos.
        </p>

        <div aria-hidden="true" className="flex items-end justify-center gap-6 sm:gap-12">
          {unidades.map(([valor, nombre]) => (
            <div key={nombre} className="text-center">
              <div className="font-display text-4xl font-light tabular-nums text-cream sm:text-6xl">
                {String(valor).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[0.6rem] uppercase tracking-widest-xl text-gold-soft">
                {nombre}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
