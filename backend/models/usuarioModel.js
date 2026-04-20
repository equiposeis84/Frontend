import prisma from '../config/prisma.js';

const Usuario = {
    findAll: async () => {
        const rows = await prisma.usuarios.findMany({
            orderBy: { id_usuario: 'asc' },
            select: {
                id_usuario: true,
                rol_id: true,
                nombre: true,
                email: true,
                numero_documento: true,
                activo: true,
                rol: { select: { nombre: true } }  // JOIN con roles
            }
        });
        // Aplanar rol_nombre para compatibilidad con el frontend
        return rows.map(u => ({ ...u, rol_nombre: u.rol?.nombre, rol: undefined }));
    },

    findById: async (id) => {
        const u = await prisma.usuarios.findUnique({
            where: { id_usuario: Number(id) },
            include: { rol: true }
        });
        if (!u) return undefined;
        return { ...u, rol_nombre: u.rol?.nombre };
    },

    findByEmail: async (email) => {
        const u = await prisma.usuarios.findUnique({
            where: { email },
            include: { rol: true }
        });
        if (!u) return undefined;
        return { ...u, rol_nombre: u.rol?.nombre };
    },

    create: async (data) => {
        const { rol_id, nombre, email, password, tipo_documento, numero_documento, telefono, direccion } = data;
        const result = await prisma.usuarios.create({
            data: {
                rol_id: Number(rol_id),
                nombre,
                email,
                password,
                tipo_documento,
                numero_documento,
                telefono,
                direccion,
                activo: 1
            }
        });
        return result.id_usuario;
    },

    update: async (id, data) => {
        const { rol_id, nombre, email, numero_documento, activo } = data;
        const result = await prisma.usuarios.updateMany({
            where: { id_usuario: Number(id) },
            data: {
                rol_id: rol_id ? Number(rol_id) : undefined,
                nombre,
                email,
                numero_documento,
                activo
            }
        });
        return result.count > 0;
    },

    delete: async (id) => {
        const result = await prisma.usuarios.deleteMany({
            where: { id_usuario: Number(id) }
        });
        return result.count > 0;
    },

    getRoles: async () => {
        return prisma.roles.findMany();
    }
};

export default Usuario;