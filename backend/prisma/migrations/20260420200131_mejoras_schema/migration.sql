-- CreateTable
CREATE TABLE `roles` (
    `id_rol` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `rol_id` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `tipo_documento` VARCHAR(20) NULL,
    `numero_documento` VARCHAR(20) NULL,
    `telefono` VARCHAR(20) NULL,
    `direccion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id_categoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    PRIMARY KEY (`id_categoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedores` (
    `id_proveedor` INTEGER NOT NULL AUTO_INCREMENT,
    `nit` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,
    `correo` VARCHAR(100) NULL,
    `direccion` VARCHAR(255) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `proveedores_nit_key`(`nit`),
    PRIMARY KEY (`id_proveedor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id_producto` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria_id` INTEGER NULL,
    `proveedor_id` INTEGER NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `precio_compra` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `precio_venta` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `stock_actual` INTEGER NOT NULL DEFAULT 0,
    `stock_minimo` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_producto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos` (
    `id_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `impuesto` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `fecha_pedido` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_pedido` (
    `id_detalle_pedido` INTEGER NOT NULL AUTO_INCREMENT,
    `pedido_id` INTEGER NOT NULL,
    `producto_id` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_unitario` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id_detalle_pedido`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facturas` (
    `id_factura` INTEGER NOT NULL AUTO_INCREMENT,
    `pedido_id` INTEGER NOT NULL,
    `numero_factura` VARCHAR(50) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `impuesto` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `estado` ENUM('EMITIDA', 'PAGADA', 'ANULADA') NOT NULL DEFAULT 'EMITIDA',
    `fecha_emision` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `facturas_numero_factura_key`(`numero_factura`),
    PRIMARY KEY (`id_factura`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carrito` (
    `id_carrito` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NULL,
    `session_id` VARCHAR(100) NULL,
    `producto_id` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id_carrito`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_proveedor_id_fkey` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `detalle_pedido_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_pedido` ADD CONSTRAINT `detalle_pedido_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facturas` ADD CONSTRAINT `facturas_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carrito` ADD CONSTRAINT `carrito_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carrito` ADD CONSTRAINT `carrito_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id_producto`) ON DELETE RESTRICT ON UPDATE CASCADE;
