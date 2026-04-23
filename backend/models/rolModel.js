import prisma from '../config/prisma.js';

const Rol = {
    findAll: async () => {
        return prisma.roles.findMany({
            orderBy: { id_rol: 'asc' }
        });
    },

    findById: async (id) => {
        return prisma.roles.findUnique({
            where: { id_rol: Number(id) }
        });
    },

    create: async (data) => {
        const { nombre, descripcion } = data;
        const result = await prisma.roles.create({
            data: { nombre, descripcion }
        });
        return result.id_rol;
    },

    update: async (id, data) => {
        const { nombre, descripcion } = data;
        const result = await prisma.roles.updateMany({
            where: { id_rol: Number(id) },
            data: { nombre, descripcion }
        });
        return result.count > 0;
    },

    delete: async (id) => {
        const result = await prisma.roles.deleteMany({
            where: { id_rol: Number(id) }
        });
        return result.count > 0;
    }
};

export default Rol;