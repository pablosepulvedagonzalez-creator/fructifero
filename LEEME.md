# Fructífero · Tienda online

Sitio listo para publicar, con:
- Carrito de compras con 3 formatos por producto (250 g, 500 g y 1 kg).
- **Pago con tarjeta mediante Mercado Pago (Checkout Pro).** El cliente paga en la página segura de Mercado Pago y vuelve a tu sitio.
- **Pedido por transferencia:** se abre tu WhatsApp con el pedido completo, para que respondas con los datos bancarios.
- Página de confirmación (`gracias.html`) para pago aprobado, pendiente o rechazado.

---

## Ver la página en tu computador

Haz doble clic en `index.html`: se abre en tu navegador con todos los productos, fotos, carrito y buscador. El pago con Mercado Pago solo funciona cuando el sitio está publicado (paso 3).

---

## 1. Completa tus datos (archivo `config.js`)

Abre `config.js` con el Bloc de notas (o con VS Code) y cambia:

| Campo | Qué poner |
|---|---|
| `whatsapp` | Tu número con código de país, solo dígitos. Ej: `56912345678` |
| `correo`, `instagram` | Tus datos de contacto |
| `plazoEntrega`, `retiro` | Ej: `'2 días hábiles'`, `'Huechuraba'` |
| `envioGratisDesde` | Monto para envío gratis en la RM, sin puntos. Ej: `50000`. Bajo ese monto y a regiones el envío es por pagar. |
| `productos` → `precio` | Precio del formato 250 g, sin puntos |

**Productos y precios:** están cargados desde tu lista de precios (120 productos con precio, en 5 secciones). Para cambiar un precio, busca el producto en `PRODUCTOS` y edita el número, ej: `kg(7500, 19000)` significa 1 kg a $7.500 y 5 kg a $19.000.

- **Agregar un sabor de maní confitado:** agrega el nombre entre comillas a la lista de sabores.
- **Productos tipo `'tarjeta'`** se muestran con foto y selector de sabor; **tipo `'lista'`** aparecen en la lista de precios de su sección.
- **Maní japonés** está marcado `consultar: true` porque la lista no traía precio: muestra un botón para consultar por WhatsApp. Cuando tengas el precio, quita `consultar: true` y pon los precios en cada sabor.

**Fotos:** cada producto y cada sabor tiene su foto en `imagenes/productos/`, y la página la busca por nombre. Para cambiar una foto, reemplaza el archivo manteniendo el mismo nombre (cuadrada, fondo blanco, JPG). Ejemplos:
- Maní confitado sabor frutilla → `mani-confitado-frutilla.jpg`
- Maní tostado merkén → `mani-tostado-merken.jpg`
- Bañados en chocolate → `chocolate-` + nombre, ej. `chocolate-pasas-banadas-en-chocolate.jpg`
- Productos de una sola variedad → su `id`, ej. `pistachos.jpg`, `gomitas-docile.jpg`

**Historia de la marca:** en `index.html`, busca `[CUENTA AQUÍ LA HISTORIA DE TU MARCA` y reemplaza ese texto.

> Los precios de `config.js` son los que se cobran de verdad: el servidor los recalcula y no confía en lo que diga el navegador.

---

## 2. Crea tu cuenta de Mercado Pago y obtén la clave

1. Crea o entra a tu cuenta en **mercadopago.cl** y completa la validación de identidad. Si no lo haces, Mercado Pago rechaza los pagos.
2. Entra a **mercadopago.cl/developers** → **Tus integraciones** → **Crear aplicación**. Elige *Pagos online* → *Checkout Pro*.
3. En la aplicación, abre **Credenciales de prueba** y copia el **Access Token** (empieza con `APP_USR-` o `TEST-`).
4. Guárdalo en un lugar seguro. **Nunca lo pegues en `config.js` ni lo compartas.** Va solo en Vercel (paso 3).

---

## 3. Publica el sitio en Vercel (gratis)

1. Crea una cuenta en **github.com**, luego crea un repositorio nuevo (privado) llamado `fructifero`.
2. En el repositorio, haz clic en **Add file → Upload files** y arrastra **todo el contenido** de esta carpeta (incluida la carpeta `api` y la carpeta `imagenes`). Clic en **Commit changes**.
3. Crea una cuenta en **vercel.com** entrando con tu cuenta de GitHub.
4. **Add New → Project** → elige el repositorio `fructifero` → antes de publicar, abre **Environment Variables** y agrega:
   - `MP_ACCESS_TOKEN` = el Access Token del paso 2
5. Clic en **Deploy**. En un minuto tendrás tu sitio en una dirección como `fructifero.vercel.app`.

Cada vez que cambies un archivo en GitHub, Vercel actualiza el sitio solo.

---

## 4. Prueba antes de vender

Con las **credenciales de prueba**, haz una compra completa usando las **tarjetas de prueba** que aparecen en la documentación de Mercado Pago (*Checkout Pro → Probar integración*). Revisa que:
- Te lleve a Mercado Pago con el monto correcto (productos + envío).
- Al pagar vuelvas a la página "¡Gracias por tu compra!".
- La opción **Transferencia** abra tu WhatsApp con el pedido.

---

## 5. Empieza a vender de verdad

1. En Mercado Pago, abre **Credenciales de producción** y copia ese Access Token.
2. En Vercel → tu proyecto → **Settings → Environment Variables**, reemplaza `MP_ACCESS_TOKEN` por el de producción.
3. **Deployments → Redeploy.** Listo: los pagos ya son reales.

**¿Dónde veo los pedidos pagados?** En tu cuenta de Mercado Pago, sección **Actividad**. Cada pago trae el número de pedido (`FR-…`), los productos y el correo del cliente; la dirección de despacho va en los datos adicionales del pago.

---

## Dominio propio (opcional)

Si compras `fructifero.cl` (en nic.cl), en Vercel → **Settings → Domains** lo agregas y sigues las instrucciones. Después agrega la variable `SITE_URL=https://fructifero.cl` y vuelve a publicar.

---

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `config.js` | **Lo único que necesitas editar:** productos, precios, contacto y envío |
| `index.html` | La página principal |
| `styles.css` | Colores y diseño |
| `app.js` | Carrito y envío del pedido |
| `gracias.html` | Página que ve el cliente después de pagar |
| `api/crear-pago.js` | Conexión segura con Mercado Pago (corre en Vercel) |
| `imagenes/` | Ilustraciones de productos, logo y portada |
| `.env.example` | Nombres de las claves que van en Vercel |
| `vercel.json` | Le indica a Vercel que el cobro use los precios de `config.js` |
