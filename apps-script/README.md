# Backend de confirmaciones (Google Apps Script)

<sub>[← README principal](../README.md) · **paso 4 de 6** de la
[puesta en marcha](../README.md#puesta-en-marcha) · siguiente:
[variables de entorno y despliegue](../README.md#5--variables-de-entorno-y-despliegue)</sub>

El RSVP se guarda en una hoja de Google Sheets a través de una Web App de Apps
Script. No hay servidor que mantener, no cuesta nada, y los novios ven las
confirmaciones llegar en una hoja de cálculo que ya saben usar.

Son diez minutos de configuración. Hazla **una sola vez por evento**.

---

## 1. Crear la hoja

1. Crea una hoja nueva en [sheets.new](https://sheets.new).
2. Ponle un nombre reconocible, p. ej. `RSVP — Boda Valentina y Mateo`.

## 2. Pegar el script

1. En la hoja: **Extensiones → Apps Script**.
2. Borra el `function myFunction() {}` que viene de ejemplo.
3. Pega el contenido completo de [`Codigo.gs`](./Codigo.gs).
4. Guarda con `Ctrl+S`.

## 3. Definir el secreto

Este es el valor que impide que alguien lea o modifique la confirmación de
otro invitado. Genera uno largo y aleatorio:

```sh
# En cualquier terminal con Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

En el editor de Apps Script:

1. **⚙ Configuración del proyecto** (el engranaje de la izquierda).
2. Baja hasta **Propiedades del script → Añadir propiedad de script**.
3. Propiedad: `SECRETO_RSVP` · Valor: el que acabas de generar.
4. **Guardar propiedades del script**.

> Guarda ese mismo valor en el archivo `.env` del proyecto, como
> `SECRETO_RSVP=…`. El script de Python lo necesita para firmar los enlaces, y
> tienen que ser **exactamente el mismo**.

## 4. Ajustar las fechas de corte

En `Codigo.gs`, arriba del todo:

```js
CIERRE_NUEVOS:          "2027-05-01T23:59:00-05:00",
CIERRE_ACTUALIZACIONES: "2027-05-12T23:59:00-05:00",
```

Tienen que coincidir con `rsvp.cierreNuevos` y `rsvp.cierreActualizaciones` de
`src/config/evento.ts`. El frontend esconde el formulario cuando pasan, pero
**quien decide de verdad es este script**: sin esta validación, cualquiera
podría enviar un POST a mano después del cierre.

El `-05:00` es el offset de Colombia. No lo omitas: sin él, Apps Script usa la
zona horaria del proyecto, que no siempre es la que crees.

## 5. Preparar la hoja

En el editor, selecciona la función `prepararHoja` en el desplegable de arriba
y pulsa **Ejecutar**. Google pedirá permisos la primera vez (es tu propio
script accediendo a tu propia hoja: **Revisar permisos → Avanzado → Ir a…**).

Debería aparecer una pestaña `Confirmaciones` con sus encabezados.

## 6. Publicar la Web App

1. **Implementar → Nueva implementación**.
2. Tipo (el engranaje): **Aplicación web**.
3. Configura:

   | Campo | Valor |
   |---|---|
   | Descripción | `RSVP v1` |
   | Ejecutar como | **Yo** |
   | Quién tiene acceso | **Cualquier usuario** |

4. **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).

> «Cualquier usuario» suena peligroso pero es obligatorio: los invitados no
> tienen cuenta de Google ni van a iniciar sesión. Lo que protege la hoja es la
> firma HMAC, no el control de acceso de Google.

## 7. Conectarla a la invitación

En el `.env` del proyecto:

```
VITE_RSVP_ENDPOINT="https://script.google.com/macros/s/AKfycb.../exec"
SECRETO_RSVP="el-mismo-secreto-del-paso-3"
INVITACION_URL="https://tu-invitacion.vercel.app"
```

Y en Vercel: **Settings → Environment Variables → `VITE_RSVP_ENDPOINT`**.
(`SECRETO_RSVP` **no** va en Vercel: no debe llegar nunca al navegador.)

---

## Comprobar que funciona

En el editor de Apps Script, ejecuta `probarFirma` y mira el registro:

```
telefono: 3001234567
firma:    a1b2c3d4e5f6
```

Ahora la misma firma desde Python:

```sh
cd scripts
python -c "import enviar_invitaciones as e, os; print(e.firmar('3001234567', os.environ['SECRETO_RSVP']))"
```

**Si los dos valores no son idénticos, ningún invitado podrá confirmar.** Casi
siempre es que el secreto de `.env` y el de las propiedades del script no
coinciden (un espacio de más al copiar, normalmente).

Con eso comprobado, prueba el endpoint entero abriendo en el navegador:

```
https://script.google.com/macros/s/.../exec?telefono=3001234567&firma=a1b2c3d4e5f6
```

Debe responder `{"found":false}` (aún no hay nadie confirmado). Si cambias un
carácter de la firma, debe responder `{"found":false,"status":"unauthorized"}`.

---

## Al terminar el evento

`contarAsistentes()` imprime el total de personas confirmadas y en cuántos
grupos, que es el número que pide el salón.

Cuando ya no haga falta, **Implementar → Gestionar implementaciones → Archivar**
desactiva el endpoint sin borrar la hoja ni los datos.

---

## Si algo va mal

| Síntoma | Causa habitual |
|---|---|
| Todo responde `unauthorized` | El secreto de `.env` y el de las propiedades del script no coinciden |
| `Falta la propiedad SECRETO_RSVP` | El paso 3 no se guardó, o se guardó en la implementación equivocada |
| Los cambios en el código no se notan | Apps Script sirve la **implementación publicada**, no el editor: hay que crear una versión nueva en *Gestionar implementaciones* |
| La consulta tarda segundos | Normal en la primera petición tras un rato (arranque en frío de Apps Script) |
| `No existe la hoja "Confirmaciones"` | Falta ejecutar `prepararHoja` (paso 5) |

---

Con el endpoint publicado, vuelve a la puesta en marcha:
**[5 · Variables de entorno y despliegue](../README.md#5--variables-de-entorno-y-despliegue)**
y luego **[6 · Enviar las invitaciones](../README.md#6--enviar-las-invitaciones)**.
