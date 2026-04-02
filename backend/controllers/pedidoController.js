const Pedido = require('../models/pedidoModel');
const db = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const data = await Pedido.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOne = async (req, res) => {
    try {
        const row = await Pedido.findById(req.params.id);
        if (!row) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Checkout especial desde el carrito
exports.checkout = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) return res.status(400).json({ message: "Se requiere usuario activo" });

        // 1. Obtener el carrito
        const [cartItems] = await db.query(`
            SELECT c.*, p.precio_venta 
            FROM carrito c
            INNER JOIN productos p ON c.producto_id = p.id_producto
            WHERE c.usuario_id = ?
        `, [usuario_id]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "El carrito está vacío" });
        }

        // 2. Calcular total
        const total = cartItems.reduce((acc, item) => acc + (item.cantidad * item.precio_venta), 0);

        // 3. Crear pedido principal
        // asumiendo Pedido.create(req.body) o lo hacemos manual aqui.
        const [resultUser] = await db.query(`
            INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, 'PENDIENTE')
        `, [usuario_id, total]);
        const pedidoId = resultUser.insertId;

        // 4. Insertar cada detalle de pedido
        for (let item of cartItems) {
            const subtotal = item.cantidad * item.precio_venta;
            await db.query(`
                INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
                VALUES (?, ?, ?, ?, ?)
            `, [pedidoId, item.producto_id, item.cantidad, item.precio_venta, subtotal]);
        }

        // 5. Vaciar carrito
        await db.query(`DELETE FROM carrito WHERE usuario_id = ?`, [usuario_id]);

        res.status(201).json({ message: "Pedido procesado con éxito", id_pedido: pedidoId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.store = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        if (!usuario_id) return res.status(400).json({ message: "El ID del usuario es obligatorio" });
        
        const id = await Pedido.create(req.body);
        res.status(201).json({ message: "Pedido creado con éxito", id_pedido: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Pedido.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json({ message: "Pedido actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Pedido.delete(id);
        if (!eliminado) return res.status(404).json({ message: "Pedido no encontrado" });
        res.json({ message: "Pedido eliminado" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ 
                error: "No se puede eliminar este pedido porque tiene facturas o detalles asociados." 
            });
        }
        res.status(500).json({ error: error.message });
    }
};
