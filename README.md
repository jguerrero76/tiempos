# tiempos-api

API que hace de proxy entre tu web (`autobusescordoba.es`) y la API interna de AUCORSA,
para consultar los tiempos de llegada de autobuses a una parada.

En lugar de que el frontend llame directamente a `aucorsa.es`, llama a esta API:

```
GET /api/tiempos?parada=413&linea=4
```

y esta API internamente llama a:

```
GET https://aucorsa.es/wp-json/aucorsa/v1/estimations/stop?line=&current_line=4&stop_id=413&_wpnonce=...
```

reenviando la cookie de sesión y el nonce necesarios.

## ⚠️ Aviso de seguridad importante

La cookie que copiaste del navegador (`AUCORSA_COOKIE`) contiene tu **sesión personal
de WordPress logueada** en aucorsa.es (email, hash de sesión, cookie de firewall, etc.).
Con esa cookie cualquiera podría hacerse pasar por tu cuenta en aucorsa.es.

- **Nunca la subas a git.** Va en `.env`, que está en `.gitignore`, y solo se documenta
  como placeholder vacío en `.env.example`.
- Si en algún momento se filtra (por ejemplo la pegaste en un chat, un issue, un log
  público...), cierra sesión en aucorsa.es desde todos los dispositivos y vuelve a
  loguearte para invalidarla.
- En producción, guárdala como variable de entorno/secreto de tu plataforma de
  despliegue (Vercel, Railway, Fly.io...), no en un archivo dentro del repo.

## Cómo obtener `AUCORSA_COOKIE` y `AUCORSA_NONCE`

1. Entra logueado en https://aucorsa.es en tu navegador.
2. Abre DevTools → pestaña Network.
3. Visita la página de una línea (p. ej. `/linea/1/`) o refresca la parada.
4. Busca la petición a `wp-json/aucorsa/v1/estimations/stop`.
5. Copia el valor completo del header `cookie` → `AUCORSA_COOKIE`.
6. Copia el valor de `_wpnonce` de la URL → `AUCORSA_NONCE` (opcional, ver abajo).

Los nonces de WordPress caducan (normalmente en un par de días). Esta API intenta
refrescar el nonce automáticamente antes de cada consulta, visitando la página de la
línea y extrayéndolo del HTML. `AUCORSA_NONCE` solo se usa como valor de reserva si ese
refresco automático falla. Si el scraping deja de funcionar (porque AUCORSA cambia su
web), puedes seguir funcionando actualizando `AUCORSA_NONCE` a mano y reiniciando.

La cookie de sesión, en cambio, no se puede refrescar automáticamente: cuando caduque
(o cierres sesión), tendrás que repetir estos pasos y actualizar `AUCORSA_COOKIE`.

## Varias cuentas AUCORSA (repartir carga / evitar bloqueos)

Toda la web pasa ahora por esta API usando la(s) cuenta(s) que configures, en vez de
cada visitante hablando directo con AUCORSA desde su propio navegador. Si el tráfico es
alto, eso concentra muchas peticiones bajo una sola identidad, con riesgo de que
Wordfence (el firewall de AUCORSA) lo trate como sospechoso y bloquee esa cuenta/IP.

Para repartir la carga, define `AUCORSA_COOKIES` (en vez de `AUCORSA_COOKIE`) con una
cookie completa por línea, una por cada cuenta AUCORSA que tengas:

```
AUCORSA_COOKIES="cookieyes-consent=...; wordpress_logged_in_...=cuenta1@example.com...
cookieyes-consent=...; wordpress_logged_in_...=cuenta2@example.com..."
```

Comportamiento:

- Las peticiones rotan entre cuentas por turno (round-robin) — no todas usan siempre
  la misma.
- Cada cuenta gestiona su propio nonce por separado (el nonce va atado a la sesión de
  WordPress, no se puede compartir entre cuentas).
- Si una cuenta falla la autenticación (403), se aparta automáticamente durante
  `AUCORSA_SESSION_COOLDOWN_MS` (5 minutos por defecto) y las peticiones siguen
  repartiéndose entre el resto, sin caída de servicio mientras quede al menos una
  cuenta sana.

Con una sola cuenta, sigue funcionando igual que antes con `AUCORSA_COOKIE` — no hace
falta cambiar nada si no quieres varias.

## Setup

```bash
npm install
cp .env.example .env
# edita .env: añade AUCORSA_COOKIE y, si quieres cache/histórico, DATABASE_URL
```

### Base de datos (opcional, para cache/histórico)

```bash
docker compose up -d db
npm run db:migrate
```

Si no configuras `DATABASE_URL`, la API funciona igual, solo que sin la cache
persistente en Postgres (solo cache en memoria de corta duración).

