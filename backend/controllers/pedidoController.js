/**
 * @file pedidoController.js
 * @description Controlador para la gestión de pedidos y transacciones de checkout.
 */
import Pedido from '../models/pedidoModel.js';
import prisma from '../config/prisma.js';

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

        const cartItems = await prisma.carrito.findMany({
            where: { usuario_id: Number(usuario_id) },
            include: { producto: { select: { precio_venta: true, nombre: true } } }
        });

        if (cartItems.length === 0) return res.status(400).json({ message: "El carrito está vacío" });

        for (const item of cartItems) {
            const producto = await prisma.productos.findUnique({
                where: { id_producto: item.producto_id },
                select: { stock_actual: true, nombre: true }
            });
            if (!producto || producto.stock_actual < item.cantidad) {
                return res.status(400).json({
                    message: `Stock insuficiente para: ${producto?.nombre}`
                });
            }
        }

        const total = cartItems.reduce((acc, item) =>
            acc + (item.cantidad * Number(item.producto.precio_venta)), 0
        );

        const transactionResult = await prisma.$transaction(async (tx) => {
            const pedido = await tx.pedidos.create({
                data: { usuario_id: Number(usuario_id), total, estado: 'PENDIENTE' }
            });
            for (const item of cartItems) {
                const precio = Number(item.producto.precio_venta);
                await tx.detalle_pedido.create({
                    data: {
                        pedido_id: pedido.id_pedido,
                        producto_id: item.producto_id,
                        cantidad: item.cantidad,
                        precio_unitario: precio,
                        subtotal: item.cantidad * precio
                    }
                });
                
                await tx.productos.update({
                    where: { id_producto: item.producto_id },
                    data: {
                        stock_actual: { decrement: item.cantidad }
                    }
                });
            }
            await tx.carrito.deleteMany({ where: { usuario_id: Number(usuario_id) } });
            return pedido;
        });

        res.status(201).json({ message: "Pedido procesado con éxito", id_pedido: transactionResult.id_pedido });
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