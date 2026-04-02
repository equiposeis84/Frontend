const Carrito = require('../models/carritoModel');

exports.getCart = async (req, res) => {
    try {
        const { usuario_id, session_id } = req.query; // leemos por query si es por get
        const items = await Carrito.find(usuario_id, session_id);
        res.json(items);
    } catch (error) {
        console.error("Error al obtener carrito:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.add = async (req, res) => {
    try {
        const { usuario_id, session_id, producto_id, cantidad } = req.body;
        if (!producto_id || !cantidad) {
            return res.status(400).json({ message: "Producto y cantidad obligatorios" });
        }
        await Carrito.addItem(usuario_id, session_id, producto_id, cantidad);
        const cart = await Carrito.find(usuario_id, session_id);
        res.json(cart);
    } catch (error) {
        console.error("Error al agregar item:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id_carrito } = req.params;
        const { cantidad, usuario_id, session_id } = req.body;
        await Carrito.updateQuantity(id_carrito, cantidad);
        const cart = await Carrito.find(usuario_id, session_id);
        res.json(cart);
    } catch (error) {
        console.error("Error al actualizar item:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const { producto_id } = req.params;
        const { usuario_id, session_id } = req.query;
        await Carrito.removeItemByProducto(usuario_id, session_id, producto_id);
        const cart = await Carrito.find(usuario_id, session_id);
        res.json(cart);
    } catch (error) {
        console.error("Error al eliminar item:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.clear = async (req, res) => {
    try {
        const { usuario_id, session_id } = req.body; // por POST a clear
        await Carrito.clearCart(usuario_id, session_id);
        res.json([]);
    } catch (error) {
        console.error("Error al vaciar carrito:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.merge = async (req, res) => {
    try {
        const { session_id, usuario_id } = req.body;
        if (session_id && usuario_id) {
            await Carrito.mergeSession(session_id, usuario_id);
        }
        const cart = await Carrito.find(usuario_id, session_id);
        res.json(cart);
    } catch(error) {
        console.error("Error al fusionar:", error);
        res.status(500).json({ error: error.message });
    }
};
