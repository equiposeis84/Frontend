/**
 * @file usuarioController.js
 * @description Controlador para la gestión de usuarios y autenticación.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Usuario from '../models/usuarioModel.js';

const SECRET_KEY = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

// ─── Opciones de la cookie httpOnly ─────────────────────────────────────────
const cookieOptions = {
    httpOnly: true,           // JavaScript del cliente NO puede leerla (protege vs XSS)
    secure: process.env.NODE_ENV === 'production', // HTTPS solo en producción
    sameSite: 'lax',          // Protección CSRF básica
    maxAge: 24 * 60 * 60 * 1000 // 24 horas en millisegundos
};

function generarToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
}

// ─── CRUD Usuarios ───────────────────────────────────────────────────────────
const getAll = async (req, res) => {
    try {
        const data = await Usuario.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const user = await Usuario.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const store = async (req, res) => {
    try {
        const { rol_id, nombre, email, password, tipo_documento, numero_documento, telefono, direccion } = req.body;
        if (!rol_id || !nombre || !email || !password) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }
        const id = await Usuario.create({ rol_id, nombre, email, password, tipo_documento, numero_documento, telefono, direccion });
        res.status(201).json({ message: 'Usuario creado con éxito', id_usuario: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Usuario.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: 'No se encontró el registro para actualizar' });
        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await Usuario.getRoles();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Usuario.delete(id);
        if (!eliminado) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado físicamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar este usuario porque ya tiene registros asociados.' });
        }
        res.status(500).json({ error: error.message });
    }
};

// ─── Autenticación ────────────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Usuario.findByEmail(email);

        const passwordValida = user && await bcrypt.compare(password, user.password);
        if (!passwordValida) {
            return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
        }
        if (!user.activo) {
            return res.status(403).json({ message: 'La cuenta está inactiva.' });
        }

        // Eliminar la contraseña del payload antes de firmar y de responder
        delete user.password;

        const payload = { userId: user.id_usuario, user: user.nombre, rol_id: user.rol_id };
        const token = generarToken(payload);

        // ✅ Token en httpOnly cookie (mantenemos para compatibilidad con la WEB)
        res.cookie('token', token, cookieOptions);

        // ✅ Se devuelve el token también en el body (para que el MÓVIL lo pueda guardar)
        res.json({ 
            message: '¡Inicio de sesión exitoso!', 
            user,
            token 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/usuarios/me
 * Retorna los datos del usuario autenticado (extraídos del token por el middleware)
 */
const getMe = async (req, res) => {
    try {
        // req.usuario viene del middleware verificarToken
        const user = await Usuario.findById(req.usuario.userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        delete user.password;
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/usuarios/logout
 * Limpia la httpOnly cookie del servidor
 */
const logout = (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.json({ message: 'Sesión cerrada correctamente' });
};

export default { getAll, getOne, store, update, getRoles, destroy, login, logout, getMe };