import express from 'express';
const router = express.Router();
import categoriaController from '../controllers/categoriaController.js';

router.get('/', categoriaController.getAll);
router.get('/:id', categoriaController.getOne);
router.post('/', categoriaController.store);
router.put('/:id', categoriaController.update);
router.delete('/:id', categoriaController.destroy);

export default router;