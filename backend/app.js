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
import swaggerDocumentation from './swagger.json' with { type: 'json' };

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
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (Postman, Swagger local) y los orígenes en lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origen no permitido → ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true      // Necesario para httpOnly cookies
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

export default app;