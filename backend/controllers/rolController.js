/**
 * @file rolController.js
 * @description Controlador para la gestión de roles de usuario.
 */
import Rol from '../models/rolModel.js';

const getAll = async (req, res) => {
    try {
        const data = await Rol.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const row = await Rol.findById(req.params.id);
        if (!row) return res.status(404).json({ message: "Rol no encontrado" });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const store = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });
        const id = await Rol.create({ nombre, descripcion });
        res.status(201).json({ message: "Rol creado con éxito", id_rol: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Rol.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Rol no encontrado" });
        res.json({ message: "Rol actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Rol.delete(id);
        if (!eliminado) return res.status(404).json({ message: "Rol no encontrado" });
        res.json({ message: "Rol eliminado" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "No se puede eliminar este rol porque hay usuarios asignados." });
        }
        res.status(500).json({ error: error.message });
    }
};

export default { getAll, getOne, store, update, destroy };