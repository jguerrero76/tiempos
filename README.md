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

```json
{
  "data": { /* respuesta tal cual de AUCORSA */ },
  "cached": false,
  "fetchedAt": "2026-07-15T12:00:00.000Z"
}
```

Si quieres que la API renombre/normalice los campos de `data` (línea, minutos,
destino...), dime qué forma tiene la respuesta real de AUCORSA y lo ajustamos.

## Build para producción

```bash
npm run build
npm start
```
