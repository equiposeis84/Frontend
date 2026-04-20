import express from 'express';
const router = express.Router();
import categoriaController from '../controllers/categoriaController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/',     verificarToken, categoriaController.getAll);
router.get('/:id',  verificarToken, categoriaController.getOne);
router.post('/',    verificarToken, categoriaController.store);
router.put('/:id',  verificarToken, categoriaController.update);
router.delete('/:id', verificarToken, categoriaController.destroy);

export default router;