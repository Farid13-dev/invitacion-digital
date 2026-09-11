/**
 * ════════════════════════════════════════════════════════════════════════
 *  RSVP sobre Google Sheets — Web App de Apps Script
 * ════════════════════════════════════════════════════════════════════════
 *
 * Guarda y consulta las confirmaciones de asistencia de la invitación.
 * Pasos de instalación en `apps-script/README.md`.
 *
 * Columnas de la hoja (las crea `prepararHoja`):
 *
 *   A: grupo   B: telefono   C: asisten   D: noAsisten   E: mensaje   F: actualizado
 *
 * ── Cómo se protege el acceso ──────────────────────────────────────────
 *
 * Una Web App de Apps Script publicada "para cualquier persona" no tiene
 * autenticación: quien conozca la URL puede pedir cualquier fila. En la
 * primera versión de este proyecto bastaba con probar números de teléfono
 * para leer o sobrescribir la confirmación de otro invitado.
 *
 * La solución es una firma HMAC-SHA256 del teléfono, calculada con un secreto
 * que vive **solo aquí** (en las propiedades del script) y en el ordenador
 * desde el que se envían las invitaciones:
 *
 *   1. El script de Python calcula firma = HMAC(telefono, SECRETO)[:12]
 *      y la mete en el enlace de WhatsApp:  ?inv=…&tel=…&f=a1b2c3d4e5f6
 *   2. La invitación reenvía esa firma tal cual, sin saber qué significa.
 *   3. Este script la recalcula y la compara.
 *
 * El secreto nunca llega al navegador, así que cada invitado solo puede tocar
 * su propia fila: la única firma que tiene es la suya.
 */

// ════════════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN
// ════════════════════════════════════════════════════════════════════════

var CONFIG = {
  /** Nombre de la pestaña donde se guardan las confirmaciones. */
  HOJA: "Confirmaciones",

  /**
   * Fechas de corte, en ISO 8601 con offset.
   * DEBEN coincidir con `rsvp.cierreNuevos` y `rsvp.cierreActualizaciones`
   * de `src/config/evento.ts`.
   *
   * Son dos y no una a propósito: se deja de aceptar invitados nuevos con
   * margen para cerrar el número con el salón, pero quien ya respondió puede
   * corregirse hasta casi el final, porque a ese ya lo contamos.
   */
  CIERRE_NUEVOS: "2027-05-01T23:59:00-05:00",
  CIERRE_ACTUALIZACIONES: "2027-05-12T23:59:00-05:00",

  /**
   * Pon `false` solo para probar el endpoint desde el navegador sin firma.
   * En producción déjalo en `true`.
   */
  REQUERIR_FIRMA: true,

  /** Longitud de la firma en el enlace. Debe coincidir con el script de Python. */
  LONGITUD_FIRMA: 12,
};

// ════════════════════════════════════════════════════════════════════════
//  ENDPOINTS
// ════════════════════════════════════════════════════════════════════════

/** GET: devuelve lo que este invitado había confirmado antes, si es que confirmó. */
function doGet(e) {
  try {
    var telefono = normalizarTelefono(e.parameter.telefono);
    var firma = String(e.parameter.firma || "");

    if (!telefono) return responder({ found: false });

    if (!firmaValida(telefono, firma)) {
      return responder({ found: false, status: "unauthorized" });
    }

    var hoja = obtenerHoja();
    var fila = buscarFila(hoja, telefono);
    if (fila === -1) return responder({ found: false });

    var valores = hoja.getRange(fila, 1, 1, 6).getValues()[0];

    return responder({
      found: true,
      grupo: valores[0],
      asisten: valores[2],
      noAsisten: valores[3],
      mensaje: valores[4],
    });
  } catch (error) {
    // No se filtra el mensaje real al invitado: se registra y basta.
    console.error("doGet:", error);
    return responder({ found: false, status: "error" });
  }
}

/** POST: escribe o actualiza la fila de este invitado. */
function doPost(e) {
  var candado = LockService.getScriptLock();

  try {
    var datos = JSON.parse(e.postData.contents);
    var telefono = normalizarTelefono(datos.telefono);
    var firma = String(datos.firma || "");

    if (!telefono) {
      return responder({ status: "error", message: "Falta el teléfono." });
    }

    if (!firmaValida(telefono, firma)) {
      return responder({ status: "unauthorized" });
    }

    // Dos invitados confirmando en el mismo segundo pueden calcular la misma
    // "primera fila libre" y pisarse. El candado serializa las escrituras.
    if (!candado.tryLock(15000)) {
      return responder({ status: "error", message: "Servidor ocupado, intenta de nuevo." });
    }

    var hoja = obtenerHoja();
    var fila = buscarFila(hoja, telefono);
    var esNuevo = fila === -1;
    var ahora = new Date();

    if (esNuevo && ahora > new Date(CONFIG.CIERRE_NUEVOS)) {
      return responder({
        status: "closed",
        message: "El plazo para confirmar nuevas asistencias ya cerró.",
      });
    }

    if (!esNuevo && ahora > new Date(CONFIG.CIERRE_ACTUALIZACIONES)) {
      return responder({
        status: "closed_update",
        message: "El plazo para actualizar tu confirmación ya cerró.",
      });
    }

    var registro = [
      String(datos.grupo || "").trim(),
      telefono,
      String(datos.asisten || ""),
      String(datos.noAsisten || ""),
      String(datos.mensaje || "").slice(0, 500),
      ahora,
    ];

    if (esNuevo) {
      hoja.appendRow(registro);
    } else {
      hoja.getRange(fila, 1, 1, registro.length).setValues([registro]);
    }

    return responder({ status: "success" });
  } catch (error) {
    console.error("doPost:", error);
    return responder({ status: "error", message: "No pudimos guardar tu respuesta." });
  } finally {
    // Sin esto, un error deja el candado tomado hasta que expira y el resto
    // de invitados recibe "servidor ocupado".
    try {
      candado.releaseLock();
    } catch (_) {}
  }
}

