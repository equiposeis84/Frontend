/**
 * @file facturaModel.js
 * @description Modelo para la gestión de facturas de pedidos.
 */
import prisma from '../config/prisma.js';

const Factura = {
    findAll: async () => {
        const rows = await prisma.facturas.findMany({
            orderBy: { id_factura: 'asc' },
            include: { pedido: { select: { estado: true } } }
        });
        return rows.map(f => ({ ...f, pedido_estado: f.pedido?.estado, pedido: undefined }));
    },

    findById: async (id) => {
        return prisma.facturas.findUnique({
            where: { id_factura: Number(id) }
        });
    },

    create: async (data) => {
        const { pedido_id, numero_factura, subtotal, impuesto, total, estado } = data;
        const result = await prisma.facturas.create({
            data: {
                pedido_id: Number(pedido_id),
                numero_factura,
                subtotal: subtotal || 0,
                impuesto: impuesto || 0,
                total: total || 0,
                estado: estado || 'EMITIDA'
            }
        });
        return result.id_factura;
    },

    update: async (id, data) => {
        const { numero_factura, subtotal, impuesto, total, estado } = data;
        const result = await prisma.facturas.updateMany({
            where: { id_factura: Number(id) },
            data: { numero_factura, subtotal, impuesto, total, estado }
        });
        return result.count > 0;
    },

    delete: async (id) => {
        const result = await prisma.facturas.deleteMany({
            where: { id_factura: Number(id) }
        });
        return result.count > 0;
    }
};

export default Factura;