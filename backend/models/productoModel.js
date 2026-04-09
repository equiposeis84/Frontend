import db from '../config/db.js';

const Producto = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT p.*, c.nombre AS categoria_nombre, pr.nombre AS proveedor_nombre 
            FROM productos p 
            INNER JOIN categorias c ON p.categoria_id = c.id_categoria
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor
            ORDER BY p.id_producto ASC
        `);
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query(`
            SELECT p.*, c.nombre AS categoria_nombre, pr.nombre AS proveedor_nombre 
            FROM productos p 
            INNER JOIN categorias c ON p.categoria_id = c.id_categoria
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor
            WHERE p.id_producto = ?
        `, [id]);
        return rows[0];
    },
    create: async (data) => {
        const categoria_id = data.categoria_id || null;
        const proveedor_id = data.proveedor_id || null;
        const nombre = data.nombre || '';
        const descripcion = data.descripcion || '';
        const precio_compra = data.precio_compra || 0;
        const precio_venta = data.precio_venta || 0;
        const stock_actual = data.stock_actual || 0;
        const stock_minimo = data.stock_minimo || 0;

        const [result] = await db.query(
            `INSERT INTO productos (categoria_id, proveedor_id, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, activo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [categoria_id, proveedor_id, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { categoria_id, proveedor_id, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, activo } = data;
        const [result] = await db.query(
            `UPDATE productos SET categoria_id=?, proveedor_id=?, nombre=?, descripcion=?, precio_compra=?, precio_venta=?, stock_actual=?, stock_minimo=?, activo=? WHERE id_producto=?`,
            [categoria_id, proveedor_id, nombre, descripcion, precio_compra, precio_venta, stock_actual, stock_minimo, activo, id]
        );
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default Producto;