/**
 * @file usuarioModel.js
 * @description Modelo de usuarios usando Prisma ORM.
 *
 * CORRECCIÓN #6 — Bug estado "Inactivo":
 * ────────────────────────────────────────────────────────────────────────────
 * PROBLEMA raíz:
 *   El frontend enviaba activo: false (booleano JavaScript).
 *   Prisma con MySQL almacena los booleanos como TINYINT(1) (0 o 1).
 *   Cuando el valor llega como string "false" (ej: desde un <select> de HTML)
 *   Boolean("false") === TRUE  ← ¡bug clásico! Todo string no vacío es truthy.
 *
 * SOLUCIÓN:
 *   Función helper normalizeActivo() que convierte cualquier representación
 *   (boolean true/false, number 0/1, string "0"/"1"/"true"/"false") al
 *   Boolean correcto antes de pasarlo a Prisma.
 *
 * CONCEPTO — ¿Por qué Boolean(Number(activo)) falla con "false"?
 *   Number("false") → NaN
 *   Boolean(NaN)    → false  ✓ (coincidencia, pero frágil)
 *   Number("true")  → NaN
 *   Boolean(NaN)    → false  ✗ ← AQUÍ está el bug real
 *   La solución robusta es manejar cada caso explícitamente.
 */
import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';

// ── Helper: normalizar activo a Boolean ──────────────────────────────────────
//
// Acepta: true, false, 1, 0, "1", "0", "true", "false"
// Retorna: Boolean
//
function normalizeActivo(valor) {
    if (typeof valor === 'boolean') return valor;
    if (valor === 1 || valor === '1' || valor === 'true') return true;
    if (valor === 0 || valor === '0' || valor === 'false') return false;
    // Fallback seguro: si no reconocemos el valor, dejamos activo = true
    return Boolean(valor);
}

const Usuario = {

    // ── findAll ────────────────────────────────────────────────────────────────
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
                rol: { select: { nombre: true } }
            }
        });
        return rows.map(u => ({ ...u, rol_nombre: u.rol?.nombre, rol: undefined }));
    },

    // ── findById ───────────────────────────────────────────────────────────────
    findById: async (id) => {
        const u = await prisma.usuarios.findUnique({
            where: { id_usuario: Number(id) },
            include: { rol: true }
        });
        if (!u) return undefined;
        return { ...u, rol_nombre: u.rol?.nombre };
    },

    // ── findByEmail ────────────────────────────────────────────────────────────
    findByEmail: async (email) => {
        const u = await prisma.usuarios.findUnique({
            where: { email },
            include: { rol: true }
        });
        if (!u) return undefined;
        return { ...u, rol_nombre: u.rol?.nombre };
    },

    // ── create ─────────────────────────────────────────────────────────────────
    create: async (data) => {
        const { rol_id, nombre, email, password, tipo_documento, numero_documento, telefono, direccion } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await prisma.usuarios.create({
            data: {
                rol_id: Number(rol_id),
                nombre,
                email,
                password: hashedPassword,
                tipo_documento,
                numero_documento,
                telefono,
                direccion,
                activo: true    // Nuevo usuario siempre activo
            }
        });
        return result.id_usuario;
    },

    // ── update ─────────────────────────────────────────────────────────────────
    //
    // CORRECCIÓN #6: usamos normalizeActivo() en lugar de Boolean(Number(activo))
    //
    update: async (id, data) => {
        const {
            rol_id, nombre, email, password,
            tipo_documento, numero_documento, telefono, direccion, activo
        } = data;

        // Construir objeto dinámico: solo los campos que vienen en el request
        const updateData = {};
        if (rol_id !== undefined) updateData.rol_id = Number(rol_id);
        if (nombre !== undefined) updateData.nombre = nombre;
        if (email !== undefined) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        if (tipo_documento !== undefined) updateData.tipo_documento = tipo_documento;
        if (numero_documento !== undefined) updateData.numero_documento = numero_documento;
        if (telefono !== undefined) updateData.telefono = telefono;
        if (direccion !== undefined) updateData.direccion = direccion;

        // ✅ CORRECCIÓN #6: normalización segura del booleano activo
        if (activo !== undefined) {
            updateData.activo = normalizeActivo(activo);
        }

        const result = await prisma.usuarios.updateMany({
            where: { id_usuario: Number(id) },
            data: updateData
        });
        return result.count > 0;
    },

    // ── delete ─────────────────────────────────────────────────────────────────
    delete: async (id) => {
        const result = await prisma.usuarios.deleteMany({
            where: { id_usuario: Number(id) }
        });
        return result.count > 0;
    },

    // ── getRoles ───────────────────────────────────────────────────────────────
    getRoles: async () => {
        return prisma.roles.findMany();
    }
};

export default Usuario;
