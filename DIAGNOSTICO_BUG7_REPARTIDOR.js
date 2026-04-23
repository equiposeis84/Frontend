/**
 * DIAGNÓSTICO — API Repartidor (BUG #7)
 * ========================================
 * Las rutas del repartidor responden 404 o error de conexión.
 *
 * CAUSA ENCONTRADA EN EL CÓDIGO:
 * ────────────────────────────────────────────────────────────────────────────
 * El frontend (Repartidores.jsx) llama a:
 *
 *   GET  http://localhost:3000/api/repartidores
 *   GET  http://localhost:3000/api/repartidores/pedidos-sin-asignar
 *   GET  http://localhost:3000/api/repartidores/:id
 *   PUT  http://localhost:3000/api/repartidores/:id/activo
 *   POST http://localhost:3000/api/repartidores/:id/asignar-pedido
 *   PUT  http://localhost:3000/api/repartidores/pedidos/:pedidoId/desasignar
 *   PUT  http://localhost:3000/api/repartidores/pedidos/:pedidoId/estado
 *
 * El backend en repartidorRoutes.js define EXACTAMENTE esas rutas. ✓
 * El backend en app.js registra: app.use('/api/repartidores', repartidorRoutes) ✓
 *
 * EL PROBLEMA REAL: withCredentials
 * ────────────────────────────────────────────────────────────────────────────
 * Todas las rutas de repartidor están protegidas con `verificarToken`.
 * El middleware lee el token desde la httpOnly cookie.
 * Repartidores.jsx usa `axios` sin `withCredentials: true` → la cookie
 * NO viaja con el request → el servidor devuelve 401 "Acceso denegado"
 * (que el frontend puede interpretar como error de red dependiendo del
 *  manejo de CORS).
 *
 * SOLUCIÓN — Cambiar en Repartidores.jsx:
 * ────────────────────────────────────────────────────────────────────────────
 */

// ── ANTES (línea 2 de Repartidores.jsx) ──────────────────────────────────────
//  import axios from 'axios';
//  const URL_API = "http://localhost:3000/api/repartidores";
//
//  // Uso:
//  const res = await axios.get(URL_API);          // SIN credenciales → 401

// ── DESPUÉS ───────────────────────────────────────────────────────────────────
//
//  import axios from 'axios';
//
//  // Crear instancia con withCredentials
//  const api = axios.create({
//    baseURL: 'http://localhost:3000',
//    withCredentials: true   // ← Envía la httpOnly cookie en cada request
//  });
//
//  const URL_API = "/api/repartidores";  // Ruta relativa al baseURL
//
//  // Uso (sin cambios en la lógica):
//  const res = await api.get(URL_API);   // CON credenciales → 200 OK

/**
 * CÓMO APLICAR EL PARCHE en Repartidores.jsx:
 * ────────────────────────────────────────────────────────────────────────────
 * 1. Al tope del archivo, después de `import axios from 'axios';`, agrega:
 *
 *    const api = axios.create({
 *      baseURL: 'http://localhost:3000',
 *      withCredentials: true
 *    });
 *
 * 2. Reemplaza TODAS las llamadas `axios.get(...)`, `axios.post(...)`,
 *    `axios.put(...)` por `api.get(...)`, `api.post(...)`, `api.put(...)`.
 *
 * 3. Cambia la constante URL_API:
 *    ANTES: const URL_API = "http://localhost:3000/api/repartidores";
 *    DESPUÉS: const URL_API = "/api/repartidores";
 *
 * LÍNEAS A CAMBIAR (grep resultado):
 *   Línea 26:  axios.get(URL_API)
 *   Línea 37:  axios.get(`${URL_API}/pedidos-sin-asignar`)
 *   Línea 52:  axios.get(`${URL_API}/${id}`)
 *   Línea 63:  axios.put(`${URL_API}/${id}/activo`, ...)
 *   Línea 77:  axios.post(`${URL_API}/${...}/asignar-pedido`, ...)
 *   Línea 89:  axios.put(`${URL_API}/pedidos/${pedidoId}/desasignar`)
 *   Línea 102: axios.put(`${URL_API}/pedidos/${pedidoId}/estado`, ...)
 *
 * DIAGNÓSTICO ADICIONAL — Cómo leer el error en la consola del navegador:
 * ────────────────────────────────────────────────────────────────────────────
 * 1. Abre DevTools → pestaña Network
 * 2. Recarga Repartidores
 * 3. Busca la petición a /api/repartidores
 * 4. Si ves Status 401 → es el problema de withCredentials (este fix)
 *    Si ves Status 404 → la ruta no existe en el backend (revisa app.js)
 *    Si ves "ERR_CONNECTION_REFUSED" → el servidor no está corriendo
 *       (npm run dev en la carpeta backend)
 */
