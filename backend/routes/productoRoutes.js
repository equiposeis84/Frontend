import express from 'express';
const router = express.Router();
import productoController from '../controllers/productoController.js';

router.get('/', productoController.getAll);
router.get('/:id', productoController.getOne);
router.post('/', productoController.store);
router.put('/:id', productoController.update);
router.delete('/:id', productoController.destroy);

export default router;