require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const rolRoutes = require('./routes/rolRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const productoRoutes = require('./routes/productoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const facturaRoutes = require('./routes/facturaRoutes');
const carritoRoutes = require('./routes/carritoRoutes'); // [NEW]

const app = express();

// Middleware de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware para procesar JSON
app.use(express.json());

// Definición de las rutas base de la API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/carrito', carritoRoutes); // [NEW]

// El servidor se inicializa en server.js

module.exports = app;