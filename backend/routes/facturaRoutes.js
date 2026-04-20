import express from 'express';
const router = express.Router();
import facturaController from '../controllers/facturaController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/',     verificarToken, facturaController.getAll);
router.get('/:id',  verificarToken, facturaController.getOne);
router.post('/',    verificarToken, facturaController.store);
router.put('/:id',  verificarToken, facturaController.update);
router.delete('/:id', verificarToken, facturaController.destroy);

export default router;