/**
 * @file reportesRoutes.js
 * @description Rutas del módulo de reportes. Solo accesibles con token válido.
 */
import express from 'express';
const router = express.Router();
import { getVentas, getInventario, getSeguridad, getCarritos, getRepartidores } from '../controllers/reportesController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/ventas',       verificarToken, getVentas);
router.get('/inventario',   verificarToken, getInventario);
router.get('/seguridad',    verificarToken, getSeguridad);
router.get('/carritos',     verificarToken, getCarritos);
router.get('/repartidores', verificarToken, getRepartidores);

export default router;
