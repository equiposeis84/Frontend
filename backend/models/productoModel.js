/**
 * @file productoModel.js
 * @description Modelo para la persistencia de productos y sus relaciones.
 */
import prisma from '../config/prisma.js';

const includeRelations = {
    categoria: { select: { nombre: true } },
    proveedor:  { select: { nombre: true } }
};

const mapProducto = (p) => ({
    ...p,
    // Normalizar activo a número para compatibilidad con el frontend
    activo: p.activo ? 1 : 0,
    categoria_nombre: p.categoria?.nombre,
    proveedor_nombre: p.proveedor?.nombre,
    categoria: undefined,
    proveedor: undefined
});

const Producto = {
    findAll: async () => {
        const rows = await prisma.productos.findMany({
            orderBy: { id_producto: 'asc' },
            include: includeRelations
        });
        return rows.map(mapProducto);
    },

    // Solo activos → catálogo público
    findAllActive: async () => {
        const rows = await prisma.productos.findMany({
            where: { activo: true },
            orderBy: { id_producto: 'asc' },
            include: includeRelations
        });
        return rows.map(mapProducto);
    },

    findById: async (id) => {
        const p = await prisma.productos.findUnique({
            where: { id_producto: Number(id) },
            include: includeRelations
        });
        if (!p) return undefined;
        return mapProducto(p);
    },

    create: async (data) => {
        const {
            categoria_id, proveedor_id, nombre, descripcion,
            precio_compra, precio_venta, stock_actual, stock_minimo,
            imagen_url
        } = data;
        const result = await prisma.productos.create({
            data: {
                categoria_id: categoria_id ? Number(categoria_id) : null,
                proveedor_id: proveedor_id ? Number(proveedor_id) : null,
                nombre:        nombre || '',
                descripcion:   descripcion || '',
                imagen_url:    imagen_url || null,
                precio_compra: precio_compra != null ? Number(precio_compra) : 0,
                precio_venta:  precio_venta  != null ? Number(precio_venta)  : 0,
                stock_actual:  stock_actual  != null ? Number(stock_actual)  : 0,
                stock_minimo:  stock_minimo  != null ? Number(stock_minimo)  : 0,
                activo: true
            }
        });
        return result.id_producto;
    },

    update: async (id, data) => {
        const {
            categoria_id, proveedor_id, nombre, descripcion,
            precio_compra, precio_venta, stock_actual, stock_minimo,
            activo,
            imagen_url
        } = data;
        const result = await prisma.productos.updateMany({
            where: { id_producto: Number(id) },
            data: {
                categoria_id:  categoria_id  != null ? Number(categoria_id)  : undefined,
                proveedor_id:  proveedor_id  != null ? Number(proveedor_id)  : undefined,
                nombre,
                descripcion,
                imagen_url:    imagen_url !== undefined ? imagen_url : undefined,
                precio_compra: precio_compra != null ? Number(precio_compra) : undefined,
                precio_venta:  precio_venta  != null ? Number(precio_venta)  : undefined,
                stock_actual:  stock_actual  != null ? Number(stock_actual)  : undefined,
                stock_minimo:  stock_minimo  != null ? Number(stock_minimo)  : undefined,
                // activo viene como "1"/"0" desde FormData → convertir a booleano
                activo:        activo !== undefined ? Boolean(Number(activo)) : undefined,
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
