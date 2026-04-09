import Producto from '../models/productoModel.js';

const getAll = async (req, res) => {
    try {
        const data = await Producto.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOne = async (req, res) => {
    try {
        const row = await Producto.findById(req.params.id);
        if (!row) return res.status(404).json({ message: "Producto no encontrado" });
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const store = async (req, res) => {
    try {
        const { categoria_id, nombre, precio_compra, precio_venta } = req.body;
        if (!categoria_id || !nombre || precio_compra === undefined || precio_venta === undefined) {
            return res.status(400).json({ message: "La categoría, nombre y precios son obligatorios" });
        }
        const id = await Producto.create(req.body);
        res.status(201).json({ message: "Producto creado con éxito", id_producto: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const actualizado = await Producto.update(id, req.body);
        if (!actualizado) return res.status(404).json({ message: "Producto no encontrado para actualizar" });
        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Producto.delete(id);
        if (!eliminado) return res.status(404).json({ message: "Producto no encontrado" });
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: "No se puede eliminar este producto porque se usa en inventarios o pedidos." });
        }
        res.status(500).json({ error: error.message });
    }
};

export default { getAll, getOne, store, update, destroy };