/**
 * backend/controllers/dashboard.controller.js
 * KPIs reales desde la base de datos.
 */
const { query } = require('../lib/db');

/** GET /api/dashboard/stats */
const obtenerStats = async (_req, res, next) => {
  try {
    // Total de productos activos
    const [{ total_productos }] = await query(
      "SELECT COUNT(*) AS total_productos FROM productos WHERE estado = 1"
    );

    // Productos con stock bajo (cantidad <= stock_minimo, pero cantidad > 0)
    const [{ stock_bajo }] = await query(
      "SELECT COUNT(*) AS stock_bajo FROM productos WHERE estado = 1 AND cantidad > 0 AND cantidad <= stock_minimo"
    );

    // Productos agotados
    const [{ agotados }] = await query(
      "SELECT COUNT(*) AS agotados FROM productos WHERE estado = 1 AND cantidad <= 0"
    );

    // Valor total del inventario (cantidad * precio_venta)
    const [{ valor_inventario }] = await query(
      "SELECT COALESCE(SUM(cantidad * precio_venta), 0) AS valor_inventario FROM productos WHERE estado = 1"
    );

    // Movimientos del mes en curso
    const [{ movimientos_mes }] = await query(
      `SELECT COUNT(*) AS movimientos_mes
       FROM   movimientos_inventario
       WHERE  YEAR(fecha_movimiento)  = YEAR(NOW())
         AND  MONTH(fecha_movimiento) = MONTH(NOW())`
    );

    // Compras del mes en curso
    const [{ compras_mes }] = await query(
      `SELECT COUNT(*) AS compras_mes
       FROM   compras
       WHERE  YEAR(fecha_compra)  = YEAR(NOW())
         AND  MONTH(fecha_compra) = MONTH(NOW())`
    );

    // Últimos 5 movimientos
    const ultimosMovimientos = await query(`
      SELECT m.id, m.tipo, m.cantidad, m.cantidad_nueva, m.motivo,
             m.fecha_movimiento,
             p.nombre AS producto_nombre,
             CONCAT(u.nombre,' ',IFNULL(u.apellido,'')) AS usuario_nombre
      FROM   movimientos_inventario m
      JOIN   productos p ON p.id = m.producto_id
      JOIN   usuarios  u ON u.id = m.usuario_id
      ORDER  BY m.fecha_movimiento DESC
      LIMIT  5
    `);

    // Alertas pendientes
    const alertasPendientes = await query(`
      SELECT a.id, a.tipo, a.mensaje, a.fecha_alerta,
             p.nombre AS producto_nombre,
             p.cantidad AS stock_actual, p.stock_minimo
      FROM   alertas_inventario a
      JOIN   productos p ON p.id = a.producto_id
      WHERE  a.estado = 'PENDIENTE'
      ORDER  BY a.fecha_alerta DESC
      LIMIT  10
    `);

    res.json({
      total_productos:    Number(total_productos),
      stock_bajo:         Number(stock_bajo),
      agotados:           Number(agotados),
      valor_inventario:   Number(valor_inventario),
      movimientos_mes:    Number(movimientos_mes),
      compras_mes:        Number(compras_mes),
      ultimos_movimientos: ultimosMovimientos,
      alertas_pendientes:  alertasPendientes,
    });
  } catch (err) { next(err); }
};

module.exports = { obtenerStats };
