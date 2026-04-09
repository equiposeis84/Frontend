import express from 'express';
const router = express.Router();
import carritoController from '../controllers/carritoController.js';

router.get('/', carritoController.getCart);
router.post('/add', carritoController.add);
router.post('/clear', carritoController.clear);
router.post('/merge', carritoController.merge);
router.put('/update/:id_carrito', carritoController.update);
router.delete('/remove/:producto_id', carritoController.remove);

export default router;