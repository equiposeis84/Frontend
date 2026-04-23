/**
 * @file categoriaModel.js
 * @description Modelo para la gestión de categorías de productos.
 */
import prisma from '../config/prisma.js';

const Categoria = {
    findAll: async () => {
        return prisma.categorias.findMany({
            orderBy: { id_categoria: 'asc' }
        });
    },

    findById: async (id) => {
        return prisma.categorias.findUnique({
            where: { id_categoria: Number(id) }
        });
    },

    create: async (data) => {
        const { nombre, descripcion } = data;
        const result = await prisma.categorias.create({
            data: { nombre, descripcion }
        });
        return result.id_categoria;
    },

    update: async (id, data) => {
        const { nombre, descripcion } = data;
        const result = await prisma.categorias.updateMany({
            where: { id_categoria: Number(id) },
            data: { nombre, descripcion }
        });
        return result.count > 0;
    },

    delete: async (id) => {
        const result = await prisma.categorias.deleteMany({
            where: { id_categoria: Number(id) }
        });
        return result.count > 0;
    }
};

export default Categoria;