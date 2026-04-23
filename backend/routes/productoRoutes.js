/**
 * @file productoRoutes.js
 * @description Definición de rutas para el recurso de productos.
 */
import express from 'express';
const router = express.Router();
import productoController from '../controllers/productoController.js';
import { verificarToken } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

// ── Ruta PÚBLICA: catálogo para usuarios e invitados (sin token) ──
// Solo devuelve productos activos
router.get('/publico', productoController.getPublic);

// ── Rutas protegidas (admin) ──────────────────────────────────────
router.get('/',      verificarToken, productoController.getAll);
router.get('/:id',   verificarToken, productoController.getOne);

// upload.single('imagen') procesa el campo "imagen" del formulario
// Si no se envía imagen, req.file será undefined (no falla)
router.post('/',     verificarToken, upload.single('imagen'), productoController.store);
router.put('/:id',   verificarToken, upload.single('imagen'), productoController.update);

router.delete('/:id', verificarToken, productoController.destroy);

export default router;
