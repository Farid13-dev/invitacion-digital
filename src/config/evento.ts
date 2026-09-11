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
 * Los datos de abajo son un ejemplo ficticio.
 */
import type { ConfigEvento } from "./tipos";

// Las imágenes se importan con las medidas en las que realmente se muestran.
// vite-imagetools genera AVIF/WebP/JPG en cada tamaño durante el build, así el
// navegador descarga solo la variante que necesita.
import portada from "@/assets/pareja/portada.jpg?w=768;1280;1920&format=avif;webp;jpg&as=picture";
import galeria01 from "@/assets/galeria/01.jpg?w=480;960&format=avif;webp;jpg&as=picture";
import galeria02 from "@/assets/galeria/02.jpg?w=480;960&format=avif;webp;jpg&as=picture";
import galeria03 from "@/assets/galeria/03.jpg?w=480;960&format=avif;webp;jpg&as=picture";
import galeria04 from "@/assets/galeria/04.jpg?w=480;960&format=avif;webp;jpg&as=picture";
import galeria05 from "@/assets/galeria/05.jpg?w=480;960&format=avif;webp;jpg&as=picture";

export const evento: ConfigEvento = {
  pareja: {
    nombreA: "Valentina Restrepo",
    nombreB: "Mateo Herrera",
  },

  bienvenida: {
    saludo: "Eres un invitado muy especial.\nBienvenido a nuestra boda.",
  },

  portada: {
    fechaCorta: "15.05.2027",
    frase:
      "Entre el verde de la montaña y el azul del cielo, dos caminos se convierten en uno solo.",
    imagen: portada,
  },

  cuentaRegresiva: {
    etiqueta: "Falta",
    hasta: "2027-05-15T16:00:00-05:00",
  },

  invitados: {
    etiqueta: "Invitados",
    mensaje: "Tu presencia es lo más importante. ¡No faltes!",
    sinInvitado: {
      titulo: "¡Bienvenidos!",
      mensaje:
        "Esta invitación es personalizada. Si no ves tu nombre, espera a recibir tu enlace directo por WhatsApp.",
    },
  },

  eventos: [
    {
      id: "ceremonia",
      titulo: "Ceremonia",
      inicio: "2027-05-15T16:00:00-05:00",
      duracionMinutos: 120,
      cuando: "Sábado 15 de mayo · 4:00 p.m.",
      lugar: {
        nombre: "Parroquia San José",
        direccion: "Medellín, Antioquia",
        coordenadas: "6.247272,-75.566093",
      },
    },
    {
      id: "celebracion",
      titulo: "Celebración",
      inicio: "2027-05-15T18:30:00-05:00",
      duracionMinutos: 210,
      cuando: "Sábado 15 de mayo · 6:30 p.m. a 10:00 p.m.",
      lugar: {
        nombre: "Hacienda El Mirador",
        direccion: "Envigado, Antioquia",
        coordenadas: "6.166893,-75.583961",
      },
    },
  ],

  rsvp: {
    endpoint: import.meta.env.VITE_RSVP_ENDPOINT ?? "",
    // Desde aquí no se aceptan invitados nuevos: da tiempo a cerrar el
    // número con el salón antes de que empiecen los cambios de último momento.
    cierreNuevos: "2027-05-01T23:59:00-05:00",
    // Quien ya confirmó puede corregirse hasta 3 días antes del evento.
    cierreActualizaciones: "2027-05-12T23:59:00-05:00",
  },

  galeria: {
    titulo: "Retratos de Nuestro Amor",
    subtitulo: "Un minuto, un segundo, un instante que queda en la eternidad",
    fotos: [galeria01, galeria02, galeria03, galeria04, galeria05],
  },

  detalles: {
    titulo: "Celebración",
    subtitulo:
      "Como celebración de nuestro compromiso te invitamos a compartir una cena. Aquí algunos detalles a tener en cuenta.",
    items: [
      {
        id: "dresscode",
        titulo: "Dress Code",
        resumen: "Una orientación para tu vestuario",
        cta: "Ver más",
        contenido:
          "Queremos que ese día resaltemos nosotros con algunos tonos especiales 🤍\n\nPor eso te pedimos evitar el **terracota, rojo, verde botella, azul petróleo y blanco**.\n\n¡Cualquier otro color es bienvenido!",
      },
      {
        id: "notas",
        titulo: "Tips y Notas",
        resumen: "Información adicional para tener en cuenta",
        cta: "+ Info",
        contenido:
          "Se recomienda llegar **15 minutos antes** de la ceremonia.\n\nHay parqueadero disponible en el lugar de la celebración.",
      },
    ],
  },

  regalos: {
    id: "regalos",
    titulo: "Regalos",
    resumen: "Tu presencia es nuestro mejor regalo.",
    cta: "Ver detalles",
    contenido:
      "Tu presencia es nuestro mejor regalo.\n\nSi además quieres tener un detalle con nosotros, cualquier aporte para nuestra luna de miel será recibido con muchísimo cariño.",
  },

  cierre: {
    mensaje: "Compartimos este gran día junto a ti",
    hashtag: "#ValentinaYMateo",
  },

  musica: {
    archivo: "/audio/cancion.mp3",
    nota: "La música de fondo hace parte de esta experiencia.",
  },
};
