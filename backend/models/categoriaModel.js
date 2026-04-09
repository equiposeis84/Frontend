import db from '../config/db.js';

const Categoria = {
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY id_categoria ASC');
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM categorias WHERE id_categoria = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const { nombre, descripcion } = data;
        const [result] = await db.query(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombre, descripcion]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { nombre, descripcion } = data;
        const [result] = await db.query(
            'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
            [nombre, descripcion, id]
        );
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default Categoria;