// ════════════════════════════════════════════════════════════════════════
//  AUXILIARES
// ════════════════════════════════════════════════════════════════════════

/**
 * Deja solo dígitos. Excel y WhatsApp insertan marcas de dirección invisibles
 * (U+202A/U+202C) alrededor de los números: sin esto, dos teléfonos idénticos
 * a la vista no coinciden al compararlos.
 */
function normalizarTelefono(telefono) {
  return String(telefono || "").replace(/\D/g, "");
}

/** Firma esperada para un teléfono. Debe dar lo mismo que el script de Python. */
function firmaEsperada(telefono) {
  var secreto = PropertiesService.getScriptProperties().getProperty("SECRETO_RSVP");

  if (!secreto) {
    throw new Error(
      "Falta la propiedad de script SECRETO_RSVP. " +
        "Configuración del proyecto > Propiedades del script.",
    );
  }

  var bytes = Utilities.computeHmacSha256Signature(telefono, secreto);

  var hex = bytes
    .map(function (b) {
      return ("0" + (b & 0xff).toString(16)).slice(-2);
    })
    .join("");

  return hex.slice(0, CONFIG.LONGITUD_FIRMA);
}

function firmaValida(telefono, firma) {
  if (!CONFIG.REQUERIR_FIRMA) return true;
  if (!firma) return false;
  return firma.toLowerCase() === firmaEsperada(telefono);
}

function obtenerHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(CONFIG.HOJA);
  if (!hoja) throw new Error('No existe la hoja "' + CONFIG.HOJA + '". Ejecuta prepararHoja().');
  return hoja;
}

/**
 * Devuelve el número de fila (base 1) del teléfono, o -1.
 * Lee solo la columna B en vez de `getDataRange()`: con cientos de filas y
 * mensajes largos, traerse la hoja entera en cada consulta es lo que hace que
 * Apps Script tarde segundos en responder.
 */
function buscarFila(hoja, telefono) {
  var ultima = hoja.getLastRow();
  if (ultima < 2) return -1;

  var telefonos = hoja.getRange(2, 2, ultima - 1, 1).getValues();

  for (var i = 0; i < telefonos.length; i++) {
    if (normalizarTelefono(telefonos[i][0]) === telefono) {
      return i + 2; // +1 por el encabezado, +1 porque las filas empiezan en 1
    }
  }

  return -1;
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

// ════════════════════════════════════════════════════════════════════════
//  UTILIDADES PARA EJECUTAR A MANO DESDE EL EDITOR
// ════════════════════════════════════════════════════════════════════════

/** Crea la pestaña con sus encabezados. Ejecútala una vez al empezar. */
function prepararHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(CONFIG.HOJA) || libro.insertSheet(CONFIG.HOJA);

  var encabezados = ["grupo", "telefono", "asisten", "noAsisten", "mensaje", "actualizado"];

  hoja
    .getRange(1, 1, 1, encabezados.length)
    .setValues([encabezados])
    .setFontWeight("bold")
    .setBackground("#e8eae4");

  hoja.setFrozenRows(1);
  hoja.setColumnWidth(1, 260);
  hoja.setColumnWidth(5, 320);

  Logger.log('Hoja "%s" lista.', CONFIG.HOJA);
}

/**
 * Imprime la firma de un teléfono, para comprobar a mano que coincide con la
 * que genera el script de Python antes de mandar ochenta invitaciones.
 */
function probarFirma() {
  var telefono = "3001234567";
  Logger.log("telefono: %s", telefono);
  Logger.log("firma:    %s", firmaEsperada(telefono));
}

/** Cuenta cuántas personas asisten en total. Útil para el conteo final. */
function contarAsistentes() {
  var hoja = obtenerHoja();
  var ultima = hoja.getLastRow();
  if (ultima < 2) return 0;

  var filas = hoja.getRange(2, 3, ultima - 1, 1).getValues();

  var total = filas.reduce(function (suma, fila) {
    var nombres = String(fila[0] || "")
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    return suma + nombres.length;
  }, 0);

  Logger.log("Personas confirmadas: %s (en %s grupos)", total, ultima - 1);
  return total;
}
