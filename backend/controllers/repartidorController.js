/**
 * @file repartidorController.js
 * @description Controlador para la gestión de repartidores y asignación de pedidos.
 */
import Repartidor from '../models/repartidorModel.js';

const repartidorController = {
    getAll: async (req, res) => {
        try {
            const repartidores = await Repartidor.findAll();
            res.json(repartidores);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const repartidor = await Repartidor.findById(req.params.id);
            if (!repartidor) return res.status(404).json({ error: 'Repartidor no encontrado' });
            res.json(repartidor);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    toggleActivo: async (req, res) => {
        try {
            const { activo } = req.body;
            await Repartidor.toggleActivo(req.params.id, activo);
            res.json({ message: 'Estado del repartidor actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    asignarPedido: async (req, res) => {
        try {
            const { pedido_id } = req.body;
            await Repartidor.asignarPedido(pedido_id, req.params.id);
            res.json({ message: 'Pedido asignado exitosamente al repartidor' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    desasignarPedido: async (req, res) => {
        try {
            await Repartidor.desasignarPedido(req.params.pedidoId);
            res.json({ message: 'Pedido desasignado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    cambiarEstadoPedido: async (req, res) => {
        try {
            const { estado, notas } = req.body;
            const usuario_id = req.usuario?.userId; // Asumiendo que el middleware verificarToken añade req.usuario
            await Repartidor.cambiarEstadoPedido(req.params.pedidoId, estado, usuario_id, notas);
            res.json({ message: 'Estado del pedido actualizado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getPedidosSinAsignar: async (req, res) => {
        try {
            const pedidos = await Repartidor.getPedidosSinAsignar();
            res.json(pedidos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default repartidorController;
