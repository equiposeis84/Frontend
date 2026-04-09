import express from 'express';
const router = express.Router();
import facturaController from '../controllers/facturaController.js';

router.get('/', facturaController.getAll);
router.get('/:id', facturaController.getOne);
router.post('/', facturaController.store);
router.put('/:id', facturaController.update);
router.delete('/:id', facturaController.destroy);

export default router;