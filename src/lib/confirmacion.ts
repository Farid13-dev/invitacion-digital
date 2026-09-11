/**
 * Lo que la confirmación *significa*, separado de cómo se pinta.
 *
 * Vive aquí y no dentro del componente por dos razones. La primera es que se
 * puede probar sin montar React. La segunda es que los textos de esta pantalla
 * no son decorativos: decirle "¡Nos vemos en la boda! 🎉" a alguien que acaba
 * de avisar que no puede ir es un error de producto, no de estilo.
 */

export type ResumenAsistencia = {
  /** Quiénes van, en el orden del grupo. */
  asisten: string[];
  /** Quiénes no. */
  noAsisten: string[];
  /** Cuántas personas asisten. */
  total: number;
  /** De cuántas personas se compone el grupo invitado. */
  deCuantos: number;
  nadieAsiste: boolean;
  todosAsisten: boolean;
};

/**
 * Cruza los nombres del grupo con las casillas marcadas.
 *
 * Acepta listas de solo lectura porque no toca ninguna de las dos: así se le
 * puede pasar tanto el borrador del formulario como la respuesta ya guardada.
 */
export function resumirAsistencia(
  nombres: readonly string[],
  asistencia: readonly boolean[],
): ResumenAsistencia {
  const asisten = nombres.filter((_, i) => asistencia[i] === true);
  const noAsisten = nombres.filter((_, i) => asistencia[i] !== true);

  return {
    asisten,
    noAsisten,
    total: asisten.length,
    deCuantos: nombres.length,
    nadieAsiste: asisten.length === 0,
    todosAsisten: nombres.length > 0 && asisten.length === nombres.length,
  };
}

/** ¿Confirmar o actualizar? La misma palabra en el botón, el título y el envío. */
export function etiquetaAccion(yaConfirmo: boolean): string {
  return yaConfirmo ? "Actualizar asistencia" : "Confirmar asistencia";
}

/**
 * Lo que la sección muestra cuando ya hay una respuesta guardada.
 *
 * Describe lo que quedó registrado, no un genérico: así el invitado puede
 * comprobar de un vistazo que la hoja dice lo que él quiso decir.
 */
export function resumenGuardado(resumen: ResumenAsistencia): string {
  if (resumen.deCuantos === 0) return "Ya recibimos tu respuesta.";

  if (resumen.nadieAsiste) {
    return resumen.deCuantos === 1
      ? "Nos avisaste que no podrás acompañarnos."
      : "Nos avisaste que no podrán acompañarnos.";
  }

  if (resumen.deCuantos === 1) return "Confirmaste tu asistencia. 🎉";
  if (resumen.todosAsisten) return `Confirmaste la asistencia de los ${resumen.deCuantos}. 🎉`;

  return `Confirmaste ${resumen.total} de ${resumen.deCuantos} personas. 🎉`;
}

/** La despedida del modal, justo después de guardar. */
export function despedida(resumen: ResumenAsistencia): string {
  return resumen.nadieAsiste
    ? "Gracias por avisarnos. Los vamos a extrañar."
    : "¡Nos vemos en la boda!";
}

/** Dos listas de nombres con el mismo contenido, sin importar el orden. */
export function mismasListas(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const ordenada = [...a].sort();
  return [...b].sort().every((nombre, i) => nombre === ordenada[i]);
}

export type Borrador = {
  asistencia: readonly boolean[];
  mensaje: string;
};

/**
 * ¿Hay algo que guardar?
 *
 * Sin esto, el botón de confirmar seguía activo aunque el invitado no hubiera
 * tocado nada, y volver a pulsarlo reescribía la fila con lo mismo. Cada pulsación
 * era una escritura en la hoja y una oportunidad de que un timeout se mostrara
 * como un error sobre una respuesta que ya estaba guardada.
 */
export function hayCambios(borrador: Borrador, guardado: Borrador | null): boolean {
  if (guardado === null) return true;

  if (borrador.mensaje.trim() !== guardado.mensaje.trim()) return true;
  if (borrador.asistencia.length !== guardado.asistencia.length) return true;

  return borrador.asistencia.some((va, i) => va !== guardado.asistencia[i]);
}
