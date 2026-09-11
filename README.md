<h1 align="center">Invitación Digital</h1>

<p align="center">
  Invitaciones de boda <strong>personalizadas por invitado</strong>, con confirmación de
  asistencia persona por persona sobre Google Sheets.<br>
  Una plantilla: cambias un archivo de configuración y tienes otro evento.
</p>

<p align="center">
  <a href="#-demo"><strong>Demo</strong></a> ·
  <a href="#cómo-funciona"><strong>Cómo funciona</strong></a> ·
  <a href="#puesta-en-marcha"><strong>Puesta en marcha</strong></a> ·
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

**[invitacion-digital-sigma.vercel.app](https://invitacion-digital-sigma.vercel.app)**

La invitación es personal: cada enlace lleva el nombre del grupo invitado. Para
verla como la ve un invitado de verdad:

```
https://invitacion-digital-sigma.vercel.app/?inv=Andr%C3%A9s%20Betancur%20%26%20Laura%20Mej%C3%ADa%20(Tom%C3%A1s)&tel=3001234567
```

Sin esos parámetros funciona igual, pero saluda de forma genérica y el
formulario de confirmación queda deshabilitado. Es intencional.

> Los nombres, las fotos y la música del repositorio son material de ejemplo.

---

## El problema

Una boda de ochenta grupos familiares. Confirmar asistencia por WhatsApp
significa que alguien tiene que leer ochenta conversaciones, interpretar
respuestas como *"vamos casi todos"* y llevar la cuenta a mano para darle un
número al salón.

Y una imagen de invitación reenviada ochenta veces no le dice a nadie *"tú
estás invitado"*.

Este proyecto resuelve las tres partes a la vez:

| Necesidad | Cómo se resuelve |
|---|---|
| Que cada invitado se sienta invitado personalmente | Enlace único con su nombre y el de sus acompañantes |
| Saber exactamente cuántas personas van | Confirmación **por persona**, escrita directo en Google Sheets |
| Enviar ochenta invitaciones sin perder la cabeza | CLI de Python que abre WhatsApp Web con el mensaje listo |

> Nace de una necesidad real, de una boda de verdad y de un problema que no
> tenía una herramienta razonable detrás. Está construido para volver a
> usarse: lo que cambia entre un evento y otro vive en un archivo, y lo demás
> no se toca.

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
  │ Enlace único     ├────────►│  │ ☑ Andrés      │  │                  │
  │ + firma HMAC     │  App    │  │ ☑ Laura       │  │        ┌─────────┴──────┐
  └──────────────────┘         │  │ ☐ Tomás       │  │        │  Apps Script   │
                               │  └───────────────┘  │        │  + firma HMAC  │
                               └─────────────────────┘        └────────────────┘
```

### 1 · La identidad viaja en la URL

```
Andrés Betancur & Laura Mejía (Tomás, Sara)
       │                │            │
  titular 1        titular 2    acompañantes
```

`?inv=` no lleva un nombre, lleva un **grupo**. La invitación lo descompone y
genera una casilla por persona, así que una familia de cuatro puede responder
"vamos tres" sin que nadie tenga que interpretar un mensaje de voz.

Esa sintaxis es para la máquina, no para el invitado: el mensaje de WhatsApp
saluda con *"¡Hola Andrés y Laura!"*, no con la cadena entera.

### 2 · El RSVP vive en Google Sheets

Una Web App de Apps Script hace de API: `doGet` devuelve lo que el invitado ya
había respondido (para que al reabrir el enlace vea su respuesta y no un
formulario en blanco) y `doPost` escribe o actualiza su fila.

Sin servidor, sin base de datos, sin coste — y los novios ven las
confirmaciones llegar en una hoja de cálculo que ya saben usar.

### 3 · Cada invitado solo puede tocar su propia fila

Una Web App de Apps Script publicada "para cualquier usuario" no tiene
autenticación. Con solo la URL y un teléfono se podría leer —o sobrescribir— la
confirmación de otro invitado.

La solución es una firma HMAC-SHA256 del teléfono que viaja en el enlace:

```
…/?inv=Camila+Ospina&tel=3001234567&f=a1b2c3d4e5f6
                                      └── HMAC-SHA256(telefono, SECRETO)[:12]
```

El secreto vive **solo** en las propiedades del Apps Script y en el `.env` de
quien envía las invitaciones. Nunca llega al navegador: el invitado recibe su
firma ya calculada y la reenvía sin saber qué significa. La única firma que
tiene es la suya.

La firma prueba **de quién** es la fila, no qué se escribe en ella, así que el
servidor además recorta cada celda antes de guardarla. Con el nombre y el
teléfono viajando en la URL, el mapa embebido va con `referrerPolicy="no-referrer"`:
un iframe de Google no tiene por qué recibir los datos del invitado en la
cabecera `Referer`.

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

Y como la fecha está escrita en los dos sitios por necesidad, hay un test que
comprueba que siguen coincidiendo. Desincronizarlas produce el peor fallo
imaginable aquí: un formulario que se ve perfectamente normal y que el servidor
rechaza en silencio.

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

Es un fallo que ocurrió en producción, y por eso esa regla está escrita en el
código y no solo en la cabeza de alguien.

La regla tiene una segunda mitad: **la hoja tampoco manda sobre quién está
invitado.** Lo que llega del servidor solo puede marcar o desmarcar a las
personas que vienen en el enlace. Si se corrige un grupo y se reenvía el
enlace, el nombre que ya no está se ignora en vez de colarse como un asistente
que nadie ve en el formulario.

---

## Puesta en marcha

De un repositorio recién clonado a ochenta invitaciones enviadas hay **seis
pasos**. Los tres primeros son la invitación; los tres últimos, las
confirmaciones. Está todo aquí, y cada paso enlaza al detalle cuando lo tiene.

| # | Paso | Cuánto | Detalle |
|---|---|---|---|
| [1](#1--instalar) | Instalar | 2 min | — |
| [2](#2--los-datos-del-evento) | Los datos del evento | 20 min | este archivo |
| [3](#3--las-fotos-y-la-música) | Las fotos y la música | 10 min | este archivo |
| [4](#4--el-backend-de-confirmaciones) | El backend de confirmaciones | 10 min, una vez | [`apps-script/README.md`](./apps-script/README.md) |
| [5](#5--variables-de-entorno-y-despliegue) | Variables de entorno y despliegue | 10 min | este archivo |
| [6](#6--enviar-las-invitaciones) | Enviar las invitaciones | una tarde | [`scripts/README.md`](./scripts/README.md) |

Los pasos 1 a 3 se pueden hacer sin tocar Google: la invitación funciona en
local desde el minuto uno, solo que el botón de confirmar no guarda nada.

---

### 1 · Instalar

```sh
git clone https://github.com/Farid13-dev/invitacion-digital.git
cd invitacion-digital
npm install
cp .env.example .env
npm run dev
```

En `localhost:8080` ya está la invitación de ejemplo. Para verla como la vería
un invitado de verdad, añade sus parámetros a la URL:

```
http://localhost:8080/?inv=Camila%20Ospina&tel=3001234567
```

---

### 2 · Los datos del evento

Solo hay **dos archivos** que editar:

| Archivo | Qué cambia |
|---|---|
| **`src/config/evento.ts`** | Nombres, fechas, sedes, textos, fotos, cortes del RSVP |
| **`src/config/meta.ts`** | Idioma, título de la pestaña y vista previa al compartir el enlace |

Están separados por un motivo técnico, no por capricho: los rastreadores de
WhatsApp y Facebook no ejecutan JavaScript, así que las etiquetas Open Graph se
inyectan en el HTML durante el build y tienen que estar en un módulo que Vite
pueda leer desde Node.

`src/config/tipos.ts` es el contrato de los dos: si falta un campo obligatorio,
`npm run typecheck` lo dice antes de desplegar en vez de dejar un hueco en la
página.

Tres detalles que conviene no descubrir tarde:

- **Las fechas van en ISO 8601 con offset**: `"2027-05-15T16:00:00-05:00"`. Sin
  el `-05:00`, el navegador de cada invitado interpreta la hora en su propia
  zona y la cuenta regresiva se desfasa.
- **Las coordenadas salen de Google Maps**: clic derecho sobre el punto exacto
  y *copiar coordenadas*. De ahí salen el mapa y el «¿cómo llegar?».
- **Los cortes del RSVP se escriben dos veces**, aquí y en el Apps Script del
  [paso 4](#4--el-backend-de-confirmaciones). Hay un test que comprueba que
  siguen coincidiendo (`npm test`), porque desincronizarlos deja un formulario
  que se ve perfectamente normal y que el servidor rechaza.

La paleta y las tipografías están en **`src/styles/tema.css`**: siete colores
en `oklch` y tres fuentes. Ningún componente sabe de qué boda se trata.

---

### 3 · Las fotos y la música

Van en `src/assets/`, y basta con sustituirlas conservando el nombre:

```
src/assets/
├── pareja/portada.jpg      fondo de la portada (≥1600 px de ancho)
├── galeria/01.jpg … 06.jpg la galería (añade o quita las que quieras)
└── ornamentos/hojas.png    la rama decorativa de las esquinas
```

No hace falta optimizarlas a mano: se importan con las medidas en las que
realmente se muestran y el build genera las variantes.

```ts
import portada from "@/assets/pareja/portada.jpg?w=768;1280;1600&format=avif;webp;jpg&as=picture";
```

Pide solo anchos que el original pueda dar: pedir 1920 de una foto de 1600
genera un reescalado hacia arriba, más pesado y sin un pixel más de detalle.

**La vista previa de WhatsApp es un archivo aparte**, porque tiene su propia
proporción. Regenera `public/og.jpg` a 1200 × 630:

```sh
node -e "require('sharp')('src/assets/pareja/portada.jpg').resize(1200,630,{fit:'cover',position:'attention'}).jpeg({quality:82,mozjpeg:true}).toFile('public/og.jpg')"
```

Si ese archivo falta —o está en tu disco pero sin versionar— el enlace se
comparte sin imagen. Como la invitación se reparte por WhatsApp, es el error
más caro que se puede cometer aquí: compruébalo con `git status` antes de
desplegar.

La canción va en `public/audio/cancion.mp3` y se declara en `evento.musica`;
`musica: null` quita la pantalla de bienvenida. Recórtala y recomprímela antes
de subirla: es lo más pesado de la invitación, y quien entra con música la
descarga entera.

---

### 4 · El backend de confirmaciones

Las confirmaciones se guardan en una hoja de Google Sheets a través de una Web
App de Apps Script. No hay servidor que mantener ni nada que pagar, y los
novios ven las respuestas llegar a una hoja de cálculo que ya saben usar. Se
configura **una vez por evento** y son unos diez minutos.

> **Paso a paso completo, con cada menú de Google:**
> **[`apps-script/README.md`](./apps-script/README.md)**

El resumen, para saber a qué te enfrentas antes de abrirlo:

| | Qué se hace | Detalle |
|---|---|---|
| 1 | Crear una hoja en [sheets.new](https://sheets.new) | [ver](./apps-script/README.md#1-crear-la-hoja) |
| 2 | *Extensiones → Apps Script* y pegar [`Codigo.gs`](./apps-script/Codigo.gs) | [ver](./apps-script/README.md#2-pegar-el-script) |
| 3 | Guardar el secreto en las **propiedades del script**, como `SECRETO_RSVP` | [ver](./apps-script/README.md#3-definir-el-secreto) |
| 4 | Poner las dos fechas de corte, **iguales que en `evento.ts`** | [ver](./apps-script/README.md#4-ajustar-las-fechas-de-corte) |
| 5 | Ejecutar `prepararHoja()` para crear las columnas | [ver](./apps-script/README.md#5-preparar-la-hoja) |
| 6 | Publicar como *aplicación web*: ejecutar como **yo**, acceso para **cualquier usuario** | [ver](./apps-script/README.md#6-publicar-la-web-app) |
| 7 | Copiar la URL que termina en `/exec`: es tu `VITE_RSVP_ENDPOINT` | [ver](./apps-script/README.md#7-conectarla-a-la-invitación) |

El secreto del paso 3 es lo que impide que un invitado lea o sobrescriba la
confirmación de otro. Genéralo así, y guárdalo en los **dos** sitios —las
propiedades del script y tu `.env`— porque tienen que ser idénticos:

```sh
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Antes de seguir, comprueba que la firma que calcula Python coincide con la del
Apps Script. Es el fallo más común, y deja a todos los invitados sin poder
confirmar: está explicado en
[«comprobar que funciona»](./apps-script/README.md#comprobar-que-funciona), y
[«si algo va mal»](./apps-script/README.md#si-algo-va-mal) tiene la tabla de
síntomas.

---

### 5 · Variables de entorno y despliegue

El `.env` de la raíz lo comparten la invitación y el script de envío, pero **no
todo es público**:

| Variable | Quién la usa | ¿Va en Vercel? |
|---|---|---|
| `VITE_RSVP_ENDPOINT` | El navegador del invitado | **Sí** |
| `SECRETO_RSVP` | El script de envío, en tu máquina | **No, nunca** |
| `INVITACION_URL` | El script de envío | No |
| `INDICATIVO_PAIS` | El script de envío | No |

Todo lo que empieza por `VITE_` se incrusta en el JavaScript que descarga el
navegador y cualquiera puede leerlo. `SECRETO_RSVP` no lleva ese prefijo a
propósito: si llega al navegador, deja de servir para nada. Hay un ejemplo
comentado en [`.env.example`](./.env.example).

Para desplegar, importa el repositorio en Vercel. `vercel.json` ya trae el
framework, los rewrites de SPA y las cabeceras de caché y seguridad; lo único
que hay que añadir a mano es `VITE_RSVP_ENDPOINT` en
*Settings → Environment Variables*.

Después, pon el dominio definitivo en `sitioUrl` de `src/config/meta.ts`: las
etiquetas Open Graph necesitan URLs absolutas, y con una relativa la vista
previa sale vacía.

---

### 6 · Enviar las invitaciones

Un CLI de Python lee tu listado, construye el enlace firmado de cada grupo y va
abriendo WhatsApp Web con el mensaje ya redactado. El envío lo pulsas tú, uno a
uno: no usa ninguna API no oficial.

> **Formato del listado, opciones y plantilla del mensaje:**
> **[`scripts/README.md`](./scripts/README.md)**

```sh
cd scripts
pip install -r requirements.txt        # solo si tu listado es .xlsx

# 1. Ver los enlaces sin abrir nada (haz siempre esto primero)
python enviar_invitaciones.py -a data/invitados.xlsx --modo enlaces

# 2. Probar una sola invitación en el navegador
python enviar_invitaciones.py -a data/invitados.xlsx --modo prueba --limite 1

# 3. Enviar de verdad
python enviar_invitaciones.py -a data/invitados.xlsx
```

El listado es un `.xlsx` o `.csv` con dos columnas, `nombre` y `telefono`, y
**el formato del nombre no es decorativo** — de ahí salen las casillas de la
confirmación:

```
Andrés Betancur & Laura Mejía (Tomás, Sara)
       │                │            │
  titular 1        titular 2    acompañantes
```

Va en `scripts/data/`, que está en `.gitignore` a propósito: son nombres y
teléfonos de gente real. Más en [«el listado»](./scripts/README.md#el-listado).

Lo demás que conviene leer antes de mandar ochenta mensajes:
[el orden correcto](./scripts/README.md#el-orden-correcto) ·
[todas las opciones](./scripts/README.md#opciones) ·
[la plantilla del mensaje](./scripts/README.md#el-mensaje) ·
[si se interrumpe](./scripts/README.md#si-se-interrumpe) ·
[aviso sobre WhatsApp](./scripts/README.md#aviso-sobre-whatsapp)

---

### Y cuando pase la boda

`contarAsistentes()`, en el editor de Apps Script, imprime el total de personas
confirmadas y en cuántos grupos: es el número que pide el salón. Cuando ya no
haga falta, archivar la implementación desactiva el endpoint sin borrar la hoja
ni los datos — [«al terminar el evento»](./apps-script/README.md#al-terminar-el-evento).

---

## Estructura

```
src/
├── config/
│   ├── evento.ts        ← los datos del evento (el archivo a editar)
│   ├── meta.ts          ← idioma, título y vista previa al compartir
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
│                        (cada uno con su *.test.ts al lado)
└── styles/tema.css      ← la paleta y las tipografías

apps-script/Codigo.gs    la Web App del RSVP
scripts/                 el CLI de envío por WhatsApp
```

Las tres capas no se mezclan: `lib/` no importa React, `hooks/` no pinta nada y
los componentes no saben de dónde salen los datos.

Las dos piezas que viven fuera de `src/` tienen su propia documentación, y
están enlazadas desde los pasos [4](#4--el-backend-de-confirmaciones) y
[6](#6--enviar-las-invitaciones):

| Carpeta | Qué es | Documentación |
|---|---|---|
| [`apps-script/`](./apps-script) | La Web App que lee y escribe la hoja de cálculo | [README](./apps-script/README.md) |
| [`scripts/`](./scripts) | El CLI que genera los enlaces y abre WhatsApp Web | [README](./scripts/README.md) |

---

## Decisiones técnicas

### Por qué no hay framework de servidor

La invitación es una sola vista cuyo estado vive entero en el cliente:
parámetros de URL, `localStorage` y un `fetch` a Apps Script. El SSR solo
aportaría las etiquetas Open Graph, y eso lo resuelve un plugin de 40 líneas en
`vite.config.ts` que las inyecta en el HTML durante el build.

Lo que se gana: **20 dependencias declaradas en vez de 70**, un build de tres
segundos y un sitio estático que no tiene servidor que se caiga ni función que
arranque en frío.

### Qué se prueba y qué no

No hay tests de componentes, y es deliberado: un test que comprueba que un
`<h1>` contiene un nombre envejece peor que el propio `<h1>`. Lo que sí está
cubierto es `lib/`, que es donde vive lo que puede estar mal sin que se note:
cómo se parte un grupo en personas, cómo se normaliza un teléfono, la
aritmética de las fechas con offset y la validez del respaldo local.

Del lado de Python, el CI genera los enlaces desde el listado de ejemplo y fija
un vector HMAC: si alguien cambia el algoritmo o la longitud de la firma, todos
los enlaces ya enviados dejarían de validar en silencio.

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

La portada pasa de **340 KB** (un único JPEG igual para todos) a **63 KB** en
móvil. Los `width`/`height` del original viajan en el `<img>`, así que el texto
no salta cuando la foto termina de cargar.

### Accesibilidad

Los modales se cierran con `Escape`, atrapan el foco, lo devuelven a quien los
abrió y bloquean el scroll del fondo; y solo se cierran al pulsar fuera si el
gesto **empezó** fuera, para que seleccionar texto en el formulario y soltar el
ratón en el borde no se lleve por delante lo escrito.

Además: la cuenta regresiva no se recita segundo a segundo en un lector de
pantalla, los ornamentos son `aria-hidden`, hay `focus-visible` en todo lo que
se puede enfocar y `prefers-reduced-motion` detiene las animaciones.

---

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `localhost:8080` |
| `npm run build` | Comprueba tipos y compila a `dist/` |
| `npm test` | Tests de `lib/` y de la configuración |
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
y el teléfono de una persona — y por la misma razón ningún recurso de terceros
recibe la URL de la invitación.

---

## Licencia

[MIT](./LICENSE) — el código. Las fotos y la música del repositorio son
material de ejemplo; sustitúyelos por los tuyos.
