import db from '../config/db.js';

const Pedido = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT p.*, u.nombre AS usuario_nombre 
            FROM pedidos p 
            INNER JOIN usuarios u ON p.usuario_id = u.id_usuario
            ORDER BY p.id_pedido ASC
        `);
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query(`
            SELECT p.*, u.nombre AS usuario_nombre 
            FROM pedidos p 
            INNER JOIN usuarios u ON p.usuario_id = u.id_usuario
            WHERE p.id_pedido = ?
        `, [id]);
        return rows[0];
    },
    create: async (data) => {
        const { usuario_id, subtotal, impuesto, total, estado } = data;
        const [result] = await db.query(
            `INSERT INTO pedidos (usuario_id, subtotal, impuesto, total, estado) 
             VALUES (?, ?, ?, ?, ?)`,
            [usuario_id, subtotal || 0, impuesto || 0, total || 0, estado || 'PENDIENTE']
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { subtotal, impuesto, total, estado } = data;
        const [result] = await db.query(
            `UPDATE pedidos SET subtotal=?, impuesto=?, total=?, estado=? WHERE id_pedido=?`,
            [subtotal, impuesto, total, estado, id]
        );
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM pedidos WHERE id_pedido = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default Pedido;