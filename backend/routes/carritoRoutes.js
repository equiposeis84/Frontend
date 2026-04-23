import express from 'express';
const router = express.Router();
import carritoController from '../controllers/carritoController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

router.get('/',                        verificarToken, carritoController.getCart);
router.post('/add',                    verificarToken, carritoController.add);
router.post('/clear',                  verificarToken, carritoController.clear);
router.post('/merge',                  verificarToken, carritoController.merge);
router.put('/update/:id_carrito',      verificarToken, carritoController.update);
router.delete('/remove/:producto_id',  verificarToken, carritoController.remove);

export default router;