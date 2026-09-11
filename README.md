<h1 align="center">Invitación Digital</h1>

<p align="center">
  Invitaciones de boda <strong>personalizadas por invitado</strong>, con confirmación de
  asistencia persona por persona sobre Google Sheets.<br>
  Una plantilla: cambias un archivo de configuración y tienes otro evento.
</p>

<p align="center">
  <a href="#-demo"><strong>Demo</strong></a> ·
  <a href="#cómo-funciona"><strong>Cómo funciona</strong></a> ·
  <a href="#usarla-para-tu-evento"><strong>Usarla para tu evento</strong></a> ·
  <a href="#decisiones-técnicas"><strong>Decisiones</strong></a>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white">
  <img alt="Licencia MIT" src="https://img.shields.io/badge/Licencia-MIT-green">
</p>

---

## 🔗 Demo

**[invitacion-digital.vercel.app](https://invitacion-digital.vercel.app)**

La invitación es personal: cada enlace lleva el nombre del grupo invitado. Para
verla como la ve un invitado de verdad:

```
https://invitacion-digital.vercel.app/?inv=Rosa%20Morales%20%26%20Francisco%20Rodriguez%20(Daniel)&tel=3001234567
```

Sin esos parámetros funciona igual, pero saluda de forma genérica y el
formulario de confirmación queda deshabilitado. Es intencional.

---

## El problema

Una boda de ~80 grupos familiares. Confirmar asistencia por WhatsApp significa
que alguien tiene que leer 80 conversaciones, interpretar respuestas como
*"vamos casi todos"* y llevar la cuenta a mano para darle un número al salón.

Y una imagen de invitación reenviada 80 veces no le dice a nadie *"tú estás
invitado"*.

Este proyecto resuelve las tres partes a la vez:

| Necesidad | Cómo se resuelve |
|---|---|
| Que cada invitado se sienta invitado personalmente | Enlace único con su nombre y el de sus acompañantes |
| Saber exactamente cuántas personas van | Confirmación **por persona**, escrita directo en Google Sheets |
| Enviar 80 invitaciones sin perder la cabeza | CLI de Python que abre WhatsApp Web con el mensaje listo |

> Nació de una invitación real, para la boda de mi hermana en septiembre de
> 2026. Aquel proyecto está archivado en
> **[Tarjeta_Matrimonio_Digital](https://github.com/Farid13-dev/Tarjeta_Matrimonio_Digital)**;
> esto es su reconstrucción, hecha para poder reutilizarse.

---

## Cómo funciona

```
  data/invitados.xlsx          Navegador del invitado              Google Sheets
  ┌──────────────────┐         ┌─────────────────────┐           ┌──────────────┐
  │ nombre, telefono │         │  Invitación (React) │           │  grupo       │
  └────────┬─────────┘         │                     │           │  telefono    │
           │                   │  ?inv=…&tel=…&f=…   │           │  asisten     │
           │ enviar_           │          │          │           │  noAsisten   │
           │ invitaciones.py   │          ▼          │           │  mensaje     │
           ▼                   │  ┌───────────────┐  │  GET/POST │  actualizado │
  ┌──────────────────┐ Whats-  │  │ Modal RSVP    │◄─┼──────────►└──────▲───────┘
  │ Enlace único     ├────────►│  │ ☑ Rosa        │  │                  │
  │ + firma HMAC     │  App    │  │ ☑ Francisco   │  │        ┌─────────┴──────┐
  └──────────────────┘         │  │ ☐ Daniel      │  │        │  Apps Script   │
                               │  └───────────────┘  │        │  + firma HMAC  │
                               └─────────────────────┘        └────────────────┘
```

### 1 · La identidad viaja en la URL

```
Rosa Morales & Francisco Rodriguez (Daniel, Sara)
       │               │                 │
  titular 1       titular 2        acompañantes
```

`?inv=` no lleva un nombre, lleva un **grupo**. La invitación lo descompone y
genera una casilla por persona, así que una familia de cuatro puede responder
"vamos tres" sin que nadie tenga que interpretar un mensaje de voz.

### 2 · El RSVP vive en Google Sheets

Una Web App de Apps Script hace de API: `doGet` devuelve lo que el invitado ya
había respondido (para que al reabrir el enlace vea su respuesta y no un
formulario en blanco) y `doPost` escribe o actualiza su fila.

Sin servidor, sin base de datos, sin coste — y los novios ven las
confirmaciones llegar en una hoja de cálculo que ya saben usar.

### 3 · Cada invitado solo puede tocar su propia fila

Una Web App de Apps Script publicada "para cualquier usuario" no tiene
autenticación. Con solo la URL y un teléfono se podía leer —o sobrescribir— la
confirmación de otro invitado.

La solución es una firma HMAC-SHA256 del teléfono que viaja en el enlace:

```
…/?inv=Carlos+Zapata&tel=3001234567&f=a1b2c3d4e5f6
                                      └── HMAC-SHA256(telefono, SECRETO)[:12]
```

El secreto vive **solo** en las propiedades del Apps Script y en el `.env` de
quien envía las invitaciones. Nunca llega al navegador: el invitado recibe su
firma ya calculada y la reenvía sin saber qué significa. La única firma que
tiene es la suya.

### 4 · Dos fechas de corte, no una

Un único "cierre de RSVP" no sirve. Hace falta dejar de aceptar invitados
nuevos con margen para cerrar el número con el salón, pero permitir que quien
ya confirmó se corrija hasta el final — a ese ya lo contamos.

| Corte | Bloquea |
|---|---|
| `cierreNuevos` | Confirmaciones de teléfonos que nunca respondieron |
| `cierreActualizaciones` | Cambios de quien ya había confirmado |

Los dos se validan **en el servidor**, no solo en la interfaz: el frontend
esconde el formulario, pero es el Apps Script quien rechaza la escritura tardía.

### 5 · Un fallo de red no borra lo que ya sabíamos

La hoja de cálculo es la fuente de verdad, pero Apps Script se cae y tarda. Si
la consulta falla, el estado **no** se degrada a "nunca confirmaste": se
conserva el respaldo de `localStorage`.

```ts
.catch((err: unknown) => {
  // A propósito NO se hace setYaConfirmo(false): perder la conexión no
  // significa que el invitado no haya confirmado.
  console.error("[rsvp] no se pudo verificar el estado de confirmación:", err);
})
```

Ese fue un bug real de producción en la primera versión, y es el motivo de que
esa regla esté escrita en el código y no solo en la cabeza de alguien.

---

## Usarla para tu evento

```sh
git clone https://github.com/Farid13-dev/invitacion-digital.git
cd invitacion-digital
npm install
cp .env.example .env
npm run dev
```

### Los dos archivos que hay que tocar

| Archivo | Qué cambia |
|---|---|
| **`src/config/evento.ts`** | Nombres, fechas, sedes, textos, fotos, cortes del RSVP |
| **`src/config/meta.ts`** | Título de la pestaña y vista previa al compartir el enlace |

Están separados por un motivo técnico, no por capricho: los rastreadores de
WhatsApp y Facebook no ejecutan JavaScript, así que las etiquetas Open Graph se
inyectan en el HTML durante el build y tienen que estar en un módulo que Vite
pueda leer desde Node.

La paleta y las tipografías están en **`src/styles/tema.css`**: siete colores
en `oklch` y tres fuentes.

Ningún componente sabe de qué boda se trata.

### Las fotos

Van en `src/assets/`, y basta con sustituirlas conservando el nombre:

```
src/assets/
├── pareja/portada.jpg      fondo de la portada (vertical, ≥1600 px de alto)
├── galeria/01.jpg … 05.jpg la galería (añade o quita las que quieras)
└── ornamentos/hojas.png    la rama decorativa de las esquinas
```

No hace falta optimizarlas a mano: se importan con las medidas en las que
realmente se muestran y el build genera las variantes.

```ts
import portada from "@/assets/pareja/portada.jpg?w=768;1280;1920&format=avif;webp;jpg&as=picture";
```

Para la vista previa de WhatsApp, regenera `public/og.jpg` a 1200 × 630:

```sh
node -e "require('sharp')('src/assets/pareja/portada.jpg').resize(1200,630,{fit:'cover',position:'attention'}).jpeg({quality:82,mozjpeg:true}).toFile('public/og.jpg')"
```

### El resto

1. **Backend de confirmaciones** → [`apps-script/README.md`](./apps-script/README.md) (10 min, una vez)
2. **Envío de invitaciones** → [`scripts/README.md`](./scripts/README.md)
3. **Despliegue** → importar el repo en Vercel. `vercel.json` ya trae el
   framework, los rewrites de SPA y las cabeceras de caché. Solo hay que añadir
   `VITE_RSVP_ENDPOINT` en *Settings → Environment Variables*.

---

## Estructura

```
src/
├── config/
│   ├── evento.ts        ← los datos del evento (el archivo a editar)
│   ├── meta.ts          ← título y vista previa al compartir
│   └── tipos.ts         el contrato: si falta un campo, falla el typecheck
├── components/
│   ├── secciones/       Portada, CuentaRegresiva, Invitados, Eventos,
│   │                    Confirmacion, Galeria, Detalles, Regalos, Cierre
│   ├── ui/              Boton, Modal, Lightbox, Imagen, Ornamento, TextoRico
│   └── MusicaFondo.tsx
├── hooks/
│   ├── useInvitado.ts        lee ?inv / ?tel / ?f de la URL
│   ├── useRsvp.ts            todo el estado de la confirmación
│   ├── useCuentaRegresiva.ts
│   ├── useCarruselArrastre.ts
│   ├── useBloqueoScroll.ts
│   └── useAtajosTeclado.ts
├── lib/                 lógica pura, sin React: telefono, invitados,
│                        fechas, enlaces, rsvp, almacenamiento
└── styles/tema.css      ← la paleta y las tipografías

apps-script/Codigo.gs    la Web App del RSVP
scripts/                 el CLI de envío por WhatsApp
```

Las tres capas no se mezclan: `lib/` no importa React, `hooks/` no pinta nada y
los componentes no saben de dónde salen los datos.

---

## Decisiones técnicas

### Por qué no hay framework de servidor

La invitación es una sola vista cuyo estado vive entero en el cliente:
parámetros de URL, `localStorage` y un `fetch` a Apps Script. El SSR solo
aportaría las etiquetas Open Graph, y eso lo resuelve un plugin de 40 líneas en
`vite.config.ts` que las inyecta en el HTML durante el build.

Lo que se gana: **19 dependencias declaradas en vez de 70**, un build de 10
segundos y un sitio estático que no tiene servidor que se caiga ni función que
arranque en frío.

### Por qué `oklch` para los colores

Es un espacio perceptual: la primera cifra es la luminosidad real, así que
aclarar un color no lo hace virar de tono y dos colores con la misma L se ven
igual de claros. Ajustar la paleta deja de ser prueba y error.

### El audio no se descarga salvo que lo pidan

La canción de fondo es lo más pesado de la invitación (varios megas). El
componente `MusicaFondo` **solo se monta si el invitado eligió entrar con
música**: quien entra en silencio no descarga ni un byte.

Que la pantalla de bienvenida exista no es decorativo — los navegadores no
dejan arrancar el audio sin un gesto del usuario. En vez de disimularlo con un
botón de *play* flotante, se convierte en la primera pantalla.

### Imágenes

Cada foto se importa con las medidas en las que se muestra y `vite-imagetools`
genera AVIF, WebP y JPG en cada tamaño. El navegador descarga solo la primera
variante que entiende, en el tamaño que necesita.

La portada pasa de **172 KB** (un único JPEG igual para todos) a **63 KB** en
móvil. Los `width`/`height` del original viajan en el `<img>`, así que el texto
no salta cuando la foto termina de cargar.

### Accesibilidad

Cosas que la primera versión no hacía y esta sí: los modales se cierran con
`Escape`, atrapan el foco, lo devuelven a quien los abrió y bloquean el scroll
del fondo; la cuenta regresiva no se recita segundo a segundo en un lector de
pantalla; los ornamentos son `aria-hidden`; hay `focus-visible` en todo lo que
se puede enfocar; y `prefers-reduced-motion` detiene las animaciones.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:8080` |
| `npm run build` | Comprueba tipos y compila a `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run format` | Prettier |

---

## Datos personales

El listado de invitados tiene nombres y teléfonos de gente real. **Nunca debe
versionarse.**

`scripts/data/` y todos los `*.xlsx` están en `.gitignore` a propósito, y lo
único que se versiona ahí es un ejemplo con datos inventados. `robots.txt`
bloquea la indexación completa del sitio, porque cada enlace contiene el nombre
y el teléfono de una persona.

---

## Licencia

[MIT](./LICENSE) — el código. Las fotos y la música del repositorio son
material de ejemplo; sustitúyelos por los tuyos.
