-- Migración para módulos de recetas y ventas
-- Compatible con el esquema actual de inventario_inteligente.
-- Agrega tablas faltantes, relaciones con productos y movimientos de inventario.

CREATE TABLE IF NOT EXISTS `recetas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_venta` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_recetas_nombre` (`nombre`),
  KEY `idx_recetas_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `detalle_receta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_detalle_receta_producto` (`receta_id`, `producto_id`),
  KEY `idx_detalle_receta_receta` (`receta_id`),
  KEY `idx_detalle_receta_producto` (`producto_id`),
  CONSTRAINT `fk_detalle_receta_receta` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_receta_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero_venta` varchar(50) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT current_timestamp(),
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('CONFIRMADA','ANULADA') NOT NULL DEFAULT 'CONFIRMADA',
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ventas_numero` (`numero_venta`),
  KEY `idx_ventas_usuario` (`usuario_id`),
  KEY `idx_ventas_fecha` (`fecha_venta`),
  KEY `idx_ventas_estado` (`estado`),
  CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `detalle_ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `venta_id` int(11) NOT NULL,
  `receta_id` int(11) NOT NULL,
  `receta_nombre` varchar(150) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_detalle_ventas_venta` (`venta_id`),
  KEY `idx_detalle_ventas_receta` (`receta_id`),
  CONSTRAINT `fk_detalle_ventas_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_ventas_receta` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `movimientos_inventario`
  ADD COLUMN IF NOT EXISTS `venta_id` int(11) DEFAULT NULL AFTER `compra_id`;

ALTER TABLE `movimientos_inventario`
  ADD KEY `idx_movimientos_venta` (`venta_id`);

ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `fk_movimientos_venta`
  FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON UPDATE CASCADE;

INSERT IGNORE INTO `permisos` (`codigo`, `nombre`, `modulo`, `descripcion`, `fecha_creacion`)
VALUES
  ('recetas.ver', 'Ver recetas', 'recetas', 'Consultar el catálogo de recetas', NOW()),
  ('recetas.crear', 'Crear recetas', 'recetas', 'Registrar nuevas recetas', NOW()),
  ('recetas.editar', 'Editar recetas', 'recetas', 'Actualizar recetas y sus ingredientes', NOW()),
  ('ventas.ver', 'Ver ventas', 'ventas', 'Consultar ventas y su detalle', NOW()),
  ('ventas.crear', 'Crear ventas', 'ventas', 'Registrar ventas y descontar inventario', NOW()),
  ('ventas.anular', 'Anular ventas', 'ventas', 'Anular ventas con reversión de inventario', NOW());

INSERT IGNORE INTO `rol_permisos` (`rol_id`, `permiso_id`, `fecha_asignacion`)
SELECT 1, p.id, NOW()
FROM `permisos` p
WHERE p.codigo IN ('recetas.ver', 'recetas.crear', 'recetas.editar', 'ventas.ver', 'ventas.crear', 'ventas.anular');

INSERT IGNORE INTO `rol_permisos` (`rol_id`, `permiso_id`, `fecha_asignacion`)
SELECT 2, p.id, NOW()
FROM `permisos` p
WHERE p.codigo IN ('recetas.ver', 'recetas.crear', 'recetas.editar', 'ventas.ver', 'ventas.crear', 'ventas.anular');
