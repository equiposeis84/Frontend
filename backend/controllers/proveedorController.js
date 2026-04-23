/**
 * @file proveedorController.js
 * @description Controlador para la gestión de proveedores.
 */
import Proveedor from '../models/proveedorModel.js';

const getAll = async (req, res) => {
    try {
        const data = await Proveedor.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const row = await Proveedor.findById(req.params.id);
        if (!row) return res.status(404).json({ message: "Proveedor no encontrado" });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const store = async (req, res) => {
    try {
        const { nit, nombre, telefono, correo, direccion } = req.body;
        if (!nit || !nombre) return res.status(400).json({ message: "NIT y Nombre son obligatorios" });
        const id = await Proveedor.create({ nit, nombre, telefono, correo, direccion });
        res.status(201).json({ message: "Proveedor creado con éxito", id_proveedor: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Proveedor.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Proveedor no encontrado para actualizar" });
        res.json({ message: "Proveedor actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Proveedor.delete(id);
        if (!eliminado) return res.status(404).json({ message: "Proveedor no encontrado" });
        res.json({ message: "Proveedor eliminado" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "No se puede eliminar este proveedor porque tiene registros asociados." });
        }
        res.status(500).json({ error: error.message });
    }
};

export default { getAll, getOne, store, update, destroy };