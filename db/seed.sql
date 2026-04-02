USE sistema_comercial;

-- 1. ROLES
INSERT INTO roles (id_rol, nombre, descripcion) VALUES
(1, 'Administrador', 'Control total del sistema'),
(2, 'Cliente', 'Usuario registrado con acceso a compras'),
(3, 'Usuario', 'Visitante no registrado');

-- 2. USUARIOS (5 registros)
INSERT INTO usuarios (rol_id, nombre, email, password, numero_documento) VALUES
(1, 'Sebastian Admin', 'admin@remate.com', 'pass123', '1010'),
(2, 'Juan Cliente', 'juan@email.com', 'pass123', '2020'),
(2, 'Maria Compra', 'maria@email.com', 'pass123', '3030'),
(2, 'Carlos Venta', 'carlos@email.com', 'pass123', '4040'),
(2, 'Ana Gomez', 'ana@email.com', 'pass123', '5050');

-- 3. CATEGORIAS
INSERT INTO categorias (nombre) VALUES 
('Cocina'), ('Hogar'), ('Electrónica'), ('Muebles'), ('Jardín');

-- 4. PROVEEDORES
INSERT INTO proveedores (nit, nombre, activo) VALUES 
('900-1', 'Mega Plásticos', 1),
('800-2', 'Importaciones Sol', 1),
('700-3', 'Distribuidora Hogar', 1),
('600-4', 'Tecno S.A.', 1),
('500-5', 'Muebles Pro', 1);

-- 5. PRODUCTOS (10 registros)
INSERT INTO productos (categoria_id, proveedor_id, nombre, precio_compra, precio_venta, stock_actual) VALUES
(1, 1, 'Juego Utensilios', 3000, 5000, 100),
(1, 1, 'Colador Pro', 500, 1000, 200),
(2, 2, 'Masajeador', 5000, 9000, 50),
(3, 4, 'Parlante BT', 15000, 25000, 30),
(4, 5, 'Silla Rattan', 20000, 35000, 20),
(5, 3, 'Matera Barro', 2000, 4000, 80),
(1, 1, 'Sartén Teflón', 8000, 15000, 45),
(2, 2, 'Lámpara LED', 12000, 22000, 15),
(3, 4, 'Audífonos', 7000, 12000, 60),
(4, 5, 'Mesa Centro', 40000, 75000, 10);

-- 6. CARRITO (5 registros)
INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES
(2, 1, 2), (2, 3, 1), (3, 5, 1), (4, 9, 2), (5, 10, 1);

-- 7. PEDIDOS Y DETALLES (5 registros)
INSERT INTO pedidos (id_pedido, usuario_id, total, estado) VALUES
(1, 2, 19000, 'PAGADO'), (2, 3, 35000, 'PENDIENTE'),
(3, 4, 24000, 'PAGADO'), (4, 5, 75000, 'CANCELADO'),
(5, 2, 5000, 'ENTREGADO');

INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 2, 5000, 10000), (1, 3, 1, 9000, 9000),
(2, 5, 1, 35000, 35000), (3, 9, 2, 12000, 24000),
(4, 10, 1, 75000, 75000);

-- 8. FACTURAS (5 registros)
INSERT INTO facturas (pedido_id, numero_factura, total, estado) VALUES
(1, 'F-001', 19000, 'PAGADA'), (2, 'F-002', 35000, 'EMITIDA'),
(3, 'F-003', 24000, 'PAGADA'), (4, 'F-004', 75000, 'ANULADA'),
(5, 'F-005', 5000, 'PAGADA');