### Ejecutar en desarrollo

```bash
npm run dev
```

### Probar

```bash
curl 'http://localhost:3000/api/tiempos?parada=413&linea=4'
```

Añade `&fresh=1` para forzar que ignore la cache y consulte AUCORSA en vivo.

## Comportamiento de la cache

- **Memoria**: cada combinación `parada`+`linea` se sirve desde memoria durante
  `CACHE_TTL_MS` (15s por defecto) para no saturar a AUCORSA.
- **Postgres** (si está configurado): cada respuesta exitosa se guarda. Si AUCORSA
  falla o el nonce/cookie ha caducado, la API sirve la última respuesta guardada
  marcada como `stale: true` en vez de devolver un error, para que tu web no se rompa.

## Respuesta

AUCORSA devuelve un fragmento HTML (pensado para inyectarse directo en su propia web),
no JSON. Esta API lo parsea (`src/services/estimationsParser.ts`) a:

```json
{
  "parada": 413,
  "nombre": "Paseo de los Verdiales D.C.",
  "estimaciones": [
    {
      "linea": "4",
      "ruta": "FIDIANA - RENFE - MIRALBAIDA",
      "color": "#ee96be",
      "minutos1": "4",
      "minutos2": "18"
    }
  ],
  "stale": false
}
```

| Campo | Tipo | Descripción |
|---|---|---|
| `parada` | int | Código de la parada consultada (`?parada=`). |
| `nombre` | string \| null | Nombre de la parada, extraído del propio HTML de AUCORSA (`ppp-stop-label`); `null` si no aparece. |
| `estimaciones` | array | Líneas con sus tiempos de llegada; `[]` si no hay buses (`ppp-no-estimations`). |
| `estimaciones[].linea` | string | Número/código de línea. |
| `estimaciones[].ruta` | string | Descripción del recorrido. |
| `estimaciones[].color` | string | Color hex asociado a la línea. |
| `estimaciones[].minutos1` | string | Minutos hasta el próximo autobús (`"---"` si no hay dato, `"0"` si es "ahora"). |
| `estimaciones[].minutos2` | string | Minutos hasta el segundo autobús (o `"---"`). |
| `stale` | boolean | `true` si AUCORSA falló y se sirvió la última respuesta guardada en Postgres en su lugar. |

Los errores (parámetro `parada` ausente, fallo de AUCORSA sin cache disponible, etc.)
devuelven un objeto JSON `{"error": "...", "detail": "..."}` con el status HTTP
correspondiente (400/500/502).

## Build para producción

```bash
npm run build
npm start
```

## Despliegue en Vercel

El proyecto incluye `api/index.ts` (exporta la app de Express) y `vercel.json`
(reenvía todas las rutas a esa función), que es la forma estándar de desplegar
una app Express como función serverless en Vercel.

En el dashboard de Vercel (Project → Settings → Environment Variables) tienes que
configurar, como mínimo:

- `AUCORSA_COOKIE` (una cuenta) o `AUCORSA_COOKIES` (varias, ver arriba) — obligatoria
  alguna de las dos; si falta, `/api/tiempos` devuelve 500 con detalle (`/health` sigue
  funcionando igual, no depende de esto)
- `AUCORSA_BASE_URL`, `AUCORSA_NONCE`, `AUCORSA_USER_AGENT`, `CACHE_TTL_MS`,
  `AUCORSA_SESSION_COOLDOWN_MS` (opcionales)
- `DATABASE_URL` si quieres cache/histórico en Postgres (usa un proveedor con pooler,
  p. ej. Neon o Supabase, ya que cada instancia de función abre su propia conexión)

Después de añadir/editar variables de entorno hay que volver a desplegar (Vercel no
las aplica a un deployment ya construido).

### Verificar que funciona

```bash
curl https://tiempos-nine.vercel.app/health
curl "https://tiempos-nine.vercel.app/api/tiempos?parada=413&linea=4"
```

- `/health` debería devolver `{"status":"ok"}`. Si da 500, revisa los logs de la
  función en Vercel (Deployments → el deployment → Functions) — casi seguro falta
  `AUCORSA_COOKIE`.
- `/api/tiempos` debería devolver `{"parada":413,"nombre":"...","estimaciones":[...],"stale":false}`
  con datos reales de AUCORSA. Un 502 con `detail` sobre el nonce/cookie significa que la cookie ha
  caducado o `AUCORSA_COOKIE` está mal copiada.

Nota: al ser funciones serverless, la cache en memoria (y el nonce cacheado) se
resetean en cada arranque en frío de la función, así que verás más tráfico hacia
`aucorsa.es` del que verías en un servidor persistente; para cache real entre
invocaciones usa `DATABASE_URL`.
