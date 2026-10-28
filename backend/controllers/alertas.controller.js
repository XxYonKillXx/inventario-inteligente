/**
 * backend/controllers/alertas.controller.js
 * Tabla real: `alertas_inventario`
 * Tipos: STOCK_BAJO / STOCK_AGOTADO / VENCIMIENTO
 * Estados: PENDIENTE / ATENDIDA
 */
const { query } = require('../lib/db');

/** GET /api/alertas */
const listarAlertas = async (req, res, next) => {
  const { estado = 'PENDIENTE', tipo } = req.query;
  try {
    let sql = `
      SELECT a.id, a.producto_id, p.nombre AS producto_nombre,
             p.cantidad AS stock_actual, p.stock_minimo,
             c.nombre AS categoria_nombre,
             a.tipo, a.mensaje, a.estado,
             a.fecha_alerta, a.fecha_atencion,
             a.usuario_atencion_id,
             CONCAT(u.nombre,' ',IFNULL(u.apellido,'')) AS usuario_atencion_nombre
      FROM   alertas_inventario a
      JOIN   productos  p ON p.id = a.producto_id
      JOIN   categorias c ON c.id = p.categoria_id
      LEFT JOIN usuarios u ON u.id = a.usuario_atencion_id
      WHERE  a.estado = ?
    `;
    const params = [estado.toUpperCase()];

    if (tipo) { sql += ' AND a.tipo = ?'; params.push(tipo.toUpperCase()); }
    sql += ' ORDER BY a.fecha_alerta DESC';

    res.json(await query(sql, params));
  } catch (err) { next(err); }
};

/**
 * PATCH /api/alertas/:id/atender
 * Marca una alerta como ATENDIDA.
 */
const atenderAlerta = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [alerta] = await query('SELECT id, estado FROM alertas_inventario WHERE id = ?', [id]);
    if (!alerta)                     return res.status(404).json({ mensaje: 'Alerta no encontrada.' });
    if (alerta.estado === 'ATENDIDA') return res.status(409).json({ mensaje: 'La alerta ya fue atendida.' });

    await query(
      `UPDATE alertas_inventario
       SET estado = 'ATENDIDA', fecha_atencion = NOW(), usuario_atencion_id = ?
       WHERE id = ?`,
      [req.usuario.id, id]
    );
    res.json({ mensaje: 'Alerta marcada como atendida.' });
  } catch (err) { next(err); }
};

/** GET /api/alertas/resumen — contadores para el dashboard */
const resumen = async (_req, res, next) => {
  try {
    const rows = await query(`
      SELECT tipo, COUNT(*) AS total
      FROM   alertas_inventario
      WHERE  estado = 'PENDIENTE'
      GROUP  BY tipo
    `);
    const resumenMap = { STOCK_BAJO: 0, STOCK_AGOTADO: 0, VENCIMIENTO: 0 };
    rows.forEach(r => { resumenMap[r.tipo] = Number(r.total); });
    res.json({ ...resumenMap, total: Object.values(resumenMap).reduce((a, b) => a + b, 0) });
  } catch (err) { next(err); }
};

module.exports = { listarAlertas, atenderAlerta, resumen };
