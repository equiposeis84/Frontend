/**
 * @file statsRoutes.js
 * @description Endpoint público que devuelve estadísticas agregadas del sistema
 * en tiempo real: productos activos, pedidos totales, clientes registrados y categorías.
 */
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/**
 * GET /api/stats
 * Ruta pública (sin token). Devuelve conteos del sistema.
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM productos   WHERE activo = 1)        AS productos,
        (SELECT COUNT(*) FROM pedidos)                             AS pedidos,
        (SELECT COUNT(*) FROM usuarios u
           INNER JOIN roles r ON u.rol_id = r.id_rol
           WHERE r.nombre = 'Cliente')                            AS clientes,
        (SELECT COUNT(*) FROM categorias)                         AS categorias
    `);

    const data = rows[0];
    res.json({
      productos:  Number(data.productos)  || 0,
      pedidos:    Number(data.pedidos)    || 0,
      clientes:   Number(data.clientes)   || 0,
      categorias: Number(data.categorias) || 0,
    });
  } catch (err) {
    console.error('Error en /api/stats:', err);
    res.status(500).json({ error: 'No se pudieron obtener las estadísticas.' });
  }
});

export default router;
