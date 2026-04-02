const db = require('../config/db');

const Carrito = {
    // Buscar carrito por usuario (prioridad) o por sesion (invitados)
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
            // Un usuario sin login (huerfano) tiene el usuario_id null y el session activo
            query += ` WHERE c.session_id = ? AND c.usuario_id IS NULL`;
            params.push(session_id);
        } else {
            return []; // no pasaron ni id ni sesion
        }

        const [rows] = await db.query(query, params);
        return rows;
    },

    // Buscar items unicos para saber si agregar o solo actualizar cantidad
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
            // suma cantidad
            const nuevaCantidad = existing.cantidad + cantidad;
            const [result] = await db.query(`UPDATE carrito SET cantidad = ? WHERE id_carrito = ?`, [nuevaCantidad, existing.id_carrito]);
            return result.affectedRows > 0;
        } else {
            // inserta nuevo
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

    // El truco de magia: traspasar las sesiones huerfanas a un cliente real recien logueado
    mergeSession: async (session_id, usuario_id) => {
        // En lugar de chocar por unique, si un usuario loguea y tenia productos anonimos y además productos viejos, 
        // lo mas limpio es mover los ID
        // Como no hay Restricción Unique (usuario_id, producto_id) en el esquema actual, el update masivo es directo (podría haber repetidos, pero lo abstraemos simple)
        const [result] = await db.query(`
            UPDATE carrito 
            SET usuario_id = ?, session_id = NULL 
            WHERE session_id = ? AND usuario_id IS NULL
        `, [usuario_id, session_id]);
        return result.affectedRows;
    }
};

module.exports = Carrito;
