import { cn } from "@/lib/cn";

type Props = {
  children: string;
  subtitulo?: string;
  /** "claro" para secciones sobre fondo salvia oscuro. */
  tono?: "oscuro" | "claro";
};

export function TituloSeccion({ children, subtitulo, tono = "oscuro" }: Props) {
  const esClaro = tono === "claro";

  return (
    <div className="text-center">
      <h2
        className={cn(
          "font-script text-4xl leading-tight sm:text-5xl",
          esClaro ? "text-cream" : "text-sage-deep",
        )}
      >
        {children}
      </h2>
      <span className="mx-auto mt-4 block h-px w-16 bg-gold" />
      {subtitulo ? (
        <p
          className={cn(
            "mx-auto mt-4 max-w-2xl text-sm font-light",
            esClaro ? "text-gold-soft" : "text-ink/70",
          )}
        >
          {subtitulo}
        </p>
      ) : null}
    </div>
  );
}
