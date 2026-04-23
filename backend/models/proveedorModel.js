import prisma from '../config/prisma.js';

const Proveedor = {
    findAll: async () => {
        return prisma.proveedores.findMany({
            orderBy: { id_proveedor: 'asc' }
        });
    },

    findById: async (id) => {
        return prisma.proveedores.findUnique({
            where: { id_proveedor: Number(id) }
        });
    },

    create: async (data) => {
        const { nit, nombre, telefono, correo, direccion } = data;
        const result = await prisma.proveedores.create({
            data: { nit, nombre, telefono, correo, direccion, activo: 1 }
        });
        return result.id_proveedor;
    },

    update: async (id, data) => {
        const { nit, nombre, telefono, correo, direccion, activo } = data;
        const result = await prisma.proveedores.updateMany({
            where: { id_proveedor: Number(id) },
            data: { nit, nombre, telefono, correo, direccion, activo }
        });
        return result.count > 0;
    },

    delete: async (id) => {
        const result = await prisma.proveedores.deleteMany({
            where: { id_proveedor: Number(id) }
        });
        return result.count > 0;
    }
};

export default Proveedor;