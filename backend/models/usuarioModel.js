import db from '../config/db.js';

const Usuario = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT u.id_usuario, u.rol_id, u.nombre, u.email, u.numero_documento, u.activo, r.nombre AS rol_nombre 
            FROM usuarios u 
            INNER JOIN roles r ON u.rol_id = r.id_rol
            ORDER BY u.id_usuario ASC
        `);
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query(`
            SELECT u.*, r.nombre AS rol_nombre 
            FROM usuarios u 
            INNER JOIN roles r ON u.rol_id = r.id_rol 
            WHERE u.id_usuario = ?`, [id]);
        return rows[0];
    },

    findByEmail: async (email) => {
        const [rows] = await db.query(`
            SELECT u.*, r.nombre AS rol_nombre 
            FROM usuarios u 
            INNER JOIN roles r ON u.rol_id = r.id_rol 
            WHERE u.email = ?`, [email]);
        return rows[0];
    },

    create: async (data) => {
        const { rol_id, nombre, email, password, numero_documento } = data;
        const [result] = await db.query(
            `INSERT INTO usuarios (rol_id, nombre, email, password, numero_documento, activo) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [rol_id, nombre, email, password, numero_documento]
        );
        return result.insertId;
    },

    update: async (id, data) => {
        const { rol_id, nombre, email, numero_documento, activo } = data;
        const [result] = await db.query(
            `UPDATE usuarios SET rol_id = ?, nombre = ?, email = ?, numero_documento = ?, activo = ? 
            WHERE id_usuario = ?`,
            [rol_id, nombre, email, numero_documento, activo, id]
        );
        return result.affectedRows > 0;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
        return result.affectedRows > 0;
    },

    getRoles: async () => {
        const [rows] = await db.query('SELECT * FROM roles');
        return rows;
    }
};

export default Usuario;