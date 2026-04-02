-- =====================================================
-- 1. LIMPIEZA Y CREACIÓN DE BASE DE DATOS
-- =====================================================
-- DROP DATABASE IF EXISTS sistema_comercial;
CREATE DATABASE sistema_comercial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_comercial;

-- =====================================================
-- 2. TABLAS MAESTRAS (Sin dependencias)
-- =====================================================
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE proveedores (
    id_proveedor INT AUTO_INCREMENT PRIMARY KEY,
    nit VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    telefono VARCHAR(30),
    correo VARCHAR(120),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

-- =====================================================
-- 3. TABLAS CON LLAVES FORÁNEAS
-- =====================================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    numero_documento VARCHAR(30),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id_rol) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    proveedor_id INT NULL, -- Permitir NULL para ON DELETE SET NULL
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    precio_compra DECIMAL(12,2) NOT NULL,
    precio_venta DECIMAL(12,2) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_prod_cat FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria) ON UPDATE CASCADE,
    CONSTRAINT fk_prod_prov FOREIGN KEY (proveedor_id) REFERENCES proveedores(id_proveedor) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    session_id VARCHAR(255) NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_car_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_car_prod FOREIGN KEY (producto_id) REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 4. TRANSACCIONES Y MOVIMIENTOS
-- =====================================================
CREATE TABLE movimientos_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_movimiento ENUM('ENTRADA', 'SALIDA', 'AJUSTE', 'VENTA', 'COMPRA') NOT NULL,
    referencia VARCHAR(100),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mov_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2) DEFAULT 0.00,
    estado ENUM('PENDIENTE', 'PAGADO', 'ENTREGADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    CONSTRAINT fk_ped_user FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedido (
    id_detalle_pedido INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_det_ped_id FOREIGN KEY (pedido_id) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_det_ped_prod FOREIGN KEY (producto_id) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

CREATE TABLE facturas (
    id_factura INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2) NOT NULL,
    estado ENUM('EMITIDA','ANULADA','PAGADA') DEFAULT 'EMITIDA',
    CONSTRAINT fk_fac_ped FOREIGN KEY (pedido_id) REFERENCES pedidos(id_pedido)
) ENGINE=InnoDB;