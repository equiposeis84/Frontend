import express from 'express';
const router = express.Router();
import pedidoController from '../controllers/pedidoController.js';

router.get('/', pedidoController.getAll);
router.get('/:id/ticket', pedidoController.getTicket);
router.get('/:id', pedidoController.getOne);
router.post('/checkout', pedidoController.checkout);
router.post('/', pedidoController.store);
router.put('/:id', pedidoController.update);
router.delete('/:id', pedidoController.destroy);

export default router;