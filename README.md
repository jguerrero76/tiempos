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

Los tiempos de llegada son datos públicos (aucorsa.es los muestra igual sin haber
iniciado sesión, comprobado en incógnito), así que esta API consulta AUCORSA de forma
**anónima**: no usa ninguna cookie de usuario ni cuenta. Solo necesita el `_wpnonce`,
que la propia API obtiene y refresca automáticamente leyéndolo del HTML público de la
página de cada línea — no hay ningún dato personal de por medio.

## Setup

```bash
npm install
cp .env.example .env
# opcional: añade DATABASE_URL en .env si quieres cache/histórico
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

## El nonce (`_wpnonce`)

AUCORSA exige un `_wpnonce` válido en la URL de la consulta de estimaciones, aunque la
petición sea anónima. Esta API lo obtiene sola: antes de consultar una parada, visita
la página pública de la línea correspondiente y extrae el nonce de su HTML
(`src/services/aucorsaClient.ts`), cacheándolo unos minutos para no pedirlo en cada
consulta. Si ese refresco automático llegara a fallar (p. ej. AUCORSA cambia el HTML),
puedes fijar un valor manual de reserva con `AUCORSA_NONCE` en `.env`, aunque no hace
falta en el uso normal.

## Comportamiento de la cache

- **Memoria**: cada combinación `parada`+`linea` se sirve desde memoria durante
  `CACHE_TTL_MS` (15s por defecto) para no saturar a AUCORSA.
- **Postgres** (si está configurado): cada respuesta exitosa se guarda. Si AUCORSA
  falla o el nonce ha caducado, la API sirve la última respuesta guardada marcada como
  `stale: true` en vez de devolver un error, para que tu web no se rompa.

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

El proyecto usa el despliegue "zero-config" de Vercel para Hono: `vercel.json`
solo fija `"framework": "hono"` y Vercel detecta automáticamente el export por
defecto de la app Hono en `src/index.ts`, sin necesitar una función serverless
manual en `api/`.

En el dashboard de Vercel (Project → Settings → Environment Variables) puedes
configurar opcionalmente:

- `AUCORSA_BASE_URL`, `AUCORSA_NONCE`, `AUCORSA_USER_AGENT`, `CACHE_TTL_MS` (opcionales,
  no hace falta nada para que funcione)
- `DATABASE_URL` si quieres cache/histórico en Postgres (usa un proveedor con pooler,
  p. ej. Neon o Supabase, ya que cada instancia de función abre su propia conexión)

Después de añadir/editar variables de entorno hay que volver a desplegar (Vercel no
las aplica a un deployment ya construido).

### Verificar que funciona

```bash
curl https://tiempos-nine.vercel.app/health
curl "https://tiempos-nine.vercel.app/api/tiempos?parada=413&linea=4"
```

- `/health` debería devolver `{"status":"ok"}`.
- `/api/tiempos` debería devolver `{"parada":413,"nombre":"...","estimaciones":[...],"stale":false}`
  con datos reales de AUCORSA. Un 502 con `detail` sobre el nonce significa que el
  refresco automático ha fallado (revisa los logs de la función en Vercel).

Nota: al ser funciones serverless, la cache en memoria (y el nonce cacheado) se
resetean en cada arranque en frío de la función, así que verás más tráfico hacia
`aucorsa.es` del que verías en un servidor persistente; para cache real entre
invocaciones usa `DATABASE_URL`.
