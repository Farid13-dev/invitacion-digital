import { Fragment } from "react";

/**
 * Renderiza el texto de la configuración: `\n\n` separa párrafos y
 * `**así**` marca negritas.
 *
 * Es deliberadamente mínimo. La alternativa era permitir JSX en la
 * configuración, y eso obligaría a quien reutilice la plantilla a escribir
 * React para cambiar un dress code.
 */
export function TextoRico({ texto, className }: { texto: string; className?: string }) {
  return (
    <div className={className}>
      {texto.split("\n\n").map((parrafo, i) => (
        <p key={i} className={i > 0 ? "mt-4" : undefined}>
          {conNegritas(parrafo)}
        </p>
      ))}
    </div>
  );
}

function conNegritas(texto: string) {
  return texto
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((trozo, i) =>
      trozo.startsWith("**") && trozo.endsWith("**") ? (
        <strong key={i} className="font-medium text-gold-soft">
          {trozo.slice(2, -2)}
        </strong>
      ) : (
        <Fragment key={i}>{trozo}</Fragment>
      ),
    );
}
