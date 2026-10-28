/**
 * backend/controllers/reportes.controller.js
 * Reportes reales con consultas SQL optimizadas.
 */
const { query } = require('../lib/db');

/** GET /api/reportes/productos — catálogo completo con estado */
const reporteProductos = async (_req, res, next) => {
  try {
    const rows = await query(`
      SELECT p.id, p.codigo, p.nombre,
             c.nombre AS categoria,
             p.unidad_medida, p.precio_compra, p.precio_venta,
             p.cantidad AS stock_actual, p.stock_minimo,
             p.fecha_vencimiento,
             CASE
               WHEN p.cantidad <= 0           THEN 'AGOTADO'
               WHEN p.cantidad <= p.stock_minimo THEN 'STOCK_BAJO'
               ELSE 'DISPONIBLE'
             END AS estado_stock,
             (p.cantidad * p.precio_venta) AS valor_total
      FROM   productos p
      JOIN   categorias c ON c.id = p.categoria_id
      WHERE  p.estado = 1
      ORDER  BY c.nombre, p.nombre
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

/** GET /api/reportes/existencias — inventario valorizado */
const reporteExistencias = async (_req, res, next) => {
  try {
    const rows = await query(`
      SELECT c.nombre AS categoria,
             COUNT(p.id)                              AS total_productos,
             SUM(p.cantidad)                          AS total_unidades,
             SUM(p.cantidad * p.precio_compra)        AS valor_costo,
             SUM(p.cantidad * p.precio_venta)         AS valor_venta,
             SUM(p.cantidad * (p.precio_venta - p.precio_compra)) AS ganancia_potencial,
             SUM(CASE WHEN p.cantidad <= 0 THEN 1 ELSE 0 END)               AS agotados,
             SUM(CASE WHEN p.cantidad > 0 AND p.cantidad <= p.stock_minimo THEN 1 ELSE 0 END) AS stock_bajo
      FROM   productos p
      JOIN   categorias c ON c.id = p.categoria_id
      WHERE  p.estado = 1
      GROUP  BY c.id, c.nombre
      ORDER  BY c.nombre
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

/** GET /api/reportes/movimientos?desde=&hasta= */
const reporteMovimientos = async (req, res, next) => {
  const { desde, hasta, tipo } = req.query;
  try {
    let sql = `
      SELECT m.id, m.tipo, m.cantidad, m.cantidad_anterior, m.cantidad_nueva,
             m.motivo, m.fecha_movimiento,
             p.codigo AS producto_codigo, p.nombre AS producto_nombre,
             c.nombre AS categoria,
             CONCAT(u.nombre,' ',IFNULL(u.apellido,'')) AS usuario
      FROM   movimientos_inventario m
      JOIN   productos  p ON p.id = m.producto_id
      JOIN   categorias c ON c.id = p.categoria_id
      JOIN   usuarios   u ON u.id = m.usuario_id
      WHERE  1=1
    `;
    const params = [];
    if (tipo)  { sql += ' AND m.tipo = ?';              params.push(tipo.toUpperCase()); }
    if (desde) { sql += ' AND m.fecha_movimiento >= ?'; params.push(desde + ' 00:00:00'); }
    if (hasta) { sql += ' AND m.fecha_movimiento <= ?'; params.push(hasta + ' 23:59:59'); }
    sql += ' ORDER BY m.fecha_movimiento DESC';

    res.json(await query(sql, params));
  } catch (err) { next(err); }
};

/** GET /api/reportes/compras?desde=&hasta= */
const reporteCompras = async (req, res, next) => {
  const { desde, hasta, estado } = req.query;
  try {
    let sql = `
      SELECT c.numero_compra, c.fecha_compra,
             pv.nombre AS proveedor,
             c.subtotal, c.impuestos, c.total, c.estado,
             CONCAT(u.nombre,' ',IFNULL(u.apellido,'')) AS registrado_por,
             COUNT(dc.id) AS total_items
      FROM   compras c
      JOIN   proveedores pv ON pv.id = c.proveedor_id
      JOIN   usuarios    u  ON u.id  = c.usuario_id
      JOIN   detalle_compras dc ON dc.compra_id = c.id
      WHERE  1=1
    `;
    const params = [];
    if (estado) { sql += ' AND c.estado = ?';        params.push(estado.toUpperCase()); }
    if (desde)  { sql += ' AND c.fecha_compra >= ?'; params.push(desde + ' 00:00:00'); }
    if (hasta)  { sql += ' AND c.fecha_compra <= ?'; params.push(hasta + ' 23:59:59'); }
    sql += ' GROUP BY c.id ORDER BY c.fecha_compra DESC';

    res.json(await query(sql, params));
  } catch (err) { next(err); }
};

module.exports = { reporteProductos, reporteExistencias, reporteMovimientos, reporteCompras };
