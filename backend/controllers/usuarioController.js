import jwt from 'jsonwebtoken';
import Usuario from '../models/usuarioModel.js';

const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta_super_segura";

function generarToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
}

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
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const store = async (req, res) => {
    try {
        const { rol_id, nombre, email, password, tipo_documento, numero_documento, telefono, direccion } = req.body;
        if (!rol_id || !nombre || !email || !password) return res.status(400).json({ message: "Faltan campos obligatorios" });

        const id = await Usuario.create({ rol_id, nombre, email, password, tipo_documento, numero_documento, telefono, direccion });
        res.status(201).json({ message: "Usuario creado con éxito", id_usuario: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Usuario.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: "No se encontró el registro para actualizar" });
        res.json({ message: "Usuario actualizado correctamente" });
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
        if (!eliminado) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario eliminado físicamente" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "No se puede eliminar este usuario porque ya tiene registros asociados." });
        }
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Usuario.findByEmail(email);

        if (!user || user.password !== password) return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        if (!user.activo) return res.status(403).json({ message: "La cuenta está inactiva." });

        delete user.password;
        const payload = { userId: user.id_usuario, user: user.nombre, rol_id: user.rol_id };
        const token = generarToken(payload);

        res.json({ message: "¡Inicio de sesión exitoso!", token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { getAll, getOne, store, update, getRoles, destroy, login };