import db from '../config/db.js';

const Factura = {
    findAll: async () => {
        const [rows] = await db.query(`
            SELECT f.*, p.estado AS pedido_estado 
            FROM facturas f 
            INNER JOIN pedidos p ON f.pedido_id = p.id_pedido
            ORDER BY f.id_factura ASC
        `);
        return rows;
    },
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM facturas WHERE id_factura = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const { pedido_id, numero_factura, subtotal, impuesto, total, estado } = data;
        const [result] = await db.query(
            `INSERT INTO facturas (pedido_id, numero_factura, subtotal, impuesto, total, estado) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [pedido_id, numero_factura, subtotal || 0, impuesto || 0, total || 0, estado || 'EMITIDA']
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { numero_factura, subtotal, impuesto, total, estado } = data;
        const [result] = await db.query(
            `UPDATE facturas SET numero_factura=?, subtotal=?, impuesto=?, total=?, estado=? WHERE id_factura=?`,
            [numero_factura, subtotal, impuesto, total, estado, id]
        );
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM facturas WHERE id_factura = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default Factura;