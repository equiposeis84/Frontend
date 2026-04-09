import db from '../config/db.js';

const Proveedor = {
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM proveedores ORDER BY id_proveedor ASC');
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM proveedores WHERE id_proveedor = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const { nit, nombre, telefono, correo, direccion } = data;
        const [result] = await db.query(
            'INSERT INTO proveedores (nit, nombre, telefono, correo, direccion, activo) VALUES (?, ?, ?, ?, ?, 1)',
            [nit, nombre, telefono, correo, direccion]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { nit, nombre, telefono, correo, direccion, activo } = data;
        const [result] = await db.query(
            'UPDATE proveedores SET nit = ?, nombre = ?, telefono = ?, correo = ?, direccion = ?, activo = ? WHERE id_proveedor = ?',
            [nit, nombre, telefono, correo, direccion, activo, id]
        );
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM proveedores WHERE id_proveedor = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default Proveedor;