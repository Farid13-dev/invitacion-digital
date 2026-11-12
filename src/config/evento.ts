/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA UN EVENTO NUEVO.  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 *
 * Cambia los textos, las fechas y las fotos de aquí y tienes otra
 * invitación. Ningún componente sabe de qué boda se trata.
 *
 *  - El título y la vista previa de WhatsApp están en `src/config/meta.ts`.
 *  - Los colores y las tipografías están en `src/styles/tema.css`.
 *  - Las fotos van en `src/assets/` (ver README).
 *  - La URL del RSVP se lee de `.env` para no versionarla.
 *
 * Las fotos de `src/assets/pareja` y `src/assets/galeria` son de ejemplo:
 * sustitúyelas por las de la pareja conservando el nombre del archivo.
 */
import type { ConfigEvento } from "./tipos";

// Las imágenes se importan con las medidas en las que realmente se muestran.
// vite-imagetools genera AVIF/WebP/JPG en cada tamaño durante el build, así el
// navegador descarga solo la variante que necesita.
import portada from "@/assets/pareja/portada.jpg?w=640;960;1280&format=avif;webp;jpg&as=picture";
import galeria01 from "@/assets/galeria/01.jpg?w=480;960&format=avif;webp;jpg&as=picture";
import galeria02 from "@/assets/galeria/02.jpg?w=480;960&format=avif;webp;jpg&as=picture";
import galeria03 from "@/assets/galeria/03.jpg?w=480;960&format=avif;webp;jpg&as=picture";
import galeria04 from "@/assets/galeria/04.jpg?w=480;960&format=avif;webp;jpg&as=picture";

export const evento: ConfigEvento = {
  pareja: {
    nombreA: "John Jairo",
    nombreB: "Claudia Patricia",
  },

  bienvenida: {
    saludo: "Bienvenidos a la invitación de",
  },

  portada: {
    fechaCorta: "26.12.2026",
    frase: "Por encima de todo, vístanse de amor, que es el vínculo perfecto.",
    fraseFuente: "Colosenses 3:14",
    imagen: portada,
    encuadre: "50% 30%",
  },

  cuentaRegresiva: {
    etiqueta: "Falta",
    hasta: "2026-12-26T16:00:00-05:00",
  },

  invitados: {
    etiqueta: "Invitados",
    mensaje: "Nos encanta compartir este momento contigo. ¡Te esperamos!",
    sinInvitado: {
      titulo: "¡Bienvenidos!",
      mensaje:
        "Esta invitación es personalizada. Si no ves tu nombre, espera a recibir tu enlace directo por WhatsApp.",
    },
  },

  eventos: [
    {
      id: "misa",
      titulo: "Misa",
      inicio: "2026-12-26T16:00:00-05:00",
      duracionMinutos: 60,
      cuando: "Sábado 26 de diciembre",
      hora: "4:00 p.m.",
      icono: "anillos",
      lugar: {
        nombre: "Iglesia Nuestra Señora de Guadalupe",
        direccion: "Florencia, Caquetá",
        coordenadas: "1.6024449912018996,-75.60036896103134",
      },
    },
    {
      id: "recepcion",
      titulo: "Recepción",
      inicio: "2026-12-26T19:00:00-05:00",
      duracionMinutos: 300,
      cuando: "Sábado 26 de diciembre",
      hora: "7:00 p.m.",
      icono: "brindis",
      lugar: {
        nombre: "Casa Roma",
        direccion: "Salón de eventos · Florencia, Caquetá",
        coordenadas: "1.70041227617588,-75.62451630052732",
      },
    },
  ],

  confirmacion: {
    titulo: "Confirmar asistencia",
    subtitulo: "Es importante que confirmes tu asistencia",
    plazo: "Antes del 23 de noviembre",
  },

  rsvp: {
    endpoint: import.meta.env.VITE_RSVP_ENDPOINT ?? "",
    // El plazo que se le anuncia al invitado: desde aquí no se aceptan
    // confirmaciones nuevas, para cerrar el número con el salón a tiempo.
    cierreNuevos: "2026-11-23T23:59:00-05:00",
    // Quien ya confirmó puede corregirse hasta 3 días antes del evento.
    cierreActualizaciones: "2026-12-23T23:59:00-05:00",
  },

  galeria: {
    titulo: "Retratos de nuestro amor",
    subtitulo: "Un minuto, un segundo, un instante que queda en la eternidad",
    fotos: [galeria01, galeria02, galeria03, galeria04],
  },

  detalles: {
    titulo: "Celebración",
    subtitulo: "Celebremos juntos este gran día. Aquí algunos detalles a tener en cuenta.",
    cancion: {
      titulo: "Música",
      resumen: "¿Cuál es la canción que no debe faltar en la playlist de la celebración?",
      cta: "Sugerir canción",
      icono: "musica",
    },
    items: [
      {
        id: "dresscode",
        titulo: "Dress code",
        resumen: "Te pedimos evitar estos colores",
        cta: "Ver más",
        icono: "percha",
        coloresEvitar: [
          { nombre: "Amarillo", color: "#f2cc3d" },
          { nombre: "Blanco", color: "#ffffff" },
          { nombre: "Azul baby", color: "#a9cdea" },
          { nombre: "Rojo", color: "#c62a2f" },
        ],
        contenido:
          "Queremos que ese día todos luzcan espectaculares ✨\n\nSolo te pedimos evitar los colores **amarillo, blanco, azul baby y rojo**.\n\n¡Cualquier otro color es bienvenido!",
      },
      {
        id: "notas",
        titulo: "Tips y notas",
        resumen: "Información adicional para tener en cuenta",
        cta: "+ Info",
        icono: "nota",
        contenido:
          "Te recomendamos llegar **15 minutos antes** de la misa para acompañarnos desde el primer momento.\n\nLa misa es a las **4:00 p.m.** en la Iglesia Nuestra Señora de Guadalupe y la recepción a las **7:00 p.m.** en Casa Roma, ambas en Florencia, Caquetá.",
      },
    ],
  },

  regalos: {
    id: "regalos",
    titulo: "Regalos",
    resumen: "Si deseas regalarnos algo más que tu hermosa presencia…",
    cta: "Ver detalles",
    icono: "regalo",
    contenido:
      "Tu presencia es nuestro mejor regalo.\n\nSi además quieres tener un detalle con nosotros, cualquier aporte para nuestro nuevo hogar será recibido con muchísimo cariño.",
  },

  cierre: {
    mensaje: "Compartimos este día junto a ti",
    subtitulo: "Comparte tus fotos y videos de este día tan especial",
    hashtag: "#JohnYClaudia",
  },

  musica: {
    archivo: "/audio/cancion.mp3",
    nota: "La música de fondo es parte de la experiencia",
  },
};
