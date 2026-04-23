-- =====================================================
-- ARCHIVO: schema.sql
-- DESCRIPCIÓN: Esquema completo base de datos
-- BASE DE DATOS: sistema_comercial
-- =====================================================

-- DROP DATABASE IF EXISTS sistema_comercial;
CREATE DATABASE sistema_comercial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_comercial;

-- =====================================================
-- 1. TABLAS MAESTRAS
-- =====================================================

CREATE TABLE roles (
    id_rol      INT          AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE proveedores (
    id_proveedor INT          AUTO_INCREMENT PRIMARY KEY,
    nit          VARCHAR(20)  NOT NULL UNIQUE,
    nombre       VARCHAR(100) NOT NULL,
    telefono     VARCHAR(20),
    correo       VARCHAR(100),
    direccion    VARCHAR(255),
    activo       BOOLEAN      DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE categorias (
    id_categoria INT          AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL UNIQUE,
    descripcion  VARCHAR(255)
) ENGINE=InnoDB;

-- =====================================================
-- 2. USUARIOS
-- =====================================================

CREATE TABLE usuarios (
    id_usuario       INT          AUTO_INCREMENT PRIMARY KEY,
    rol_id           INT          NOT NULL,
    nombre           VARCHAR(100) NOT NULL,
    email            VARCHAR(100) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    tipo_documento   VARCHAR(20),
    numero_documento VARCHAR(20),
    telefono         VARCHAR(20),
    direccion        VARCHAR(255),
    activo           BOOLEAN     DEFAULT TRUE,
    created_at       DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id)
        REFERENCES roles(id_rol) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 3. PRODUCTOS Y CARRITO
-- =====================================================

CREATE TABLE productos (
    id_producto   INT           AUTO_INCREMENT PRIMARY KEY,
    categoria_id  INT,
    proveedor_id  INT           NULL,
    nombre        VARCHAR(150)  NOT NULL,
    descripcion   TEXT,
    imagen_url    VARCHAR(500)  NULL,
    precio_compra DECIMAL(12,2) NOT NULL DEFAULT 0,
    precio_venta  DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock_actual  INT           DEFAULT 0,
    stock_minimo  INT           DEFAULT 0,
    activo        BOOLEAN       DEFAULT TRUE,
    created_at    DATETIME(3)   DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3)   DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_prod_cat  FOREIGN KEY (categoria_id)
        REFERENCES categorias(id_categoria) ON UPDATE CASCADE,
    CONSTRAINT fk_prod_prov FOREIGN KEY (proveedor_id)
        REFERENCES proveedores(id_proveedor) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE carrito (
    id_carrito  INT         AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT         NULL,
    session_id  VARCHAR(100) NULL,
    producto_id INT         NOT NULL,
    cantidad    INT         NOT NULL DEFAULT 1,
    CONSTRAINT fk_car_user FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_car_prod FOREIGN KEY (producto_id)
        REFERENCES productos(id_producto) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 4. PEDIDOS
-- =====================================================

CREATE TABLE pedidos (
    id_pedido          INT           AUTO_INCREMENT PRIMARY KEY,
    usuario_id         INT           NOT NULL,
    repartidor_id      INT           NULL,
    subtotal           DECIMAL(12,2) DEFAULT 0.00,
    impuesto           DECIMAL(12,2) DEFAULT 0.00,
    total              DECIMAL(12,2) DEFAULT 0.00,
    estado             ENUM(
                           'PENDIENTE',
                           'CONFIRMADO',
                           'ASIGNADO',
                           'EN_CAMINO',
                           'ENTREGADO',
                           'CANCELADO'
                       )             DEFAULT 'PENDIENTE',
    direccion_entrega  VARCHAR(255)  NULL,
    notas_entrega      VARCHAR(500)  NULL,
    fecha_pedido       DATETIME(3)   DEFAULT CURRENT_TIMESTAMP(3),
    fecha_asignacion   DATETIME(3)   NULL,
    fecha_entrega_est  DATETIME(3)   NULL,
    fecha_entrega_real DATETIME(3)   NULL,
    CONSTRAINT fk_ped_user        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_ped_repartidor  FOREIGN KEY (repartidor_id)
        REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedido (
    id_detalle_pedido INT           AUTO_INCREMENT PRIMARY KEY,
    pedido_id         INT           NOT NULL,
    producto_id       INT           NOT NULL,
    cantidad          INT           NOT NULL,
    precio_unitario   DECIMAL(12,2) NOT NULL,
    subtotal          DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_det_pedido  FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_det_producto FOREIGN KEY (producto_id)
        REFERENCES productos(id_producto)
) ENGINE=InnoDB;

-- =====================================================
-- 5. SEGUIMIENTO DE PEDIDOS
-- =====================================================

CREATE TABLE seguimiento_pedido (
    id_seguimiento  INT          AUTO_INCREMENT PRIMARY KEY,
    pedido_id       INT          NOT NULL,
    estado_anterior ENUM(
                        'PENDIENTE',
                        'CONFIRMADO',
                        'ASIGNADO',
                        'EN_CAMINO',
                        'ENTREGADO',
                        'CANCELADO'
                    )            NULL,
    estado_nuevo    ENUM(
                        'PENDIENTE',
                        'CONFIRMADO',
                        'ASIGNADO',
                        'EN_CAMINO',
                        'ENTREGADO',
                        'CANCELADO'
                    )            NOT NULL,
    cambiado_por    INT          NOT NULL,
    notas           VARCHAR(500),
    fecha           DATETIME(3)  DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_seg_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_seg_usuario FOREIGN KEY (cambiado_por)
        REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- =====================================================
-- 6. FACTURAS
-- =====================================================

CREATE TABLE facturas (
    id_factura     INT           AUTO_INCREMENT PRIMARY KEY,
    pedido_id      INT           NOT NULL,
    numero_factura VARCHAR(50)   NOT NULL UNIQUE,
    subtotal       DECIMAL(12,2) DEFAULT 0.00,
    impuesto       DECIMAL(12,2) DEFAULT 0.00,
    total          DECIMAL(12,2) DEFAULT 0.00,
    estado         ENUM(
                       'EMITIDA',
                       'PAGADA',
                       'ANULADA'
                   )             DEFAULT 'EMITIDA',
    fecha_emision  DATETIME(3)   DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_fac_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id_pedido)
) ENGINE=InnoDB;

-- =====================================================
-- 7. MOVIMIENTOS DE INVENTARIO
-- =====================================================

CREATE TABLE movimientos_inventario (
    id_movimiento   INT          AUTO_INCREMENT PRIMARY KEY,
    producto_id     INT          NOT NULL,
    usuario_id      INT          NOT NULL,
    tipo_movimiento ENUM(
                        'ENTRADA',
                        'SALIDA',
                        'AJUSTE',
                        'VENTA',
                        'COMPRA'
                    )            NOT NULL,
    cantidad        INT          NOT NULL DEFAULT 0,
    referencia      VARCHAR(100),
    fecha           DATETIME(3)  DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_mov_producto FOREIGN KEY (producto_id)
        REFERENCES productos(id_producto),
    CONSTRAINT fk_mov_usuario  FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;