import express from 'express';
const router = express.Router();
import pedidoController from '../controllers/pedidoController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/',              verificarToken, pedidoController.getAll);
router.get('/:id/ticket',   verificarToken, pedidoController.getTicket);
router.get('/:id',          verificarToken, pedidoController.getOne);
router.post('/checkout',    verificarToken, pedidoController.checkout);
router.post('/',             verificarToken, pedidoController.store);
router.put('/:id',          verificarToken, pedidoController.update);
router.put('/:id/cancelar', verificarToken, pedidoController.cancelar);
router.delete('/:id',       verificarToken, pedidoController.destroy);

export default router;