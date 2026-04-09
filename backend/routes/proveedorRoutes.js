import express from 'express';
const router = express.Router();
import proveedorController from '../controllers/proveedorController.js';

router.get('/', proveedorController.getAll);
router.get('/:id', proveedorController.getOne);
router.post('/', proveedorController.store);
router.put('/:id', proveedorController.update);
router.delete('/:id', proveedorController.destroy);

export default router;