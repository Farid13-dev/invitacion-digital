/**
 * El teléfono es la llave primaria del RSVP: identifica al invitado en la URL,
 * en la hoja de cálculo y en la caché local. Para que las tres coincidan,
 * absolutamente todas las comparaciones pasan por aquí.
 *
 * Además elimina las marcas de dirección invisibles (U+202A/U+202C) que Excel
 * y WhatsApp insertan alrededor de los números y que hacen que dos teléfonos
 * idénticos a la vista no lo sean para el código.
 */
export function normalizarTelefono(valor: unknown): string {
  return String(valor ?? "").replace(/\D/g, "");
}

/** Un teléfono colombiano móvil tiene 10 dígitos; aceptamos 7 a 15 por si acaso. */
export function esTelefonoPlausible(valor: unknown): boolean {
  const digitos = normalizarTelefono(valor);
  return digitos.length >= 7 && digitos.length <= 15;
}
