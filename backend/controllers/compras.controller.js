/**
 * backend/controllers/compras.controller.js
 * Tabla `compras` con transacciones completas.
 * Estados reales: PENDIENTE / RECIBIDA / ANULADA
 */
const { query, getConnection } = require('../lib/db');
const { _verificarAlertas }    = require('./movimientos.controller');

/** Genera número de compra único: C-YYYYMM-NNNN */
async function generarNumeroCompra() {
  const now  = new Date();
  const ym   = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [row] = await query(
    `SELECT COUNT(*) AS n FROM compras WHERE numero_compra LIKE ?`,
    [`C-${ym}-%`]
  );
  const seq  = String(Number(row.n) + 1).padStart(4, '0');
  return `C-${ym}-${seq}`;
}

/** GET /api/compras */
const listar = async (req, res, next) => {
  const { desde, hasta, estado } = req.query;
  try {
    let sql = `
      SELECT c.id, c.numero_compra, c.proveedor_id,
             pv.nombre AS proveedor_nombre,
             c.usuario_id,
             CONCAT(u.nombre,' ',IFNULL(u.apellido,'')) AS usuario_nombre,
             c.fecha_compra, c.subtotal, c.impuestos, c.total,
             c.estado, c.observaciones, c.fecha_creacion
      FROM   compras c
      JOIN   proveedores pv ON pv.id = c.proveedor_id
      JOIN   usuarios    u  ON u.id  = c.usuario_id
      WHERE  1=1
    `;
    const params = [];
    if (estado) { sql += ' AND c.estado = ?';              params.push(estado.toUpperCase()); }
    if (desde)  { sql += ' AND c.fecha_compra >= ?';       params.push(desde + ' 00:00:00'); }
    if (hasta)  { sql += ' AND c.fecha_compra <= ?';       params.push(hasta + ' 23:59:59'); }
    sql += ' ORDER BY c.fecha_compra DESC';

    res.json(await query(sql, params));
  } catch (err) { next(err); }
};

/** GET /api/compras/:id  — con detalle */
const obtener = async (req, res, next) => {
  try {
    const [compra] = await query(`
      SELECT c.*, pv.nombre AS proveedor_nombre,
             CONCAT(u.nombre,' ',IFNULL(u.apellido,'')) AS usuario_nombre
      FROM   compras c
      JOIN   proveedores pv ON pv.id = c.proveedor_id
      JOIN   usuarios    u  ON u.id  = c.usuario_id
      WHERE  c.id = ?
    `, [req.params.id]);

    if (!compra) return res.status(404).json({ mensaje: 'Compra no encontrada.' });

    const detalles = await query(`
      SELECT dc.id, dc.producto_id, p.nombre AS producto_nombre,
             p.unidad_medida, dc.cantidad, dc.precio_unitario, dc.subtotal
      FROM   detalle_compras dc
      JOIN   productos p ON p.id = dc.producto_id
      WHERE  dc.compra_id = ?
    `, [req.params.id]);

    res.json({ ...compra, detalles });
  } catch (err) { next(err); }
};

/**
 * POST /api/compras
 * Crea una compra pendiente con sus detalles y conserva los precios unitarios.
 * Body: { proveedor_id, items: [{producto_id, cantidad, precio_unitario}], impuestos?, observaciones? }
 */
