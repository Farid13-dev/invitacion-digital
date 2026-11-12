/**
 * Contrato de la configuración de un evento.
 *
 * Todo lo que cambia entre una boda y otra vive en `evento.ts` y está tipado
 * aquí. Si un campo obligatorio falta, `npm run typecheck` lo detecta antes
 * de desplegar en vez de aparecer como un hueco en la página.
 */

/**
 * Imagen procesada por vite-imagetools con `?as=picture`.
 * Trae las variantes por formato y las medidas reales del original, que se
 * usan para reservar el espacio y evitar saltos de layout (CLS) al cargar.
 */
export type ImagenResponsive = {
  sources: Record<string, string>;
  img: { src: string; w: number; h: number };
};

export type Pareja = {
  nombreA: string;
  nombreB: string;
};

/** Iconos de trazo fino disponibles (ver `src/components/ui/Icono.tsx`). */
export type NombreIcono =
  | "anillos"
  | "brindis"
  | "calendario"
  | "camara"
  | "iglesia"
  | "instagram"
  | "musica"
  | "nota"
  | "percha"
  | "regalo";

export type Ubicacion = {
  nombre: string;
  /** Ciudad o referencia corta que se muestra bajo el nombre del lugar. */
  direccion: string;
  /**
   * "latitud,longitud" — en Google Maps: clic derecho sobre el punto exacto
   * y "copiar coordenadas". De aquí salen el mapa embebido y el enlace a
   * "¿Cómo llegar?". Si falta, el mapa busca por `nombre` y `direccion`.
   */
  coordenadas?: string;
};

export type EventoDelDia = {
  id: string;
  titulo: string;
  /**
   * Inicio en ISO 8601 **con offset explícito**: "2026-09-05T16:00:00-05:00".
   * El offset no es opcional: sin él, el navegador del invitado interpreta la
   * hora en su propia zona y la cuenta regresiva se desfasa.
   */
  inicio: string;
  /** Duración en minutos. Solo se usa para el evento de Google Calendar. */
  duracionMinutos: number;
  /** Cómo se le muestra el día al invitado, p. ej. "Sábado 26 de diciembre". */
  cuando: string;
  /** "4:00 p.m." */
  hora: string;
  icono?: NombreIcono;
  lugar: Ubicacion;
};

export type ConfigRsvp = {
  /**
   * URL /exec de la Web App de Google Apps Script.
   * Se lee de VITE_RSVP_ENDPOINT; ver `apps-script/README.md`.
   */
  endpoint: string;
  /**
   * ISO con offset. Pasada esta fecha no se aceptan confirmaciones de
   * invitados que nunca habían respondido.
   * Debe coincidir con CIERRE_NUEVOS en el Apps Script.
   */
  cierreNuevos: string;
  /**
   * ISO con offset. Pasada esta fecha nadie puede modificar su respuesta ni
   * sugerir canciones. Debe coincidir con CIERRE_ACTUALIZACIONES.
   */
  cierreActualizaciones: string;
};

/** Texto de una tarjeta: título, una línea de resumen y el botón. */
export type Tarjeta = {
  titulo: string;
  resumen: string;
  cta: string;
  icono?: NombreIcono;
};

/**
 * Tarjeta que abre un modal (dress code, regalos, notas...).
 * `contenido` acepta **negritas** con dobles asteriscos y saltos de línea.
 */
export type Detalle = Tarjeta & {
  id: string;
  contenido: string;
  /**
   * Muestras de color tachadas, para un dress code que pide evitar colores.
   * Un círculo tachado se entiende de un vistazo, sin leer, y no deja dudas
   * de qué tono es "azul baby".
   */
  coloresEvitar?: Array<{ nombre: string; color: string }>;
};

export type Musica = {
  /** Ruta bajo `public/`, por ejemplo "/audio/cancion.mp3". */
  archivo: string;
  /** Texto que explica al invitado que la música es parte de la experiencia. */
  nota: string;
};

export type ConfigEvento = {
  pareja: Pareja;

  bienvenida: {
    saludo: string;
  };

  portada: {
    /** "26.12.2026" */
    fechaCorta: string;
    frase: string;
    /** Autor o cita de la frase. Opcional. */
    fraseFuente?: string;
    imagen: ImagenResponsive;
    /** `object-position` de la foto, p. ej. "50% 30%". Por defecto, el centro. */
    encuadre?: string;
  };

  cuentaRegresiva: {
    etiqueta: string;
    /** ISO con offset. Normalmente el inicio de la ceremonia. */
    hasta: string;
  };

  invitados: {
    etiqueta: string;
    mensaje: string;
    /** Qué mostrar cuando se abre la invitación sin `?inv=` en la URL. */
    sinInvitado: { titulo: string; mensaje: string };
  };

  eventos: EventoDelDia[];

  confirmacion: {
    titulo: string;
    subtitulo: string;
    /**
     * Fecha límite tal como se le dice al invitado: "Antes del 23 de
     * noviembre". La que de verdad corta es `rsvp.cierreNuevos`.
     */
    plazo: string;
  };

  rsvp: ConfigRsvp;

  galeria: {
    titulo: string;
    subtitulo: string;
    fotos: ImagenResponsive[];
  };

  detalles: {
    titulo: string;
    subtitulo: string;
    /**
     * Tarjeta para sugerir canciones. Se guardan en la pestaña "Canciones"
     * de la misma hoja del RSVP. `null` la quita.
     */
    cancion: Tarjeta | null;
    items: Detalle[];
  };

  regalos: Detalle;

  cierre: {
    mensaje: string;
    subtitulo: string;
    /** Con "#". El botón "Ver en Instagram" abre la página de esta etiqueta. */
    hashtag: string;
  };

  /** `null` quita la música: el portón muestra un solo botón "Ingresar". */
  musica: Musica | null;
};
