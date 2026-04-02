-- =====================================================
-- ARCHIVO: queries.sql
-- DESCRIPCIÓN: Reportes de Facturación, Inventario y Seguridad
-- =====================================================

USE sistema_comercial;

-- =====================================================
-- 1. REPORTE DE VENTAS Y FACTURACIÓN DETALLADA
-- Extrae los productos vendidos a través del vínculo Factura-Pedido
-- =====================================================

SELECT 
    f.numero_factura AS 'Factura_No',
    f.fecha AS 'Fecha_Venta',
    u.nombre AS 'Cliente',
    u.numero_documento AS 'Documento',
    cat.nombre AS 'Categoria',
    p.nombre AS 'Producto',
    dp.cantidad AS 'Cant',
    dp.precio_unitario AS 'Precio_Venta_COP',
    dp.subtotal AS 'Subtotal_Item',
    f.total AS 'Total_Factura',
    f.estado AS 'Estado_Pago'
FROM facturas f
INNER JOIN pedidos ped ON f.pedido_id = ped.id_pedido
INNER JOIN usuarios u ON ped.usuario_id = u.id_usuario
INNER JOIN detalle_pedido dp ON ped.id_pedido = dp.pedido_id
INNER JOIN productos p ON dp.producto_id = p.id_producto
INNER JOIN categorias cat ON p.categoria_id = cat.id_categoria
ORDER BY f.fecha DESC;

-- =====================================================
-- 2. REPORTE DE INVENTARIO, STOCK Y GANANCIAS
-- Muestra el estado del almacén y la rentabilidad por producto
-- =====================================================

SELECT 
    p.id_producto AS 'ID',
    p.nombre AS 'Producto',
    c.nombre AS 'Categoria',
    IFNULL(prov.nombre, 'SIN PROVEEDOR') AS 'Proveedor',
    p.stock_actual AS 'Stock_Disponible',
    p.stock_minimo AS 'Stock_Min',
    p.precio_compra AS 'Costo_Unit_COP',
    p.precio_venta AS 'PVP_COP',
    (p.precio_venta - p.precio_compra) AS 'Margen_Ganancia',
    (p.stock_actual * (p.precio_venta - p.precio_compra)) AS 'Valor_Ganancia_en_Stock'
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id_categoria
LEFT JOIN proveedores prov ON p.proveedor_id = prov.id_proveedor
ORDER BY p.stock_actual ASC;

-- =====================================================
-- 3. REPORTE DE SEGURIDAD, ROLES Y ACCESOS
-- Utilizado para auditoría de usuarios y validación de permisos
-- =====================================================

SELECT 
    u.id_usuario AS 'ID_User',
    u.nombre AS 'Nombre_Usuario',
    u.email AS 'Email_Login',
    r.nombre AS 'Rol',
    r.descripcion AS 'Permisos_Asignados',
    CASE 
        WHEN u.activo = 1 THEN 'ACTIVO' 
        ELSE 'INACTIVO' 
    END AS 'Estado_Cuenta'
FROM usuarios u
INNER JOIN roles r ON u.rol_id = r.id_rol
ORDER BY r.nombre ASC;

-- =====================================================
-- 4. CONSULTA EXTRA: ESTADO ACTUAL DE CARRITOS
-- Útil para ver qué tienen los clientes antes de comprar
-- =====================================================

SELECT 
    IFNULL(u.nombre, 'Invitado (Sesión)') AS 'Usuario',
    p.nombre AS 'Producto_Interés',
    car.cantidad AS 'Cant_En_Carrito',
    p.precio_venta AS 'Precio_Actual',
    (car.cantidad * p.precio_venta) AS 'Total_Proyectado'
FROM carrito car
LEFT JOIN usuarios u ON car.usuario_id = u.id_usuario
INNER JOIN productos p ON car.producto_id = p.id_producto;