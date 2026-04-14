import Pedido from '../models/pedidoModel.js';
import db from '../config/db.js';

const getAll = async (req, res) => {
    try {
        const data = await Pedido.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const row = await Pedido.findById(req.params.id);
        if (!row) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkout = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) return res.status(400).json({ message: "Se requiere usuario activo" });

        const [cartItems] = await db.query(`
            SELECT c.*, p.precio_venta 
            FROM carrito c
            INNER JOIN productos p ON c.producto_id = p.id_producto
            WHERE c.usuario_id = ?
        `, [usuario_id]);

        if (cartItems.length === 0) return res.status(400).json({ message: "El carrito está vacío" });

        const total = cartItems.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0);

        const [resultUser] = await db.query(`
            INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, 'PENDIENTE')
        `, [usuario_id, total]);
        const pedidoId = resultUser.insertId;

        for (let item of cartItems) {
            const subtotal = item.cantidad * item.precio_venta;
            await db.query(`
                INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [pedidoId, item.producto_id, item.cantidad, item.precio_venta, subtotal]);
        }

        await db.query(`DELETE FROM carrito WHERE usuario_id = ?`, [usuario_id]);
        res.status(201).json({ message: "Pedido procesado con éxito", id_pedido: pedidoId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const store = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) return res.status(400).json({ message: "El ID del usuario es obligatorio" });
        const id = await Pedido.create(req.body);
        res.status(201).json({ message: "Pedido creado con éxito", id_pedido: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Pedido.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json({ message: "Pedido actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Pedido.delete(id);
        if (!eliminado) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json({ message: "Pedido eliminado" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "No se puede eliminar este pedido porque tiene facturas o detalles asociados." });
        }
        res.status(500).json({ error: error.message });
    }
};

const getTicket = async (req, res) => {
    try {
        const pedido = await Pedido.findByIdWithDetails(req.params.id);
        if (!pedido) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json(pedido);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const cancelar = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findById(id);

        if (!pedido) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        // Regla RF011: Solo cancelar si está PENDIENTE
        if (pedido.estado !== 'PENDIENTE') {
            return res.status(400).json({
                message: "No se puede cancelar un pedido que ya no está PENDIENTE"
            });
        }

        // LLAMADA A LA NUEVA FUNCIÓN DEL MODELO
        const actualizado = await Pedido.updateStatus(id, 'CANCELADO');

        if (actualizado) {
            res.json({ message: "Pedido cancelado con éxito" });
        } else {
            res.status(500).json({ message: "No se pudo actualizar el estado" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { getAll, getOne, checkout, store, update, destroy, getTicket, cancelar };