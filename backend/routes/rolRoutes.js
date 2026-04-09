import express from 'express';
const router = express.Router();
import rolController from '../controllers/rolController.js';

router.get('/', rolController.getAll);
router.get('/:id', rolController.getOne);
router.post('/', rolController.store);
router.put('/:id', rolController.update);
router.delete('/:id', rolController.destroy);

export default router;