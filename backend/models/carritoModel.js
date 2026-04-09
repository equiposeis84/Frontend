import db from '../config/db.js';

const Carrito = {
    find: async (usuario_id, session_id) => {
        let query = `
            SELECT c.id_carrito, c.usuario_id, c.session_id, c.producto_id, c.cantidad, 
                   p.nombre, p.precio_venta as precio, (c.cantidad * p.precio_venta) as subtotal,
                   p.stock_actual
            FROM carrito c 
            INNER JOIN productos p ON c.producto_id = p.id_producto 
        `;
        let params = [];
        
        if (usuario_id) {
            query += ` WHERE c.usuario_id = ?`;
            params.push(usuario_id);
        } else if (session_id) {
            query += ` WHERE c.session_id = ? AND c.usuario_id IS NULL`;
            params.push(session_id);
        } else {
            return [];
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    findItem: async (usuario_id, session_id, producto_id) => {
        let query = `SELECT * FROM carrito WHERE producto_id = ? AND `;
        let params = [producto_id];
        
        if (usuario_id) {
            query += `usuario_id = ?`;
            params.push(usuario_id);
        } else if (session_id) {
            query += `session_id = ? AND usuario_id IS NULL`;
            params.push(session_id);
        } else {
            return null;
        }

        const [rows] = await db.query(query, params);
        return rows[0];
    },

    addItem: async (usuario_id, session_id, producto_id, cantidad) => {
        const existing = await Carrito.findItem(usuario_id, session_id, producto_id);
        if (existing) {
            const nuevaCantidad = existing.cantidad + cantidad;
            const [result] = await db.query(`UPDATE carrito SET cantidad = ? WHERE id_carrito = ?`, [nuevaCantidad, existing.id_carrito]);
            return result.affectedRows > 0;
        } else {
            const [result] = await db.query(`
                INSERT INTO carrito (usuario_id, session_id, producto_id, cantidad) 
                VALUES (?, ?, ?, ?)`, 
                [usuario_id || null, session_id || null, producto_id, cantidad]
            );
            return result.insertId;
        }
    },

    updateQuantity: async (id_carrito, cantidad) => {
        const [result] = await db.query(`UPDATE carrito SET cantidad = ? WHERE id_carrito = ?`, [cantidad, id_carrito]);
        return result.affectedRows > 0;
    },

    removeItemByProducto: async (usuario_id, session_id, producto_id) => {
        let query = `DELETE FROM carrito WHERE producto_id = ? AND `;
        let params = [producto_id];

        if (usuario_id) {
            query += `usuario_id = ?`;
            params.push(usuario_id);
        } else if (session_id) {
            query += `session_id = ? AND usuario_id IS NULL`;
            params.push(session_id);
        } else {
            return false;
        }

        const [result] = await db.query(query, params);
        return result.affectedRows > 0;
    },

    clearCart: async (usuario_id, session_id) => {
        let query = `DELETE FROM carrito WHERE `;
        let params = [];

        if (usuario_id) {
            query += `usuario_id = ?`;
            params.push(usuario_id);
        } else if (session_id) {
            query += `session_id = ? AND usuario_id IS NULL`;
            params.push(session_id);
        } else {
            return false;
        }

        const [result] = await db.query(query, params);
        return result.affectedRows > 0;
    },

    mergeSession: async (session_id, usuario_id) => {
        const [result] = await db.query(`
            UPDATE carrito 
            SET usuario_id = ?, session_id = NULL 
            WHERE session_id = ? AND usuario_id IS NULL
        `, [usuario_id, session_id]);
        return result.affectedRows;
    }
};

export default Carrito;