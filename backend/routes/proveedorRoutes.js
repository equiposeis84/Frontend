import express from 'express';
const router = express.Router();
import proveedorController from '../controllers/proveedorController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/',     verificarToken, proveedorController.getAll);
router.get('/:id',  verificarToken, proveedorController.getOne);
router.post('/',    verificarToken, proveedorController.store);
router.put('/:id',  verificarToken, proveedorController.update);
router.delete('/:id', verificarToken, proveedorController.destroy);

export default router;