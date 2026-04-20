import express from 'express';
const router = express.Router();
import productoController from '../controllers/productoController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/',     verificarToken, productoController.getAll);
router.get('/:id',  verificarToken, productoController.getOne);
router.post('/',    verificarToken, productoController.store);
router.put('/:id',  verificarToken, productoController.update);
router.delete('/:id', verificarToken, productoController.destroy);

export default router;