const crear = async (req, res, next) => {
  const { proveedor_id, items, impuestos = 0, observaciones } = req.body;

  if (!proveedor_id)            return res.status(400).json({ mensaje: 'proveedor_id es obligatorio.' });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ mensaje: 'Debe incluir al menos un producto en items.' });

  for (const item of items) {
    if (!item.producto_id || !item.cantidad || !item.precio_unitario)
      return res.status(400).json({ mensaje: 'Cada ítem requiere producto_id, cantidad y precio_unitario.' });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const numero_compra = await generarNumeroCompra();

    // Calcular subtotal
    const subtotal = items.reduce(
      (acc, i) => acc + Number(i.cantidad) * Number(i.precio_unitario), 0
    );
    const total = subtotal + Number(impuestos);

    const [compraResult] = await conn.execute(
      `INSERT INTO compras
         (numero_compra, proveedor_id, usuario_id, subtotal, impuestos, total, estado, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDIENTE', ?)`,
      [numero_compra, proveedor_id, req.usuario.id, subtotal, Number(impuestos), total, observaciones?.trim() || null]
    );
    const compraId = compraResult.insertId;

    for (const item of items) {
      const cantidad      = Number(item.cantidad);
      const precioUnit    = Number(item.precio_unitario);
      const subtotalItem  = cantidad * precioUnit;

      // Detalle de compra
      await conn.execute(
        `INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [compraId, item.producto_id, cantidad, precioUnit, subtotalItem]
      );

    }

    await conn.commit();

    const [[compraCreada]] = await conn.execute(
      'SELECT * FROM compras WHERE id = ?', [compraId]
    );
    res.status(201).json({ ...compraCreada, mensaje: `Compra ${numero_compra} registrada correctamente.` });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * PATCH /api/compras/:id/estado
 * Cambia estado: PENDIENTE → RECIBIDA o ANULADA.
 * Al recibir, actualiza existencias, movimientos y el último precio de compra.
 */
const actualizarEstado = async (req, res, next) => {
  const { estado } = req.body;
  const { id }     = req.params;

  if (!['RECIBIDA', 'ANULADA'].includes(estado?.toUpperCase())) {
    return res.status(400).json({ mensaje: 'Estado inválido. Use RECIBIDA o ANULADA.' });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [[compra]] = await conn.execute(
      'SELECT id, estado, numero_compra FROM compras WHERE id = ? FOR UPDATE', [id]
    );
    if (!compra) { await conn.rollback(); return res.status(404).json({ mensaje: 'Compra no encontrada.' }); }
    if (compra.estado !== 'PENDIENTE') {
      await conn.rollback();
      return res.status(409).json({
        mensaje: `Solo se pueden cambiar compras PENDIENTES. Estado actual: ${compra.estado}`,
      });
    }

    await conn.execute('UPDATE compras SET estado = ? WHERE id = ?', [estado.toUpperCase(), id]);

    if (estado.toUpperCase() === 'RECIBIDA') {
      const [detalles] = await conn.execute(
        `SELECT producto_id, cantidad, precio_unitario
         FROM detalle_compras
         WHERE compra_id = ?
         ORDER BY producto_id, id`,
        [id]
      );
      for (const det of detalles) {
        const [[prod]] = await conn.execute(
          'SELECT cantidad, stock_minimo FROM productos WHERE id = ? FOR UPDATE',
          [det.producto_id]
        );
        const cantAnterior = Number(prod.cantidad);
        const cantNueva    = cantAnterior + Number(det.cantidad);

        await conn.execute(
          'UPDATE productos SET cantidad = ?, precio_compra = ? WHERE id = ?',
          [cantNueva, Number(det.precio_unitario), det.producto_id]
        );
        await conn.execute(
          `INSERT INTO movimientos_inventario
             (producto_id, usuario_id, compra_id, tipo, cantidad,
              cantidad_anterior, cantidad_nueva, motivo)
           VALUES (?, ?, ?, 'ENTRADA', ?, ?, ?, ?)`,
          [
            det.producto_id, req.usuario.id, id,
            Number(det.cantidad), cantAnterior, cantNueva,
            `Compra ${compra.numero_compra}`,
          ]
        );
        await _verificarAlertas(conn, det.producto_id, cantNueva, prod.stock_minimo);
      }
    }

    await conn.commit();
    res.json({ mensaje: `Compra ${estado.toUpperCase()} correctamente.` });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

module.exports = { listar, obtener, crear, actualizarEstado };
