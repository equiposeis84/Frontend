/**
 * @file facturaController.js
 * @description Controlador para la gestión de facturas.
 */
import Factura from '../models/facturaModel.js';

const getAll = async (req, res) => {
    try {
        const data = await Factura.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const row = await Factura.findById(req.params.id);
        if (!row) return res.status(404).json({ message: "Factura no encontrada" });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const store = async (req, res) => {
    try {
        const { pedido_id, numero_factura } = req.body;
        if (!pedido_id || !numero_factura) return res.status(400).json({ message: "ID del pedido y numero de factura son obligatorios" });
        const id = await Factura.create(req.body);
        res.status(201).json({ message: "Factura generada con éxito", id_factura: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Factura.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Factura no encontrada" });
        res.json({ message: "Factura actualizada" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Factura.delete(id);
        if (!eliminado) return res.status(404).json({ message: "Factura no encontrada" });
        res.json({ message: "Factura eliminada" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "No se puede eliminar esta factura porque tiene detalles asociados." });
        }
        res.status(500).json({ error: error.message });
    }
};

export default { getAll, getOne, store, update, destroy };