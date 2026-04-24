/**
 * @file app.js
 * @description Configuración principal de la aplicación Express.
 * Incluye middlewares, rutas, manejo de errores y documentación Swagger.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const swaggerDocumentation = require('./swagger.json');

import usuarioRoutes from './routes/usuarioRoutes.js';
import rolRoutes from './routes/rolRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import proveedorRoutes from './routes/proveedorRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import facturaRoutes from './routes/facturaRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';
import repartidorRoutes from './routes/repartidorRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import reportesRoutes from './routes/reportesRoutes.js';

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8081', // Expo/React Native default
  'http://127.0.0.1:8081'
];

// Si existe en el .env, lo añadimos
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(origin => {
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como Postman o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en nuestra lista blanca
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado para el origen: ${origin}`);
      // En lugar de un error duro, devolvemos false para que la librería CORS maneje el rechazo
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// ─── PARSERS ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser()); // Lee cookies del request

// ─── SWAGGER ─────────────────────────────────────────────────────────────────
app.use('/doc', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation));

// ─── RUTAS ───────────────────────────────────────────────────────────────────
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/repartidores', repartidorRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/reportes',     reportesRoutes);

// ─── MANEJO DE ERRORES ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

export default app;