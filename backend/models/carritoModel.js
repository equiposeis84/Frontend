/**
 * @file carritoModel.js
 * @description Modelo para la gestión de persistencia del carrito de compras.
 * Interactúa con la base de datos a través de Prisma.
 */
import prisma from '../config/prisma.js';

const Carrito = {
    find: async (usuario_id, session_id) => {
        if (!usuario_id && !session_id) return [];

        const where = usuario_id
            ? { usuario_id: Number(usuario_id) }
            : { session_id, usuario_id: null };

        const rows = await prisma.carrito.findMany({
            where,
            include: {
                producto: {
                    select: { nombre: true, precio_venta: true, stock_actual: true, imagen_url: true }
                }
            }
        });

        // Aplanar para compatibilidad con el frontend
        return rows.map(item => ({
            id_carrito:   item.id_carrito,
            usuario_id:   item.usuario_id,
            session_id:   item.session_id,
            producto_id:  item.producto_id,
            cantidad:     item.cantidad,
            nombre:       item.producto.nombre,
            precio:       item.producto.precio_venta,
            subtotal:     Number(item.cantidad) * Number(item.producto.precio_venta),
            stock_actual: item.producto.stock_actual,
            imagen_url:   item.producto.imagen_url || null
        }));
    },

    findItem: async (usuario_id, session_id, producto_id) => {
        if (!usuario_id && !session_id) return null;

        const where = {
            producto_id: Number(producto_id),
            ...(usuario_id
                ? { usuario_id: Number(usuario_id) }
                : { session_id, usuario_id: null })
        };

        return prisma.carrito.findFirst({ where });
    },

    addItem: async (usuario_id, session_id, producto_id, cantidad) => {
        const existing = await Carrito.findItem(usuario_id, session_id, producto_id);

        if (existing) {
            const result = await prisma.carrito.updateMany({
                where: { id_carrito: existing.id_carrito },
                data: { cantidad: existing.cantidad + Number(cantidad) }
            });
            return result.count > 0;
        } else {
            const result = await prisma.carrito.create({
                data: {
                    usuario_id: usuario_id ? Number(usuario_id) : null,
                    session_id: session_id || null,
                    producto_id: Number(producto_id),
                    cantidad: Number(cantidad)
                }
            });
            return result.id_carrito;
        }
    },

    updateQuantity: async (id_carrito, cantidad) => {
        const result = await prisma.carrito.updateMany({
            where: { id_carrito: Number(id_carrito) },
            data: { cantidad: Number(cantidad) }
        });
        return result.count > 0;
    },

    removeItemByProducto: async (usuario_id, session_id, producto_id) => {
        if (!usuario_id && !session_id) return false;

        const where = {
            producto_id: Number(producto_id),
            ...(usuario_id
                ? { usuario_id: Number(usuario_id) }
                : { session_id, usuario_id: null })
        };

        const result = await prisma.carrito.deleteMany({ where });
        return result.count > 0;
    },

    clearCart: async (usuario_id, session_id) => {
        if (!usuario_id && !session_id) return false;

        const where = usuario_id
            ? { usuario_id: Number(usuario_id) }
            : { session_id, usuario_id: null };

        const result = await prisma.carrito.deleteMany({ where });
        return result.count > 0;
    },

    mergeSession: async (session_id, usuario_id) => {
        const result = await prisma.carrito.updateMany({
            where: { session_id, usuario_id: null },
            data: { usuario_id: Number(usuario_id), session_id: null }
        });
        return result.count;
    }
};

export default Carrito;