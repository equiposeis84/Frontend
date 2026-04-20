import express from 'express';
const router = express.Router();
import repartidorController from '../controllers/repartidorController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

// Rutas para repartidores - protegidas
router.get('/', verificarToken, repartidorController.getAll);
router.get('/pedidos-sin-asignar', verificarToken, repartidorController.getPedidosSinAsignar);
router.get('/:id', verificarToken, repartidorController.getById);

// Activar/Desactivar repartidor
router.put('/:id/activo', verificarToken, repartidorController.toggleActivo);

// Rutas relacionadas con pedidos
router.post('/:id/asignar-pedido', verificarToken, repartidorController.asignarPedido);
router.put('/pedidos/:pedidoId/desasignar', verificarToken, repartidorController.desasignarPedido);
router.put('/pedidos/:pedidoId/estado', verificarToken, repartidorController.cambiarEstadoPedido);

export default router;
