import express from 'express';
const router = express.Router();
import rolController from '../controllers/rolController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/',     verificarToken, rolController.getAll);
router.get('/:id',  verificarToken, rolController.getOne);
router.post('/',    verificarToken, rolController.store);
router.put('/:id',  verificarToken, rolController.update);
router.delete('/:id', verificarToken, rolController.destroy);

export default router;