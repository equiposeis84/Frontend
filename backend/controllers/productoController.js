/**
 * @file productoController.js
 * @description Controlador para las operaciones CRUD de productos.
 * Incluye la lógica de integración con Cloudinary para imágenes.
 */
import Producto from '../models/productoModel.js';
import { v2 as cloudinary } from 'cloudinary';

const getAll = async (req, res) => {
    try {
        const data = await Producto.findAll();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── Catálogo público: solo activos, sin token ──────────────────────
const getPublic = async (req, res) => {
    try {
        const data = await Producto.findAllActive();
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

        // req.file.path contiene la URL pública de Cloudinary
        const imagen_url = req.file ? req.file.path : null;

        const id = await Producto.create({ ...req.body, imagen_url });
        res.status(201).json({ message: "Producto creado con éxito", id_producto: id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;

        let imagen_url = req.body.imagen_url; // URL anterior si no cambió
        if (req.file) {
            imagen_url = req.file.path; // Nueva imagen subida a Cloudinary

            // Borrar la imagen anterior de Cloudinary para no acumular archivos
            const productoActual = await Producto.findById(id);
            if (productoActual?.imagen_url) {
                try {
                    const urlParts = productoActual.imagen_url.split('/');
                    const publicId = urlParts.slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (_) {
                    // No interrumpir el flujo si falla la limpieza
                }
            }
        }

        const actualizado = await Producto.update(id, { ...req.body, imagen_url });
        if (!actualizado) return res.status(404).json({ message: "Producto no encontrado para actualizar" });
        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        // Borrar imagen de Cloudinary antes de eliminar el producto
        const producto = await Producto.findById(id);
        if (producto?.imagen_url) {
            try {
                const urlParts = producto.imagen_url.split('/');
                const publicId = urlParts.slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (_) {
                // No interrumpir el flujo si falla la limpieza
            }
        }

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

export default { getAll, getPublic, getOne, store, update, destroy };
