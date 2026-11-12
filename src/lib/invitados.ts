/**
 * Descompone el parámetro `?inv=` de la URL en las personas que lo forman.
 *
 * La invitación no se envía a personas sueltas sino a grupos familiares, y el
 * grupo tiene que poder responder "vamos dos de los tres". Por eso el nombre
 * llega codificado con dos separadores:
 *
 *   "Andrés & Laura (Tomás, Sara)"
 *          │                 │            └── acompañantes (hijos, plus one)
 *          └── principales ──┘
 *
 * De aquí salen los checkboxes individuales del formulario de confirmación.
 */
export type GrupoInvitado = {
  /** Los titulares de la invitación. */
  principales: string[];
  /** Acompañantes indicados entre paréntesis. */
  extras: string[];
  /** principales + extras: una casilla de asistencia por cada uno. */
  todos: string[];
};

const GRUPO_VACIO: GrupoInvitado = { principales: [], extras: [], todos: [] };

export function parseInvitado(bruto: string): GrupoInvitado {
  if (!bruto) return GRUPO_VACIO;

  let nombre = bruto.trim();

  // Formato heredado: los guiones hacían de espacios cuando el enlace se
  // generaba sin codificar la URL ("Rosa-Morales"). Solo se aplica si el
  // nombre no tiene ya espacios, para no romper apellidos compuestos
  // legítimos como "Quintero-Rivas".
  if (!nombre.includes(" ") && nombre.includes("-")) {
    nombre = nombre.replace(/-/g, " ");
  }

  // `[^)]*` y no `[^)]+`: unos paréntesis vacíos son un desliz corriente al
  // teclear el listado, y sin esto se imprimían tal cual en la invitación.
  const parentesis = nombre.match(/\(([^)]*)\)/);

  const extras = parentesis ? separarPersonas(parentesis[1] ?? "") : [];

  const base = parentesis ? nombre.replace(parentesis[0], "").trim() : nombre;
  const principales = separarPersonas(base);

  return { principales, extras, todos: [...principales, ...extras] };
}

/** Acepta "&" y "," indistintamente como separador entre personas. */
function separarPersonas(texto: string): string[] {
  return texto
    .split(/[&,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * La línea de lugares reservados de la tarjeta del invitado.
 *
 * Una invitación impresa dice cuántos están invitados; aquí también, para que
 * nadie tenga que adivinar si "la familia" incluye a los primos. Concuerda en
 * número —"un lugar en tu honor" frente a "3 lugares en su honor"— porque el
 * plural genérico para una sola persona se lee como una plantilla.
 */
export function textoCupos(cantidad: number): string | null {
  if (cantidad <= 0) return null;
  if (cantidad === 1) return "Hemos reservado un lugar en tu honor";
  return `Hemos reservado ${cantidad} lugares en su honor`;
}
