# Envío de invitaciones

<sub>[← README principal](../README.md) · **paso 6 de 6** de la
[puesta en marcha](../README.md#puesta-en-marcha) · antes de esto necesitas el
[backend de confirmaciones](../apps-script/README.md) publicado</sub>

Genera un enlace único y firmado para cada invitado y abre WhatsApp Web con el
mensaje ya escrito. Tú solo pulsas Enter.

```sh
python enviar_invitaciones.py --archivo data/invitados.xlsx
```

---

## El listado

Un `.xlsx` o `.csv` con dos columnas, `nombre` y `telefono`:

| nombre | telefono |
|---|---|
| `Camila` | `3001234567` |
| `Andrés & Laura` | `3007654321` |
| `Julián & Paula (Tomás)` | `3009998877` |

Hay un ejemplo en [`data/invitados.ejemplo.csv`](./data/invitados.ejemplo.csv).

**El formato del nombre importa**, no es decorativo:

```
Andrés & Laura (Tomás, Sara)
       │               │            │
  titular 1       titular 2    acompañantes
```

De ahí salen las casillas del formulario de confirmación. Un grupo de cuatro
verá cuatro casillas y podrá responder "vamos tres".

> **En CSV, un nombre con coma va entre comillas:**
> `"Familia Quintero (Emilia, Samuel)",3005554433`.
> Sin ellas, la coma parte la fila y el teléfono acaba en la columna
> equivocada. En `.xlsx` no hace falta.

### Dónde ponerlo

En `scripts/data/`. Esa carpeta está en `.gitignore` **a propósito**: el
listado tiene nombres y teléfonos de gente real y no debe acabar en GitHub.
Lo único que se versiona ahí es el ejemplo con datos inventados.

---

## Configuración

En el `.env` de la raíz del proyecto:

```
INVITACION_URL="https://tu-invitacion.vercel.app"
SECRETO_RSVP="el-mismo-secreto-de-las-propiedades-del-apps-script"
INDICATIVO_PAIS="57"
```

Si vas a leer `.xlsx`:

```sh
pip install -r requirements.txt
```

Con `.csv` no hace falta instalar nada.

---

## El orden correcto

### 1. Revisar los enlaces sin abrir nada

```sh
python enviar_invitaciones.py -a data/invitados.xlsx --modo enlaces
```

Escribe `enlaces-generados.csv` y no abre ni una pestaña. Aquí se ven los
teléfonos mal escritos, los duplicados y los nombres con espacios raros,
**antes** de mandarle nada a nadie.

### 2. Probar una invitación de verdad

```sh
python enviar_invitaciones.py -a data/invitados.xlsx --modo prueba --limite 1
```

Abre la invitación en el navegador tal como la verá el invitado, sin WhatsApp.
Comprueba que sale su nombre y que el formulario de confirmación funciona.

### 3. Enviar

```sh
python enviar_invitaciones.py -a data/invitados.xlsx
```

Pide confirmación, dice cuánto va a tardar y va abriendo pestañas de WhatsApp
Web con el mensaje redactado. **Tú pulsas Enter en cada una.**

Necesitas la sesión de WhatsApp Web ya iniciada en el navegador por defecto.

---

## Opciones

| Opción | Para qué |
|---|---|
| `-a`, `--archivo` | Listado de invitados (obligatorio) |
| `-u`, `--url` | URL base de la invitación (o `INVITACION_URL` del `.env`) |
| `--modo` | `whatsapp` (por defecto) · `enlaces` · `prueba` |
| `-m`, `--mensaje` | Plantilla de texto (por defecto `mensaje.txt` si existe) |
| `-i`, `--indicativo` | Indicativo del país sin `+` (por defecto `57`) |
| `-e`, `--espera` | Segundos entre envíos (por defecto `15`) |
| `--desde N` | Empezar en la fila N — para reanudar |
| `--limite N` | Enviar como mucho N |
| `--solo TEL` | Reenviar a una sola persona |
| `--sin-firma` | Enlaces sin firma HMAC (solo pruebas locales) |

`python enviar_invitaciones.py --help` lo tiene todo.

---

## Si se interrumpe

Da igual: el script te dice exactamente cómo seguir.

```
  Interrumpido en la fila 34.
  Para continuar (comprueba si esa última llegó a enviarse):
      python enviar_invitaciones.py -a data/invitados.xlsx --desde 34
```

Reanuda en la fila interrumpida, no en la siguiente: nadie sabe si esa llegó a
enviarse. Repetir una invitación es una anécdota; olvidarse de un invitado es
una silla vacía que no tiene explicación.

`enlaces-generados.csv` queda escrito desde el principio, así que siempre
puedes copiar un enlace suelto y mandarlo a mano.

---

## El mensaje

Edita [`mensaje.txt`](./mensaje.txt). Acepta tres marcadores:

| Marcador | Qué pone | Ejemplo |
|---|---|---|
| `{nombre}` | Cómo se saluda al grupo | `Andrés y Laura` |
| `{grupo}` | La cadena del listado, entera | `Andrés & Laura (Tomás)` |
| `{enlace}` | Su enlace único | `https://…/?inv=…&tel=…&f=…` |

`{nombre}` no es lo mismo que `{grupo}`: el listado usa una sintaxis que la
invitación necesita para generar las casillas, pero que no se le escribe a
nadie por WhatsApp. *"¡Hola Andrés & Laura (Tomás)!"* se
convierte en *"¡Hola Andrés y Laura!"*. Los titulares que no son una persona
(`Familia Quintero`) se saludan enteros.

`{enlace}` es **obligatorio**: sin él el invitado recibiría un mensaje sin
invitación, así que el script se niega a arrancar.

La plantilla se valida entera antes de abrir la primera pestaña. Si lleva una
llave suelta, el script lo dice y no envía nada — en vez de reventar en el
invitado 47 con cuarenta pestañas ya abiertas. Para escribir una llave
literal, dóblala: `{{` y `}}`.

---

## Qué es la firma del enlace

Cada enlace lleva un parámetro `f`:

```
https://tu-invitacion.vercel.app/?inv=Camila&tel=3001234567&f=a1b2c3d4e5f6
                                                                    └── HMAC-SHA256
```

Es `HMAC-SHA256(telefono, SECRETO_RSVP)` recortada a 12 caracteres. El Apps
Script la recalcula y, si no coincide, rechaza la petición.

Sin ella, la Web App de Apps Script —que está publicada "para cualquier
usuario", porque los invitados no inician sesión— dejaría que cualquiera leyera
o sobrescribiera la confirmación de otro simplemente probando teléfonos.

El secreto vive en las propiedades del Apps Script y en tu `.env`. **Nunca
llega al navegador**: el invitado recibe su firma ya calculada y la reenvía sin
saber qué significa, así que solo puede tocar su propia fila.

---

## Aviso sobre WhatsApp

Esto abre WhatsApp **Web** con el mensaje preescrito; el envío lo haces tú,
manualmente, uno a uno. No automatiza el envío ni usa una API no oficial, que
es la forma habitual de que te bloqueen la cuenta.

Aun así, mandar decenas de mensajes seguidos a números que no te tienen
agendado puede hacer que te marquen como spam. Por eso la espera por defecto
es de 15 segundos y conviene no bajarla.

---

**Enlaces útiles:** [la firma del enlace, explicada](../README.md#3--cada-invitado-solo-puede-tocar-su-propia-fila) ·
[el backend que recibe las confirmaciones](../apps-script/README.md) ·
[README principal](../README.md)
