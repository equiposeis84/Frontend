/**
 * @file reportesController.js
 * @description Controlador con las 5 queries de reportes ejecutadas via db.js (mysql2).
 */
import db from '../config/db.js';

// ── 1. Ventas y Facturación ───────────────────────────────────────────────────
export const getVentas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                f.numero_factura                                AS Factura_No,
                DATE_FORMAT(f.fecha_emision, '%d/%m/%Y')        AS Fecha_Venta,
                u.nombre                                        AS Cliente,
                u.numero_documento                              AS Documento,
                cat.nombre                                      AS Categoria,
                p.nombre                                        AS Producto,
                dp.cantidad                                     AS Cant,
                dp.precio_unitario                              AS Precio_Venta_COP,
                dp.subtotal                                     AS Subtotal_Item,
                ped.subtotal                                    AS Subtotal_Pedido,
                ped.impuesto                                    AS IVA,
                f.total                                         AS Total_Factura,
                f.estado                                        AS Estado_Pago,
                IFNULL(rep.nombre, 'Sin asignar')               AS Repartidor
            FROM facturas f
            INNER JOIN pedidos ped       ON f.pedido_id       = ped.id_pedido
            INNER JOIN usuarios u        ON ped.usuario_id    = u.id_usuario
            LEFT  JOIN usuarios rep      ON ped.repartidor_id = rep.id_usuario
            INNER JOIN detalle_pedido dp ON ped.id_pedido     = dp.pedido_id
            INNER JOIN productos p       ON dp.producto_id    = p.id_producto
            INNER JOIN categorias cat    ON p.categoria_id    = cat.id_categoria
            WHERE f.estado != 'ANULADA'
            ORDER BY f.fecha_emision DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── 2. Inventario, Stock y Ganancias ─────────────────────────────────────────
export const getInventario = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.id_producto                                               AS ID,
                p.nombre                                                    AS Producto,
                c.nombre                                                    AS Categoria,
                IFNULL(prov.nombre, 'SIN PROVEEDOR')                        AS Proveedor,
                p.stock_actual                                              AS Stock_Disponible,
                p.stock_minimo                                              AS Stock_Min,
                CASE 
                    WHEN p.stock_actual = 0               THEN 'AGOTADO'
                    WHEN p.stock_actual <= p.stock_minimo THEN 'STOCK BAJO'
                    ELSE                                       'OK'
                END                                                         AS Alerta_Stock,
                p.precio_compra                                             AS Costo_Unit_COP,
                p.precio_venta                                              AS PVP_COP,
                (p.precio_venta - p.precio_compra)                          AS Margen_Ganancia,
                ROUND(
                    ((p.precio_venta - p.precio_compra) / p.precio_compra) * 100, 2
                )                                                           AS Margen_Pct,
                (p.stock_actual * p.precio_compra)                          AS Valor_Inventario_Costo,
                (p.stock_actual * (p.precio_venta - p.precio_compra))       AS Ganancia_Potencial
            FROM productos p
            INNER JOIN categorias c      ON p.categoria_id  = c.id_categoria
            LEFT  JOIN proveedores prov  ON p.proveedor_id  = prov.id_proveedor
            WHERE p.activo = TRUE
            ORDER BY p.stock_actual ASC, Margen_Ganancia DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── 3. Seguridad, Roles y Accesos ─────────────────────────────────────────────
export const getSeguridad = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                u.id_usuario                                        AS ID_User,
                u.nombre                                            AS Nombre_Usuario,
                u.email                                             AS Email_Login,
                u.telefono                                          AS Telefono,
                r.nombre                                            AS Rol,
                r.descripcion                                       AS Permisos_Asignados,
                CASE 
                    WHEN u.activo = TRUE THEN 'ACTIVO' 
                    ELSE 'INACTIVO' 
                END                                                 AS Estado_Cuenta,
                DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i')         AS Fecha_Registro,
                DATE_FORMAT(u.updated_at, '%d/%m/%Y %H:%i')         AS Ultima_Modificacion
            FROM usuarios u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            ORDER BY r.nombre ASC, u.activo DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── 4. Carritos Activos ───────────────────────────────────────────────────────
export const getCarritos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                IFNULL(u.nombre, 'Invitado')            AS Usuario,
                IFNULL(car.session_id, '—')             AS Session_ID,
                p.nombre                                AS Producto,
                car.cantidad                            AS Cant_En_Carrito,
                p.precio_venta                          AS Precio_Actual,
                (car.cantidad * p.precio_venta)         AS Total_Proyectado,
                CASE
                    WHEN p.stock_actual = 0             THEN 'SIN STOCK'
                    WHEN p.stock_actual < car.cantidad  THEN 'STOCK INSUFICIENTE'
                    ELSE                                     'DISPONIBLE'
                END                                     AS Disponibilidad
            FROM carrito car
            LEFT  JOIN usuarios u  ON car.usuario_id  = u.id_usuario
            INNER JOIN productos p ON car.producto_id = p.id_producto
            ORDER BY u.nombre ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── 5. Repartidores y Pedidos ────────────────────────────────────────────────
export const getRepartidores = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                rep.id_usuario                                          AS ID_Repartidor,
                rep.nombre                                              AS Repartidor,
                rep.telefono                                            AS Telefono,
                ped.id_pedido                                           AS ID_Pedido,
                u.nombre                                                AS Cliente,
                ped.direccion_entrega                                   AS Direccion_Entrega,
                ped.estado                                              AS Estado_Pedido,
                DATE_FORMAT(ped.fecha_asignacion,    '%d/%m/%Y %H:%i') AS Fecha_Asignacion,
                DATE_FORMAT(ped.fecha_entrega_est,   '%d/%m/%Y %H:%i') AS Entrega_Estimada,
                DATE_FORMAT(ped.fecha_entrega_real,  '%d/%m/%Y %H:%i') AS Entrega_Real,
                CASE
                    WHEN ped.fecha_entrega_real IS NULL                         THEN 'PENDIENTE'
                    WHEN ped.fecha_entrega_real <= ped.fecha_entrega_est        THEN 'A TIEMPO'
                    ELSE                                                             'TARDE'
                END                                                     AS Cumplimiento,
                ped.total                                               AS Total_Pedido,
                GROUP_CONCAT(
                    p.nombre, ' x', dp.cantidad
                    ORDER BY p.nombre
                    SEPARATOR ' | '
                )                                                       AS Productos
            FROM usuarios rep
            INNER JOIN roles r           ON rep.id_rol        = r.id_rol        AND r.nombre = 'Repartidor'
            LEFT  JOIN pedidos ped       ON ped.repartidor_id = rep.id_usuario
            LEFT  JOIN usuarios u        ON ped.usuario_id    = u.id_usuario
            LEFT  JOIN detalle_pedido dp ON ped.id_pedido     = dp.pedido_id
            LEFT  JOIN productos p       ON dp.producto_id    = p.id_producto
            GROUP BY
                rep.id_usuario, rep.nombre, rep.telefono,
                ped.id_pedido, u.nombre, ped.direccion_entrega,
                ped.estado, ped.fecha_asignacion,
                ped.fecha_entrega_est, ped.fecha_entrega_real, ped.total
            ORDER BY rep.nombre ASC, ped.fecha_asignacion DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
