import prisma from '../config/prisma.js';

const Producto = {
    findAll: async () => {
        const rows = await prisma.productos.findMany({
            orderBy: { id_producto: 'asc' },
            include: {
                categoria: { select: { nombre: true } },
                proveedor:  { select: { nombre: true } }
            }
        });
        return rows.map(p => ({
            ...p,
            categoria_nombre: p.categoria?.nombre,
            proveedor_nombre: p.proveedor?.nombre,
            categoria: undefined,
            proveedor: undefined
        }));
    },

    findById: async (id) => {
        const p = await prisma.productos.findUnique({
            where: { id_producto: Number(id) },
            include: {
                categoria: { select: { nombre: true } },
                proveedor:  { select: { nombre: true } }
            }
        });
        if (!p) return undefined;
        return {
            ...p,
            categoria_nombre: p.categoria?.nombre,
            proveedor_nombre: p.proveedor?.nombre,
            categoria: undefined,
            proveedor: undefined
        };
    },

    create: async (data) => {
        const {
            categoria_id, proveedor_id, nombre, descripcion,
            precio_compra, precio_venta, stock_actual, stock_minimo
        } = data;
        const result = await prisma.productos.create({
            data: {
                categoria_id: categoria_id ? Number(categoria_id) : null,
                proveedor_id: proveedor_id ? Number(proveedor_id) : null,
                nombre: nombre || '',
                descripcion: descripcion || '',
                precio_compra: precio_compra || 0,
                precio_venta: precio_venta || 0,
                stock_actual: stock_actual || 0,
                stock_minimo: stock_minimo || 0,
                activo: 1
            }
        });
        return result.id_producto;
    },

    update: async (id, data) => {
        const { categoria_id, proveedor_id, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, activo } = data;
        const result = await prisma.productos.updateMany({
            where: { id_producto: Number(id) },
            data: {
                categoria_id: categoria_id ? Number(categoria_id) : undefined,
                proveedor_id: proveedor_id ? Number(proveedor_id) : undefined,
                nombre,
                descripcion,
                precio_compra,
                precio_venta,
                stock_actual,
                stock_minimo,
                activo
            }
        });
        return result.count > 0;
    },

    delete: async (id) => {
        const result = await prisma.productos.deleteMany({
            where: { id_producto: Number(id) }
        });
        return result.count > 0;
    }
};

export default Producto;