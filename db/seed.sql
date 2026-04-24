USE sistema_comercial;

-- =====================================================
-- 1. ROLES
-- =====================================================
INSERT INTO roles (id_rol, nombre, descripcion) VALUES
(1, 'Administrador', 'Control total del sistema'),
(2, 'Cliente',       'Usuario registrado con acceso a compras'),
(3, 'Usuario',       'Visitante no registrado'),
(4, 'Repartidor',    'Encargado de entregar pedidos a domicilio');

-- =====================================================
-- 2. USUARIOS
-- =====================================================
INSERT INTO usuarios (rol_id, nombre, email, password, numero_documento, telefono) VALUES
(1, 'Sebastian Admin', 'admin@remate.com',   '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '1010', '3001000001'),
(2, 'Juan Cliente',    'juan@email.com',     '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '2020', '3002000002'),
(2, 'Maria Compra',    'maria@email.com',    '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '3030', '3003000003'),
(2, 'Carlos Venta',    'carlos@email.com',   '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '4040', '3004000004'),
(2, 'Ana Gomez',       'ana@email.com',      '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '5050', '3005000005'),
(4, 'Luis Repartidor', 'luis@remate.com',    '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '6060', '3006000006'),
(4, 'Paula Envios',    'paula@remate.com',   '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '7070', '3007000007'),
(4, 'Jorge Moto',      'jorge@remate.com',   '$2b$10$FmvdWkpOie1MECB/paY9a.D1XyitCgIDj1g4XIZGqXvgIR4sVNGh6', '8080', '3008000008');

-- =====================================================
-- 3. CATEGORIAS
-- =====================================================
INSERT INTO categorias (nombre) VALUES 
('Cocina'), ('Hogar'), ('Electronica'), ('Muebles'), ('Jardin');

-- =====================================================
-- 4. PROVEEDORES
-- =====================================================
INSERT INTO proveedores (nit, nombre, activo) VALUES 
('900-1', 'Mega Plasticos',      1),
('800-2', 'Importaciones Sol',   1),
('700-3', 'Distribuidora Hogar', 1),
('600-4', 'Tecno S.A.',          1),
('500-5', 'Muebles Pro',         1);

-- =====================================================
-- 5. PRODUCTOS
-- =====================================================
INSERT INTO productos (categoria_id, proveedor_id, nombre, precio_compra, precio_venta, stock_actual, imagen_url) VALUES
(1, 1, 'Juego Utensilios', 3000,  5000,  100, NULL),
(1, 1, 'Colador Pro',       500,  1000,  200, NULL),
(2, 2, 'Masajeador',       5000,  9000,   50, NULL),
(3, 4, 'Parlante BT',     15000, 25000,   30, NULL),
(4, 5, 'Silla Rattan',    20000, 35000,   20, NULL),
(5, 3, 'Matera Barro',     2000,  4000,   80, NULL),
(1, 1, 'Sarten Teflon',   8000, 15000,   45, NULL),
(2, 2, 'Lampara LED',     12000, 22000,   15, NULL),
(3, 4, 'Audifonos',        7000, 12000,   60, NULL),
(4, 5, 'Mesa Centro',     40000, 75000,   10, NULL);

-- =====================================================
-- 6. CARRITO
-- =====================================================
INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES
(2, 1, 2), (2, 3, 1), (3, 5, 1), (4, 9, 2), (5, 10, 1);

-- =====================================================
-- 7. PEDIDOS
-- =====================================================
INSERT INTO pedidos 
  (id_pedido, usuario_id, repartidor_id, subtotal, impuesto, total, estado,
   direccion_entrega, fecha_asignacion, fecha_entrega_est, fecha_entrega_real)
VALUES
(1,  2, 6, 17431,  1569, 19000, 'ENTREGADO',
 'Calle 10 # 5-20, Medellin',
 '2025-06-01 08:00:00', '2025-06-01 12:00:00', '2025-06-01 11:30:00'),

(2,  3, NULL, 30172, 4828, 35000, 'CONFIRMADO',
 'Carrera 45 # 12-10, Medellin',
 NULL, NULL, NULL),

(3,  4, 7, 20690,  3310, 24000, 'EN_CAMINO',
 'Av. El Poblado # 3-15, Medellin',
 '2025-06-05 09:00:00', '2025-06-05 14:00:00', NULL),

(4,  5, NULL, 64655, 10345, 75000, 'CANCELADO',
 'Calle 80 # 23-45, Medellin',
 NULL, NULL, NULL),

(5,  2, 6, 4310,   690,  5000, 'ENTREGADO',
 'Calle 10 # 5-20, Medellin',
 '2025-06-02 10:00:00', '2025-06-02 15:00:00', '2025-06-02 14:00:00'),

(6,  3, 7, 12931,  2069, 15000, 'ASIGNADO',
 'Transversal 39 # 77-50, Medellin',
 '2025-06-06 08:30:00', '2025-06-06 13:00:00', NULL),

(7,  4, 8, 43103,  6897, 50000, 'EN_CAMINO',
 'Circular 1 # 70-30, Medellin',
 '2025-06-06 09:00:00', '2025-06-06 14:00:00', NULL),

(8,  5, 6, 25862,  4138, 30000, 'ENTREGADO',
 'Calle 33 # 68-40, Medellin',
 '2025-06-03 07:00:00', '2025-06-03 12:00:00', '2025-06-03 11:45:00'),

(9,  2, 8,  8620,  1380, 10000, 'ASIGNADO',
 'Calle 10 # 5-20, Medellin',
 '2025-06-06 10:00:00', '2025-06-06 16:00:00', NULL),

(10, 3, NULL, 21552, 3448, 25000, 'PENDIENTE',
 'Carrera 45 # 12-10, Medellin',
 NULL, NULL, NULL);

-- =====================================================
-- 8. DETALLE PEDIDOS
-- =====================================================
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1,  1, 2,  5000, 10000),
(1,  3, 1,  9000,  9000),
(2,  5, 1, 35000, 35000),
(3,  9, 2, 12000, 24000),
(4,  10, 1, 75000, 75000),
(6,  7, 1, 15000, 15000),
(7,  4, 1, 25000, 25000),
(7,  8, 1, 22000, 22000),
(8,  1, 3,  5000, 15000),
(8,  2, 2,  1000,  2000),
(9,  9, 1, 12000, 12000),
(10, 3, 1,  9000,  9000),
(10, 6, 2,  4000,  8000);

-- =====================================================
-- 9. FACTURAS
-- =====================================================
INSERT INTO facturas (pedido_id, numero_factura, subtotal, impuesto, total, estado) VALUES
(1,  'F-001', 17431,  1569, 19000, 'PAGADA'),
(2,  'F-002', 30172,  4828, 35000, 'EMITIDA'),
(3,  'F-003', 20690,  3310, 24000, 'EMITIDA'),
(4,  'F-004', 64655, 10345, 75000, 'ANULADA'),
(5,  'F-005',  4310,   690,  5000, 'PAGADA'),
(6,  'F-006', 12931,  2069, 15000, 'EMITIDA'),
(7,  'F-007', 43103,  6897, 50000, 'EMITIDA'),
(8,  'F-008', 25862,  4138, 30000, 'PAGADA'),
(9,  'F-009',  8620,  1380, 10000, 'EMITIDA'),
(10, 'F-010', 21552,  3448, 25000, 'EMITIDA');

-- =====================================================
-- 10. SEGUIMIENTO PEDIDO
-- =====================================================
INSERT INTO seguimiento_pedido (pedido_id, estado_anterior, estado_nuevo, cambiado_por, notas) VALUES
(1, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(1, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado'),
(1, 'CONFIRMADO', 'ASIGNADO',   1, 'Asignado a Luis Repartidor'),
(1, 'ASIGNADO',   'ENTREGADO',  6, 'Entregado exitosamente al cliente'),

(2, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(2, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado, pendiente asignacion'),

(3, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(3, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado'),
(3, 'CONFIRMADO', 'ASIGNADO',   1, 'Asignado a Paula Envios'),
(3, 'ASIGNADO',   'EN_CAMINO',  7, 'Paula salio a entregar'),

(4, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(4, 'PENDIENTE',  'CANCELADO',  1, 'Cancelado por el cliente'),

(5, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(5, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado'),
(5, 'CONFIRMADO', 'ASIGNADO',   1, 'Asignado a Luis Repartidor'),
(5, 'ASIGNADO',   'EN_CAMINO',  6, 'Luis salio a entregar'),
(5, 'EN_CAMINO',  'ENTREGADO',  6, 'Entregado antes del tiempo estimado'),

(6, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(6, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado'),
(6, 'CONFIRMADO', 'ASIGNADO',   1, 'Asignado a Paula Envios'),

(7, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(7, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado'),
(7, 'CONFIRMADO', 'ASIGNADO',   1, 'Asignado a Jorge Moto'),
(7, 'ASIGNADO',   'EN_CAMINO',  8, 'Jorge salio en moto'),

(8, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(8, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado'),
(8, 'CONFIRMADO', 'ASIGNADO',   1, 'Asignado a Luis Repartidor'),
(8, 'ASIGNADO',   'EN_CAMINO',  6, 'Luis en camino'),
(8, 'EN_CAMINO',  'ENTREGADO',  6, 'Entrega completada'),

(9, NULL,         'PENDIENTE',  1, 'Pedido creado'),
(9, 'PENDIENTE',  'CONFIRMADO', 1, 'Pago verificado'),
(9, 'CONFIRMADO', 'ASIGNADO',   1, 'Asignado a Jorge Moto'),

(10, NULL,        'PENDIENTE',  1, 'Pedido creado, sin pago aun');

-- =====================================================
-- 11. MOVIMIENTOS INVENTARIO
-- =====================================================
INSERT INTO movimientos_inventario (producto_id, usuario_id, tipo_movimiento, cantidad, referencia) VALUES
(1,  1, 'ENTRADA',  100, 'Stock inicial - Juego Utensilios'),
(2,  1, 'ENTRADA',  200, 'Stock inicial - Colador Pro'),
(3,  1, 'ENTRADA',   50, 'Stock inicial - Masajeador'),
(4,  1, 'ENTRADA',   30, 'Stock inicial - Parlante BT'),
(5,  1, 'ENTRADA',   20, 'Stock inicial - Silla Rattan'),
(1,  1, 'VENTA',      2, 'Pedido F-001'),
(3,  1, 'VENTA',      1, 'Pedido F-001'),
(5,  1, 'VENTA',      1, 'Pedido F-002'),
(9,  1, 'VENTA',      2, 'Pedido F-003'),
(10, 1, 'VENTA',      1, 'Pedido F-004'),
(7,  1, 'VENTA',      1, 'Pedido F-006'),
(4,  1, 'VENTA',      1, 'Pedido F-007'),
(8,  1, 'VENTA',      1, 'Pedido F-007'),
(1,  1, 'VENTA',      3, 'Pedido F-008'),
(2,  1, 'VENTA',      2, 'Pedido F-008'),
(6,  1, 'COMPRA',    50, 'Reabastecimiento Matera Barro'),
(9,  1, 'AJUSTE',    -3, 'Ajuste por producto danado en bodega'),
(4,  1, 'COMPRA',    20, 'Reabastecimiento Parlante BT');