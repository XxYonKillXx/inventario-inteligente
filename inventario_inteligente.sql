-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-10-2026 a las 17:57:29
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `inventario_inteligente`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alertas_inventario`
--

CREATE TABLE `alertas_inventario` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `tipo` enum('STOCK_BAJO','STOCK_AGOTADO','VENCIMIENTO') NOT NULL,
  `mensaje` varchar(255) NOT NULL,
  `estado` enum('PENDIENTE','ATENDIDA') NOT NULL DEFAULT 'PENDIENTE',
  `fecha_alerta` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_atencion` datetime DEFAULT NULL,
  `usuario_atencion_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alertas_inventario`
--

INSERT INTO `alertas_inventario` (`id`, `producto_id`, `tipo`, `mensaje`, `estado`, `fecha_alerta`, `fecha_atencion`, `usuario_atencion_id`) VALUES
(1, 8, 'STOCK_AGOTADO', 'Las servilletas están por debajo del stock mínimo de 5 paquetes', 'PENDIENTE', '2026-10-26 14:00:00', NULL, NULL),
(2, 6, 'VENCIMIENTO', 'El pollo fresco está próximo a vencer. Se recomienda revisar el lote', 'PENDIENTE', '2026-10-27 13:00:00', NULL, NULL),
(3, 7, 'STOCK_BAJO', 'La carne de res presenta existencias cercanas al mínimo establecido', 'PENDIENTE', '2026-10-27 14:00:00', NULL, NULL),
(4, 15, 'VENCIMIENTO', 'La mojarra fresca requiere revisión de fecha de vencimiento', 'PENDIENTE', '2026-10-27 14:30:00', NULL, NULL),
(5, 3, 'STOCK_BAJO', 'Verificar las existencias de papa antes del siguiente servicio', 'ATENDIDA', '2026-10-20 16:00:00', '2026-10-20 11:30:00', 1),
(6, 11, 'STOCK_BAJO', 'La lechuga se encuentra cerca del mínimo definido', 'PENDIENTE', '2026-10-25 15:00:00', NULL, NULL),
(7, 18, 'STOCK_BAJO', 'Revisar el inventario de costillas antes del próximo fin de semana', 'PENDIENTE', '2026-10-27 15:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `estado`, `fecha_creacion`) VALUES
(1, 'Otros insumos de restaurante', 'Insumos generales del restaurante', 1, '2026-10-01 13:00:00'),
(2, 'Carnes y proteínas', 'Pollo, res, cerdo y pescado', 1, '2026-10-01 13:05:00'),
(3, 'Frutas y verduras', 'Frutas, verduras y tubérculos', 1, '2026-10-01 13:10:00'),
(4, 'Granos y cereales', 'Arroz, fríjoles, lentejas y cereales', 1, '2026-10-01 13:15:00'),
(5, 'Lácteos y huevos', 'Leche, quesos, crema y huevos', 1, '2026-10-01 13:20:00'),
(6, 'Aceites y condimentos', 'Aceites, salsas, sal y especias', 1, '2026-10-01 13:25:00'),
(7, 'Bebidas sin alcohol', 'Agua, gaseosas y jugos', 1, '2026-10-01 13:30:00'),
(8, 'Bebidas alcohólicas', 'Vinos y bebidas para el bar', 1, '2026-10-01 13:35:00'),
(9, 'Panadería y harinas', 'Pan, harinas y productos de panadería', 1, '2026-10-01 13:40:00'),
(10, 'Productos congelados', 'Alimentos congelados y pulpas', 1, '2026-10-01 13:45:00'),
(11, 'Aseo y limpieza', 'Productos de limpieza y desinfección', 1, '2026-10-01 13:50:00'),
(12, 'Desechables y empaques', 'Servilletas, vasos y empaques', 1, '2026-10-01 13:55:00'),
(13, 'Otros insumos', 'Materiales auxiliares de cocina', 1, '2026-10-01 14:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `id` int(11) NOT NULL,
  `numero_compra` varchar(50) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_compra` datetime NOT NULL DEFAULT current_timestamp(),
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('PENDIENTE','RECIBIDA','ANULADA') NOT NULL DEFAULT 'PENDIENTE',
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `numero_compra`, `proveedor_id`, `usuario_id`, `fecha_compra`, `subtotal`, `impuestos`, `total`, `estado`, `observaciones`, `fecha_creacion`) VALUES
(1, 'COMP-2026-001', 1, 1, '2026-10-03 08:00:00', 70000.00, 0.00, 70000.00, 'RECIBIDA', 'Abastecimiento de arroz', '2026-10-03 13:00:00'),
(2, 'COMP-2026-002', 2, 1, '2026-10-06 09:15:00', 60000.00, 0.00, 60000.00, 'RECIBIDA', 'Compra de verduras y tubérculos', '2026-10-06 14:15:00'),
(3, 'COMP-2026-003', 3, 1, '2026-10-10 07:30:00', 132000.00, 0.00, 132000.00, 'RECIBIDA', 'Compra de carnes para fin de semana', '2026-10-10 12:30:00'),
(4, 'COMP-2026-004', 4, 2, '2026-10-15 10:00:00', 112000.00, 0.00, 112000.00, 'RECIBIDA', 'Reposición de bebidas y vinos', '2026-10-15 15:00:00'),
(5, 'COMP-2026-005', 5, 1, '2026-10-18 08:30:00', 45000.00, 0.00, 45000.00, 'RECIBIDA', 'Insumos de aseo y servicio', '2026-10-18 13:30:00'),
(6, 'COMP-2026-006', 3, 2, '2026-10-22 07:45:00', 160000.00, 0.00, 160000.00, 'RECIBIDA', 'Abastecimiento para alta demanda', '2026-10-22 12:45:00'),
(7, 'COMP-2026-007', 2, 1, '2026-10-25 09:00:00', 52500.00, 0.00, 52500.00, 'RECIBIDA', 'Reposición de frutas y verduras', '2026-10-25 14:00:00'),
(8, 'COMP-2026-008', 4, 2, '2026-10-27 11:00:00', 90000.00, 0.00, 90000.00, 'PENDIENTE', 'Pedido de bebidas pendiente de recepción', '2026-10-27 16:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_compras`
--

CREATE TABLE `detalle_compras` (
  `id` int(11) NOT NULL,
  `compra_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_compras`
--

INSERT INTO `detalle_compras` (`id`, `compra_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, 1, 20.000, 3500.00, 70000.00),
(2, 2, 3, 12.000, 2500.00, 30000.00),
(3, 2, 12, 5.000, 3500.00, 17500.00),
(4, 2, 17, 3.125, 4000.00, 12500.00),
(5, 3, 6, 8.000, 11000.00, 88000.00),
(6, 3, 7, 2.000, 22000.00, 44000.00),
(7, 4, 26, 2.000, 28000.00, 56000.00),
(8, 4, 27, 16.000, 2500.00, 40000.00),
(9, 4, 5, 10.000, 1600.00, 16000.00),
(10, 5, 8, 10.000, 4500.00, 45000.00),
(11, 6, 18, 5.000, 20000.00, 100000.00),
(12, 6, 15, 2.500, 24000.00, 60000.00),
(13, 7, 3, 10.000, 2500.00, 25000.00),
(14, 7, 11, 5.000, 4000.00, 20000.00),
(15, 7, 12, 2.143, 3500.00, 7500.00),
(16, 8, 26, 2.000, 28000.00, 56000.00),
(17, 8, 27, 12.000, 2500.00, 30000.00),
(18, 8, 5, 2.500, 1600.00, 4000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_receta`
--

CREATE TABLE `detalle_receta` (
  `id` int(11) NOT NULL,
  `receta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_receta`
--

INSERT INTO `detalle_receta` (`id`, `receta_id`, `producto_id`, `cantidad`, `observaciones`) VALUES
(1, 1, 9, 1.000, 'Pan de hamburguesa'),
(2, 1, 7, 0.150, 'Carne por porción'),
(3, 1, 10, 1.000, 'Una tajada de queso'),
(4, 1, 11, 0.050, 'Lechuga'),
(5, 1, 12, 0.080, 'Tomate'),
(6, 1, 13, 0.020, 'Salsa de tomate'),
(7, 1, 14, 0.020, 'Mayonesa'),
(8, 1, 3, 0.200, 'Papa para acompañamiento'),
(9, 2, 15, 0.500, 'Mojarra por porción'),
(10, 2, 16, 1.000, 'Plátano de acompañamiento'),
(11, 2, 17, 0.100, 'Limón'),
(12, 2, 2, 0.100, 'Aceite utilizado en preparación'),
(13, 2, 22, 0.010, 'Sal'),
(14, 3, 18, 0.500, 'Costilla por porción'),
(15, 3, 19, 0.080, 'Salsa BBQ'),
(16, 3, 22, 0.010, 'Sal'),
(17, 3, 23, 0.010, 'Condimentos'),
(18, 3, 3, 0.200, 'Papa de acompañamiento'),
(19, 4, 20, 1.000, 'Salchicha'),
(20, 4, 21, 1.000, 'Pan'),
(21, 4, 13, 0.020, 'Salsa de tomate'),
(22, 4, 14, 0.020, 'Mayonesa'),
(23, 5, 3, 0.300, 'Papa'),
(24, 5, 20, 2.000, 'Salchichas'),
(25, 5, 13, 0.030, 'Salsa de tomate'),
(26, 5, 14, 0.030, 'Mayonesa'),
(27, 6, 25, 0.300, 'Jugo base por vaso'),
(28, 7, 21, 2.000, 'Pan tajado'),
(29, 7, 24, 0.080, 'Queso mozzarella'),
(30, 7, 12, 0.050, 'Tomate'),
(31, 7, 11, 0.030, 'Lechuga');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_ventas`
--

CREATE TABLE `detalle_ventas` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `receta_id` int(11) NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `nombre_receta` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_ventas`
--

INSERT INTO `detalle_ventas` (`id`, `venta_id`, `receta_id`, `cantidad`, `precio_unitario`, `subtotal`, `nombre_receta`) VALUES
(1, 1, 1, 2.000, 25000.00, 50000.00, 'Hamburguesa Balcón'),
(2, 1, 6, 1.000, 8000.00, 8000.00, 'Jugo natural de naranja'),
(3, 2, 2, 1.000, 35000.00, 35000.00, 'Mojarra frita'),
(4, 2, 1, 2.000, 25000.00, 50000.00, 'Hamburguesa Balcón'),
(5, 3, 2, 2.000, 35000.00, 70000.00, 'Mojarra frita'),
(6, 4, 3, 2.000, 38000.00, 76000.00, 'Costillas BBQ'),
(7, 5, 1, 2.000, 25000.00, 50000.00, 'Hamburguesa Balcón'),
(8, 5, 2, 1.000, 35000.00, 35000.00, 'Mojarra frita'),
(9, 5, 6, 2.000, 8000.00, 16000.00, 'Jugo natural de naranja'),
(10, 6, 2, 3.000, 35000.00, 105000.00, 'Mojarra frita'),
(11, 7, 4, 2.000, 14000.00, 28000.00, 'Perro caliente'),
(12, 7, 5, 1.000, 18000.00, 18000.00, 'Salchipapas'),
(13, 8, 3, 2.000, 38000.00, 76000.00, 'Costillas BBQ');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_inventario`
--

CREATE TABLE `movimientos_inventario` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `compra_id` int(11) DEFAULT NULL,
  `venta_id` int(11) DEFAULT NULL,
  `tipo` enum('ENTRADA','SALIDA','AJUSTE') NOT NULL,
  `cantidad` decimal(12,3) NOT NULL,
  `cantidad_anterior` decimal(12,3) NOT NULL,
  `cantidad_nueva` decimal(12,3) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `fecha_movimiento` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movimientos_inventario`
--

INSERT INTO `movimientos_inventario` (`id`, `producto_id`, `usuario_id`, `compra_id`, `venta_id`, `tipo`, `cantidad`, `cantidad_anterior`, `cantidad_nueva`, `motivo`, `fecha_movimiento`) VALUES
(1, 1, 1, NULL, NULL, 'ENTRADA', 25.000, 20.000, 45.000, 'Inventario inicial de arroz', '2026-10-02 08:00:00'),
(2, 1, 1, 1, NULL, 'ENTRADA', 20.000, 25.000, 45.000, 'Recepción de compra de arroz', '2026-10-03 08:30:00'),
(3, 1, 2, NULL, NULL, 'SALIDA', 4.000, 45.000, 41.000, 'Consumo de cocina', '2026-10-04 13:30:00'),
(4, 3, 1, NULL, NULL, 'ENTRADA', 26.000, 12.000, 38.000, 'Reposición de papa', '2026-10-05 08:00:00'),
(5, 3, 1, 2, NULL, 'ENTRADA', 12.000, 26.000, 38.000, 'Recepción de compra de papa', '2026-10-06 09:45:00'),
(6, 3, 2, NULL, NULL, 'SALIDA', 5.000, 38.000, 33.000, 'Preparación de acompañamientos', '2026-10-10 14:00:00'),
(7, 6, 1, 3, NULL, 'ENTRADA', 8.000, 4.000, 12.000, 'Recepción de pollo fresco', '2026-10-10 08:00:00'),
(8, 7, 1, 3, NULL, 'ENTRADA', 2.000, 7.000, 9.000, 'Recepción de carne de res', '2026-10-10 08:10:00'),
(9, 4, 2, NULL, NULL, 'SALIDA', 8.000, 65.000, 57.000, 'Venta de bebidas', '2026-10-11 15:30:00'),
(10, 26, 2, 4, NULL, 'ENTRADA', 2.000, 12.000, 14.000, 'Recepción de vino', '2026-10-15 10:30:00'),
(11, 27, 2, 4, NULL, 'ENTRADA', 16.000, 29.000, 45.000, 'Recepción de cerveza', '2026-10-15 10:35:00'),
(12, 8, 1, 5, NULL, 'ENTRADA', 10.000, 3.000, 13.000, 'Reposición de servilletas', '2026-10-18 09:00:00'),
(13, 8, 2, NULL, NULL, 'SALIDA', 5.000, 13.000, 8.000, 'Consumo en servicio de mesa', '2026-10-19 14:00:00'),
(14, 18, 1, 6, NULL, 'ENTRADA', 5.000, 5.000, 10.000, 'Recepción de costillas', '2026-10-22 08:00:00'),
(15, 15, 1, 6, NULL, 'ENTRADA', 2.500, 12.500, 15.000, 'Recepción de mojarra', '2026-10-22 08:10:00'),
(16, 11, 1, 7, NULL, 'ENTRADA', 5.000, -1.000, 4.000, 'Reposición de lechuga', '2026-10-25 09:30:00'),
(17, 12, 2, NULL, NULL, 'SALIDA', 2.000, 9.000, 7.000, 'Consumo en preparación de platos', '2026-10-25 13:00:00'),
(18, 15, 2, NULL, 6, 'SALIDA', 1.500, 15.000, 13.500, 'Consumo asociado a ventas de mojarra', '2026-10-25 14:45:00'),
(19, 3, 2, NULL, 7, 'SALIDA', 0.600, 38.000, 37.400, 'Consumo asociado a salchipapas', '2026-10-26 16:20:00'),
(20, 18, 2, NULL, 8, 'SALIDA', 1.000, 10.000, 9.000, 'Consumo asociado a venta de costillas', '2026-10-27 20:00:00'),
(21, 5, 1, NULL, NULL, 'AJUSTE', 2.000, 48.000, 50.000, 'Ajuste de conteo físico', '2026-10-27 17:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `permisos`
--

INSERT INTO `permisos` (`id`, `codigo`, `nombre`, `modulo`, `descripcion`, `fecha_creacion`) VALUES
(1, 'dashboard.ver', 'Ver dashboard', 'dashboard', 'Consultar indicadores generales', '2026-10-23 14:27:20'),
(2, 'productos.ver', 'Ver productos', 'productos', 'Consultar el catálogo de productos', '2026-10-23 14:27:20'),
(3, 'productos.crear', 'Crear productos', 'productos', 'Registrar nuevos productos', '2026-10-23 14:27:20'),
(4, 'productos.editar', 'Editar productos', 'productos', 'Modificar productos existentes', '2026-10-23 14:27:20'),
(5, 'productos.eliminar', 'Eliminar productos', 'productos', 'Eliminar o desactivar productos', '2026-10-23 14:27:20'),
(6, 'categorias.ver', 'Ver categorías', 'categorias', 'Consultar categorías', '2026-10-23 14:27:20'),
(7, 'categorias.crear', 'Crear categorías', 'categorias', 'Registrar categorías', '2026-10-23 14:27:20'),
(8, 'categorias.editar', 'Editar categorías', 'categorias', 'Modificar categorías', '2026-10-23 14:27:20'),
(9, 'categorias.eliminar', 'Eliminar categorías', 'categorias', 'Eliminar categorías no utilizadas', '2026-10-23 14:27:20'),
(10, 'proveedores.ver', 'Ver proveedores', 'proveedores', 'Consultar proveedores', '2026-10-23 14:27:20'),
(11, 'proveedores.crear', 'Crear proveedores', 'proveedores', 'Registrar proveedores', '2026-10-23 14:27:20'),
(12, 'proveedores.editar', 'Editar proveedores', 'proveedores', 'Actualizar información de proveedores', '2026-10-23 14:27:20'),
(13, 'proveedores.eliminar', 'Eliminar proveedores', 'proveedores', 'Desactivar proveedores', '2026-10-23 14:27:20'),
(14, 'compras.ver', 'Ver compras', 'compras', 'Consultar compras y sus detalles', '2026-10-23 14:27:20'),
(15, 'compras.crear', 'Registrar compras', 'compras', 'Registrar compras recibidas o pendientes', '2026-10-23 14:27:20'),
(16, 'compras.editar', 'Editar compras', 'compras', 'Modificar compras según su estado', '2026-10-23 14:27:20'),
(17, 'compras.anular', 'Anular compras', 'compras', 'Anular compras siguiendo las reglas del sistema', '2026-10-23 14:27:20'),
(18, 'inventario.ver', 'Ver inventario', 'inventario', 'Consultar existencias', '2026-10-23 14:27:20'),
(19, 'inventario.entrada', 'Registrar entradas', 'inventario', 'Registrar entradas de inventario', '2026-10-23 14:27:20'),
(20, 'inventario.salida', 'Registrar salidas', 'inventario', 'Registrar salidas de inventario', '2026-10-23 14:27:20'),
(21, 'inventario.ajustar', 'Ajustar inventario', 'inventario', 'Realizar ajustes con motivo y trazabilidad', '2026-10-23 14:27:20'),
(22, 'inventario.historial', 'Ver movimientos', 'inventario', 'Consultar el historial de movimientos', '2026-10-23 14:27:20'),
(23, 'alertas.ver', 'Ver alertas', 'alertas', 'Consultar alertas de inventario', '2026-10-23 14:27:20'),
(24, 'alertas.gestionar', 'Gestionar alertas', 'alertas', 'Marcar alertas como atendidas', '2026-10-23 14:27:20'),
(25, 'reportes.ver', 'Ver reportes', 'reportes', 'Consultar reportes del sistema', '2026-10-23 14:27:20'),
(26, 'reportes.exportar', 'Exportar reportes', 'reportes', 'Exportar información autorizada', '2026-10-23 14:27:20'),
(27, 'usuarios.ver', 'Ver usuarios', 'usuarios', 'Consultar usuarios registrados', '2026-10-23 14:27:20'),
(28, 'usuarios.crear', 'Crear usuarios', 'usuarios', 'Registrar usuarios', '2026-10-23 14:27:20'),
(29, 'usuarios.editar', 'Editar usuarios', 'usuarios', 'Modificar usuarios y su estado', '2026-10-23 14:27:20'),
(30, 'usuarios.desactivar', 'Desactivar usuarios', 'usuarios', 'Desactivar cuentas de usuario', '2026-10-23 14:27:20'),
(31, 'roles.ver', 'Ver roles', 'roles', 'Consultar roles', '2026-10-23 14:27:20'),
(32, 'roles.gestionar', 'Gestionar roles', 'roles', 'Crear, editar o desactivar roles', '2026-10-23 14:27:20'),
(33, 'permisos.ver', 'Ver permisos', 'permisos', 'Consultar el catálogo de permisos', '2026-10-23 14:27:20'),
(34, 'permisos.asignar', 'Asignar permisos', 'permisos', 'Asignar y retirar permisos a los roles', '2026-10-23 14:27:20'),
(35, 'recetas.ver', 'Ver recetas', 'recetas', 'Consultar las recetas registradas', '2026-10-25 18:12:14'),
(36, 'recetas.crear', 'Crear recetas', 'recetas', 'Registrar nuevas recetas y sus ingredientes', '2026-10-25 18:12:14'),
(37, 'recetas.editar', 'Editar recetas', 'recetas', 'Modificar recetas e ingredientes existentes', '2026-10-25 18:12:14'),
(38, 'recetas.eliminar', 'Desactivar recetas', 'recetas', 'Desactivar recetas que ya no se utilizan', '2026-10-25 18:12:14'),
(39, 'ventas.ver', 'Ver ventas', 'ventas', 'Consultar el historial y detalle de ventas', '2026-10-25 18:12:15'),
(40, 'ventas.crear', 'Registrar ventas', 'ventas', 'Registrar ventas y descontar ingredientes del inventario', '2026-10-25 18:12:15'),
(41, 'ventas.anular', 'Anular ventas', 'ventas', 'Anular ventas y revertir sus movimientos de inventario', '2026-10-25 18:12:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria_id` int(11) NOT NULL,
  `unidad_medida` varchar(30) NOT NULL DEFAULT 'unidad',
  `precio_compra` decimal(12,2) NOT NULL DEFAULT 0.00,
  `precio_venta` decimal(12,2) NOT NULL DEFAULT 0.00,
  `cantidad` decimal(12,3) NOT NULL DEFAULT 0.000,
  `stock_minimo` decimal(12,3) NOT NULL DEFAULT 0.000,
  `fecha_vencimiento` date DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `codigo`, `nombre`, `descripcion`, `categoria_id`, `unidad_medida`, `precio_compra`, `precio_venta`, `cantidad`, `stock_minimo`, `fecha_vencimiento`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'PROD-001', 'Arroz blanco', 'Arroz para acompañamientos y platos', 4, 'kg', 3500.00, 5000.00, 45.000, 10.000, NULL, 1, '2026-10-01 15:00:00', '2026-10-20 13:00:00'),
(2, 'PROD-002', 'Aceite vegetal', 'Aceite para preparación de alimentos', 6, 'litro', 8000.00, 9500.00, 22.000, 5.000, '2027-06-30', 1, '2026-10-01 15:05:00', '2026-10-21 13:00:00'),
(3, 'PROD-003', 'Papa', 'Papa fresca para acompañamientos', 3, 'kg', 2500.00, 4000.00, 38.000, 8.000, NULL, 1, '2026-10-01 15:10:00', '2026-10-22 13:00:00'),
(4, 'PROD-004', 'Gaseosa personal', 'Bebida gaseosa individual', 7, 'unidad', 2000.00, 4000.00, 65.000, 15.000, '2027-04-30', 1, '2026-10-01 15:15:00', '2026-10-23 13:00:00'),
(5, 'PROD-005', 'Agua embotellada', 'Agua para venta a clientes', 7, 'unidad', 1200.00, 3000.00, 48.000, 12.000, '2027-05-30', 1, '2026-10-01 15:20:00', '2026-10-23 13:00:00'),
(6, 'PROD-006', 'Pollo fresco', 'Pollo para platos y comidas rápidas', 2, 'kg', 11000.00, 16000.00, 12.000, 5.000, '2026-11-02', 1, '2026-10-01 15:25:00', '2026-10-25 13:00:00'),
(7, 'PROD-007', 'Carne de res', 'Carne para hamburguesas y platos', 2, 'kg', 22000.00, 30000.00, 9.000, 4.000, '2026-11-01', 1, '2026-10-01 15:30:00', '2026-10-25 13:00:00'),
(8, 'PROD-008', 'Servilletas', 'Servilletas para servicio de mesa', 12, 'paquete', 4500.00, 6000.00, 3.000, 5.000, NULL, 1, '2026-10-01 15:35:00', '2026-10-26 13:00:00'),
(9, 'PROD-009', 'Pan de hamburguesa', 'Pan para hamburguesas', 9, 'unidad', 1200.00, 1800.00, 60.000, 15.000, '2026-11-05', 1, '2026-10-01 15:40:00', '2026-10-25 13:00:00'),
(10, 'PROD-010', 'Queso tajado', 'Queso para hamburguesas', 5, 'unidad', 900.00, 1500.00, 40.000, 10.000, '2026-11-03', 1, '2026-10-01 15:45:00', '2026-10-24 13:00:00'),
(11, 'PROD-011', 'Lechuga', 'Lechuga fresca para hamburguesas', 3, 'kg', 4000.00, 6000.00, 4.000, 1.000, '2026-10-31', 1, '2026-10-01 15:50:00', '2026-10-25 13:00:00'),
(12, 'PROD-012', 'Tomate', 'Tomate para preparación de platos', 3, 'kg', 3500.00, 5000.00, 7.000, 2.000, '2026-11-01', 1, '2026-10-01 15:55:00', '2026-10-25 13:00:00'),
(13, 'PROD-013', 'Salsa de tomate', 'Salsa para comidas rápidas', 6, 'kg', 10000.00, 12000.00, 5.000, 1.000, '2027-02-28', 1, '2026-10-01 16:00:00', '2026-10-23 13:00:00'),
(14, 'PROD-014', 'Mayonesa', 'Mayonesa para hamburguesas', 6, 'kg', 9000.00, 13000.00, 4.000, 1.000, '2027-01-30', 1, '2026-10-01 16:05:00', '2026-10-23 13:00:00'),
(15, 'PROD-015', 'Mojarra fresca', 'Pescado para mojarra frita', 2, 'kg', 24000.00, 40000.00, 15.000, 5.000, '2026-10-31', 1, '2026-10-01 16:10:00', '2026-10-26 13:00:00'),
(16, 'PROD-016', 'Plátano verde', 'Acompañamiento para platos de pescado', 3, 'unidad', 1500.00, 2500.00, 35.000, 10.000, NULL, 1, '2026-10-01 16:15:00', '2026-10-24 13:00:00'),
(17, 'PROD-017', 'Limón', 'Limón para pescados y bebidas', 3, 'kg', 4000.00, 5000.00, 6.000, 2.000, '2026-11-02', 1, '2026-10-01 16:20:00', '2026-10-25 13:00:00'),
(18, 'PROD-018', 'Costilla de cerdo', 'Costilla para platos principales', 2, 'kg', 20000.00, 32000.00, 10.000, 4.000, '2026-11-02', 1, '2026-10-01 16:25:00', '2026-10-25 13:00:00'),
(19, 'PROD-019', 'Salsa BBQ', 'Salsa para costillas', 6, 'kg', 12000.00, 18000.00, 3.000, 1.000, '2027-02-28', 1, '2026-10-01 16:30:00', '2026-10-24 13:00:00'),
(20, 'PROD-020', 'Salchicha', 'Salchichas para comidas rápidas', 2, 'unidad', 1000.00, 1800.00, 55.000, 15.000, '2026-11-15', 1, '2026-10-01 16:35:00', '2026-10-25 13:00:00'),
(21, 'PROD-021', 'Pan tajado', 'Pan para sándwiches', 9, 'unidad', 300.00, 500.00, 70.000, 20.000, '2026-11-04', 1, '2026-10-01 16:40:00', '2026-10-24 13:00:00'),
(22, 'PROD-022', 'Sal', 'Sal para condimentar alimentos', 6, 'kg', 2000.00, 3000.00, 4.000, 1.000, NULL, 1, '2026-10-01 16:45:00', '2026-10-23 13:00:00'),
(23, 'PROD-023', 'Condimentos', 'Mezcla de condimentos para cocina', 6, 'kg', 12000.00, 18000.00, 2.000, 0.500, NULL, 1, '2026-10-01 16:50:00', '2026-10-23 13:00:00'),
(24, 'PROD-024', 'Queso mozzarella', 'Queso para preparaciones calientes', 5, 'kg', 18000.00, 25000.00, 6.000, 2.000, '2026-11-05', 1, '2026-10-01 16:55:00', '2026-10-25 13:00:00'),
(25, 'PROD-025', 'Jugo de naranja', 'Jugo para venta por vaso', 7, 'litro', 5000.00, 8000.00, 12.000, 4.000, '2026-11-03', 1, '2026-10-01 17:00:00', '2026-10-26 13:00:00'),
(26, 'PROD-026', 'Vino tinto', 'Vino para el servicio de bar', 8, 'botella', 28000.00, 45000.00, 14.000, 4.000, '2028-10-01', 1, '2026-10-01 17:05:00', '2026-10-26 13:00:00'),
(27, 'PROD-027', 'Cerveza', 'Bebida para servicio de bar', 8, 'unidad', 2500.00, 5000.00, 45.000, 12.000, '2027-08-01', 1, '2026-10-01 17:10:00', '2026-10-26 13:00:00'),
(28, 'PROD-028', 'Vasos desechables', 'Vasos para bebidas', 12, 'paquete', 6000.00, 8000.00, 12.000, 4.000, NULL, 1, '2026-10-01 17:15:00', '2026-10-24 13:00:00'),
(29, 'PROD-029', 'Detergente', 'Producto para limpieza de cocina', 11, 'litro', 7000.00, 9000.00, 8.000, 2.000, '2028-01-01', 1, '2026-10-01 17:20:00', '2026-10-24 13:00:00'),
(30, 'PROD-030', 'Bolsas para domicilios', 'Bolsas para empacar pedidos', 12, 'paquete', 8000.00, 11000.00, 9.000, 3.000, NULL, 1, '2026-10-01 17:25:00', '2026-10-25 13:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `nit` varchar(30) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `nit`, `telefono`, `correo`, `direccion`, `contacto`, `observaciones`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Distribuciones El Campesino', '900123456-1', '3105551001', 'ventas@elcampesino.test', 'Bogotá, Colombia', 'Carlos Méndez', 'Proveedor de granos y productos secos', 1, '2026-10-01 14:00:00', '2026-10-01 14:00:00'),
(2, 'Frutas y Verduras La Huerta', '900234567-2', '3105551002', 'pedidos@lahuerta.test', 'Bogotá, Colombia', 'María Torres', 'Proveedor de frutas, verduras y tubérculos', 1, '2026-10-01 14:05:00', '2026-10-01 14:05:00'),
(3, 'Carnes Selectas del Norte', '900345678-3', '3105551003', 'comercial@carnesnorte.test', 'Bogotá, Colombia', 'Andrés Gómez', 'Proveedor de carnes y proteínas', 1, '2026-10-01 14:10:00', '2026-10-01 14:10:00'),
(4, 'Bebidas y Licores Central', '900456789-4', '3105551004', 'ventas@bebidascentral.test', 'Bogotá, Colombia', 'Laura Ramírez', 'Proveedor de bebidas para restaurante y bar', 1, '2026-10-01 14:15:00', '2026-10-01 14:15:00'),
(5, 'Aseo y Empaques Express', '900567890-5', '3105551005', 'pedidos@aseoempaques.test', 'Bogotá, Colombia', 'Julián Castro', 'Proveedor de aseo y empaques', 1, '2026-10-01 14:20:00', '2026-10-01 14:20:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recetas`
--

CREATE TABLE `recetas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_venta` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('ACTIVA','INACTIVA') NOT NULL DEFAULT 'ACTIVA',
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recetas`
--

INSERT INTO `recetas` (`id`, `nombre`, `descripcion`, `precio_venta`, `estado`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Hamburguesa Balcón', 'Hamburguesa de la casa con papas y vegetales', 25000.00, 'ACTIVA', '2026-10-02 12:00:00', '2026-10-02 12:00:00'),
(2, 'Mojarra frita', 'Mojarra acompañada de plátano y limón', 35000.00, 'ACTIVA', '2026-10-02 12:10:00', '2026-10-02 12:10:00'),
(3, 'Costillas BBQ', 'Costillas de cerdo con salsa BBQ y acompañamiento', 38000.00, 'ACTIVA', '2026-10-02 12:20:00', '2026-10-28 11:35:26'),
(4, 'Perro caliente', 'Perro caliente con salsas', 14000.00, 'ACTIVA', '2026-10-02 12:30:00', '2026-10-02 12:30:00'),
(5, 'Salchipapas', 'Papas fritas con salchicha y salsas', 18000.00, 'ACTIVA', '2026-10-02 12:40:00', '2026-10-02 12:40:00'),
(6, 'Jugo natural de naranja', 'Jugo de naranja preparado para el cliente', 8000.00, 'ACTIVA', '2026-10-02 12:50:00', '2026-10-02 12:50:00'),
(7, 'Sándwich de la casa', 'Sándwich con pan, queso y vegetales', 16000.00, 'ACTIVA', '2026-10-02 13:00:00', '2026-10-02 13:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `estado`, `fecha_creacion`) VALUES
(1, 'administrador', 'Acceso completo al sistema', 1, '2026-10-23 14:16:15'),
(2, 'empleado', 'Acceso a las funciones operativas del inventario', 1, '2026-10-23 14:16:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol_permisos`
--

CREATE TABLE `rol_permisos` (
  `id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `permiso_id` int(11) NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol_permisos`
--

INSERT INTO `rol_permisos` (`id`, `rol_id`, `permiso_id`, `fecha_asignacion`) VALUES
(1, 1, 24, '2026-10-23 14:28:04'),
(2, 1, 23, '2026-10-23 14:28:04'),
(3, 1, 7, '2026-10-23 14:28:04'),
(4, 1, 8, '2026-10-23 14:28:04'),
(5, 1, 9, '2026-10-23 14:28:04'),
(6, 1, 6, '2026-10-23 14:28:04'),
(7, 1, 17, '2026-10-23 14:28:04'),
(8, 1, 15, '2026-10-23 14:28:04'),
(9, 1, 16, '2026-10-23 14:28:04'),
(10, 1, 14, '2026-10-23 14:28:04'),
(11, 1, 1, '2026-10-23 14:28:04'),
(12, 1, 21, '2026-10-23 14:28:04'),
(13, 1, 19, '2026-10-23 14:28:04'),
(14, 1, 22, '2026-10-23 14:28:04'),
(15, 1, 20, '2026-10-23 14:28:04'),
(16, 1, 18, '2026-10-23 14:28:04'),
(17, 1, 34, '2026-10-23 14:28:04'),
(18, 1, 33, '2026-10-23 14:28:04'),
(19, 1, 3, '2026-10-23 14:28:04'),
(20, 1, 4, '2026-10-23 14:28:04'),
(21, 1, 5, '2026-10-23 14:28:04'),
(22, 1, 2, '2026-10-23 14:28:04'),
(23, 1, 11, '2026-10-23 14:28:04'),
(24, 1, 12, '2026-10-23 14:28:04'),
(25, 1, 13, '2026-10-23 14:28:04'),
(26, 1, 10, '2026-10-23 14:28:04'),
(27, 1, 26, '2026-10-23 14:28:04'),
(28, 1, 25, '2026-10-23 14:28:04'),
(29, 1, 32, '2026-10-23 14:28:04'),
(30, 1, 31, '2026-10-23 14:28:04'),
(31, 1, 28, '2026-10-23 14:28:04'),
(32, 1, 30, '2026-10-23 14:28:04'),
(33, 1, 29, '2026-10-23 14:28:04'),
(34, 1, 27, '2026-10-23 14:28:04'),
(64, 2, 24, '2026-10-23 14:28:11'),
(65, 2, 23, '2026-10-23 14:28:11'),
(66, 2, 6, '2026-10-23 14:28:11'),
(67, 2, 15, '2026-10-23 14:28:11'),
(68, 2, 14, '2026-10-23 14:28:11'),
(69, 2, 1, '2026-10-23 14:28:11'),
(70, 2, 19, '2026-10-23 14:28:11'),
(71, 2, 22, '2026-10-23 14:28:11'),
(72, 2, 20, '2026-10-23 14:28:11'),
(73, 2, 18, '2026-10-23 14:28:11'),
(74, 2, 2, '2026-10-23 14:28:11'),
(75, 2, 10, '2026-10-23 14:28:11'),
(79, 1, 35, '2026-10-25 18:12:40'),
(80, 1, 36, '2026-10-25 18:12:40'),
(81, 1, 37, '2026-10-25 18:12:40'),
(82, 1, 38, '2026-10-25 18:12:40'),
(83, 1, 39, '2026-10-25 18:12:40'),
(84, 1, 40, '2026-10-25 18:12:40'),
(85, 1, 41, '2026-10-25 18:12:40'),
(86, 2, 35, '2026-10-25 18:12:54'),
(87, 2, 40, '2026-10-25 18:12:54'),
(88, 2, 39, '2026-10-25 18:12:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `correo` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `correo`, `password_hash`, `rol_id`, `estado`, `ultimo_acceso`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 'Administrador', 'Sistema', 'admin@inventario.com', '$2b$12$Sja1HBvvxaG7wz1NjuC9sOSadryjmAv5S1NSEv.ny22r.auIt58sK', 1, 1, '2026-10-23 12:06:14', '2026-10-23 14:57:24', '2026-10-23 17:06:14'),
(2, 'YON', 'HENAO', 'villajhon54@gmail.com', '$2b$12$Dtj6g46GMh9n0OrcyZY8TulGZAlSsim1OqPvndYr.BrAWaQcUzp3W', 1, 1, '2026-10-28 11:30:21', '2026-10-23 17:43:18', '2026-10-28 16:30:21'),
(3, 'Usuario de demostración', NULL, 'demo@inventario.test', '$2b$12$Y9JDV/7zMk6UL2.AmvDMLeKtsOB83AUrqG8K75iDUOUqjlDhYAG.6', 1, 1, '2026-10-28 11:33:12', '2026-10-28 16:33:03', '2026-10-28 16:33:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `numero_venta` varchar(30) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `fecha_venta` datetime NOT NULL DEFAULT current_timestamp(),
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `impuestos` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `estado` enum('CONFIRMADA','ANULADA') NOT NULL DEFAULT 'CONFIRMADA',
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `numero_venta`, `usuario_id`, `fecha_venta`, `subtotal`, `impuestos`, `total`, `estado`, `observaciones`) VALUES
(1, 'VT-202610-0001', 2, '2026-10-04 13:15:00', 60000.00, 0.00, 60000.00, 'CONFIRMADA', 'Servicio de almuerzo'),
(2, 'VT-202610-0002', 2, '2026-10-10 14:20:00', 95000.00, 0.00, 95000.00, 'CONFIRMADA', 'Venta de fin de semana'),
(3, 'VT-202610-0003', 1, '2026-10-11 15:00:00', 70000.00, 0.00, 70000.00, 'CONFIRMADA', 'Venta de platos principales'),
(4, 'VT-202610-0004', 2, '2026-10-17 18:30:00', 76000.00, 0.00, 76000.00, 'CONFIRMADA', 'Servicio de la tarde'),
(5, 'VT-202610-0005', 2, '2026-10-24 19:10:00', 114000.00, 0.00, 114000.00, 'CONFIRMADA', 'Venta de fin de semana'),
(6, 'VT-202610-0006', 1, '2026-10-25 14:45:00', 105000.00, 0.00, 105000.00, 'CONFIRMADA', 'Alta demanda de platos de pescado'),
(7, 'VT-202610-0007', 2, '2026-10-26 16:20:00', 50000.00, 0.00, 50000.00, 'CONFIRMADA', 'Venta de comidas rápidas'),
(8, 'VT-202610-0008', 1, '2026-10-27 20:00:00', 76000.00, 0.00, 76000.00, 'CONFIRMADA', 'Servicio de cena');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alertas_inventario`
--
ALTER TABLE `alertas_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_alertas_usuario` (`usuario_atencion_id`),
  ADD KEY `idx_alertas_estado` (`estado`),
  ADD KEY `idx_alertas_producto` (`producto_id`),
  ADD KEY `idx_alertas_fecha` (`fecha_alerta`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero_compra` (`numero_compra`),
  ADD KEY `fk_compras_proveedores` (`proveedor_id`),
  ADD KEY `fk_compras_usuarios` (`usuario_id`),
  ADD KEY `idx_compras_fecha` (`fecha_compra`),
  ADD KEY `idx_compras_estado` (`estado`);

--
-- Indices de la tabla `detalle_compras`
--
ALTER TABLE `detalle_compras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_detalle_compras_compra` (`compra_id`),
  ADD KEY `idx_detalle_compras_producto` (`producto_id`);

--
-- Indices de la tabla `detalle_receta`
--
ALTER TABLE `detalle_receta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_receta_producto` (`receta_id`,`producto_id`),
  ADD KEY `fk_detalle_receta_producto` (`producto_id`);

--
-- Indices de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_detalle_ventas_venta` (`venta_id`),
  ADD KEY `idx_detalle_ventas_receta` (`receta_id`);

--
-- Indices de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_movimientos_compra` (`compra_id`),
  ADD KEY `idx_movimientos_producto` (`producto_id`),
  ADD KEY `idx_movimientos_usuario` (`usuario_id`),
  ADD KEY `idx_movimientos_fecha` (`fecha_movimiento`),
  ADD KEY `idx_movimientos_tipo` (`tipo`),
  ADD KEY `idx_movimientos_venta` (`venta_id`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_productos_nombre` (`nombre`),
  ADD KEY `idx_productos_categoria` (`categoria_id`),
  ADD KEY `idx_productos_estado` (`estado`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nit` (`nit`);

--
-- Indices de la tabla `recetas`
--
ALTER TABLE `recetas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_recetas_nombre` (`nombre`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `rol_permisos`
--
ALTER TABLE `rol_permisos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_rol_permiso` (`rol_id`,`permiso_id`),
  ADD KEY `idx_rol_permisos_permiso` (`permiso_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `fk_usuarios_roles` (`rol_id`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ventas_numero` (`numero_venta`),
  ADD KEY `idx_ventas_usuario` (`usuario_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alertas_inventario`
--
ALTER TABLE `alertas_inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `detalle_compras`
--
ALTER TABLE `detalle_compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `detalle_receta`
--
ALTER TABLE `detalle_receta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `recetas`
--
ALTER TABLE `recetas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `rol_permisos`
--
ALTER TABLE `rol_permisos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alertas_inventario`
--
ALTER TABLE `alertas_inventario`
  ADD CONSTRAINT `fk_alertas_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_alertas_usuario` FOREIGN KEY (`usuario_atencion_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `compras`
--
ALTER TABLE `compras`
  ADD CONSTRAINT `fk_compras_proveedores` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_compras_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_compras`
--
ALTER TABLE `detalle_compras`
  ADD CONSTRAINT `fk_detalle_compras_compra` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalle_compras_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `detalle_receta`
--
ALTER TABLE `detalle_receta`
  ADD CONSTRAINT `fk_detalle_receta_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_detalle_receta_receta` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`);

--
-- Filtros para la tabla `detalle_ventas`
--
ALTER TABLE `detalle_ventas`
  ADD CONSTRAINT `fk_detalle_ventas_receta` FOREIGN KEY (`receta_id`) REFERENCES `recetas` (`id`),
  ADD CONSTRAINT `fk_detalle_ventas_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`);

--
-- Filtros para la tabla `movimientos_inventario`
--
ALTER TABLE `movimientos_inventario`
  ADD CONSTRAINT `fk_movimientos_compra` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimientos_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimientos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimientos_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categorias` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `rol_permisos`
--
ALTER TABLE `rol_permisos`
  ADD CONSTRAINT `fk_rol_permisos_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rol_permisos_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
