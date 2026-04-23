import prisma from '../config/prisma.js';

const Pedido = {
    findAll: async () => {
        const rows = await prisma.pedidos.findMany({
            orderBy: { id_pedido: 'asc' },
            include: { usuario: { select: { nombre: true } } }
        });
        return rows.map(p => ({ ...p, usuario_nombre: p.usuario?.nombre, usuario: undefined }));
    },

    findById: async (id) => {
        const p = await prisma.pedidos.findUnique({
            where: { id_pedido: Number(id) },
            include: { usuario: { select: { nombre: true } } }
        });
        if (!p) return undefined;
        return { ...p, usuario_nombre: p.usuario?.nombre, usuario: undefined };
    },

    create: async (data) => {
        const { usuario_id, subtotal, impuesto, total, estado } = data;
        const result = await prisma.pedidos.create({
            data: {
                usuario_id: Number(usuario_id),
                subtotal: subtotal || 0,
                impuesto: impuesto || 0,
                total: total || 0,
                estado: estado || 'PENDIENTE'
            }
        });
        return result.id_pedido;
    },

    update: async (id, data) => {
        const { subtotal, impuesto, total, estado } = data;
        const result = await prisma.pedidos.updateMany({
            where: { id_pedido: Number(id) },
            data: { subtotal, impuesto, total, estado }
        });
        return result.count > 0;
    },

    // Actualizar solo el estado
    updateStatus: async (id, estado) => {
        const result = await prisma.pedidos.updateMany({
            where: { id_pedido: Number(id) },
            data: { estado }
        });
        return result.count > 0;
    },

    delete: async (id) => {
        const result = await prisma.pedidos.deleteMany({
            where: { id_pedido: Number(id) }
        });
        return result.count > 0;
    },

    findByIdWithDetails: async (id) => {
        const pedido = await prisma.pedidos.findUnique({
            where: { id_pedido: Number(id) },
            include: {
                usuario: { select: { nombre: true, email: true, numero_documento: true } },
                detalle_pedido: {
                    orderBy: { id_detalle_pedido: 'asc' },
                    include: { producto: { select: { nombre: true, imagen_url: true } } }
                }
            }
        });
        if (!pedido) return null;

        // Aplanar para compatibilidad con el frontend/controllers
        return {
            ...pedido,
            usuario_nombre:     pedido.usuario?.nombre,
            usuario_email:      pedido.usuario?.email,
            numero_documento:   pedido.usuario?.numero_documento,
            usuario: undefined,
            detalles: pedido.detalle_pedido.map(d => ({
                ...d,
                producto_nombre: d.producto?.nombre,
                imagen_url:      d.producto?.imagen_url || null,
                producto: undefined
            })),
            detalle_pedido: undefined
        };
    }
};

export default Pedido;