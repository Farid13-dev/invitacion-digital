/**
 * Descompone el parámetro `?inv=` de la URL en las personas que lo forman.
 *
 * La invitación no se envía a personas sueltas sino a grupos familiares, y el
 * grupo tiene que poder responder "vamos dos de los tres". Por eso el nombre
 * llega codificado con dos separadores:
 *
 *   "Rosa Morales & Francisco Rodriguez (Daniel, Sara)"
 *          │                  │              └── acompañantes (hijos, plus one)
 *          └── principales ───┘
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
  // legítimos como "García-López".
  if (!nombre.includes(" ") && nombre.includes("-")) {
    nombre = nombre.replace(/-/g, " ");
  }

  const parentesis = nombre.match(/\(([^)]+)\)/);

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
