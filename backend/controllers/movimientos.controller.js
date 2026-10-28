/**
 * backend/controllers/movimientos.controller.js
 * Gestión de la tabla `movimientos_inventario`.
 * Columnas reales: tipo ENTRADA/SALIDA/AJUSTE, motivo, cantidad_anterior, cantidad_nueva
 */
const { query, getConnection } = require('../lib/db');
const { calcularEstado }       = require('./productos.controller');

/** GET /api/movimientos */
const listar = async (req, res, next) => {
  const { tipo, producto_id, desde, hasta } = req.query;
  try {
    let sql = `
      SELECT m.id, m.producto_id, p.nombre AS producto_nombre,
             m.usuario_id,
             CONCAT(u.nombre, ' ', IFNULL(u.apellido,'')) AS usuario_nombre,
             m.compra_id, m.tipo, m.cantidad,
             m.cantidad_anterior, m.cantidad_nueva,
             m.motivo, m.fecha_movimiento
      FROM   movimientos_inventario m
      JOIN   productos p ON p.id = m.producto_id
      JOIN   usuarios  u ON u.id = m.usuario_id
      WHERE  1=1
    `;
    const params = [];

    if (tipo)       { sql += ' AND m.tipo = ?';               params.push(tipo.toUpperCase()); }
    if (producto_id){ sql += ' AND m.producto_id = ?';        params.push(producto_id); }
    if (desde)      { sql += ' AND m.fecha_movimiento >= ?';  params.push(desde + ' 00:00:00'); }
    if (hasta)      { sql += ' AND m.fecha_movimiento <= ?';  params.push(hasta + ' 23:59:59'); }

    sql += ' ORDER BY m.fecha_movimiento DESC LIMIT 200';

    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
};

/**
 * POST /api/movimientos
 * Registra una salida o ajuste manual de inventario.
 * Las entradas se registran automáticamente al crear una compra.
 */
const registrar = async (req, res, next) => {
  const { producto_id, tipo, cantidad, motivo } = req.body;

  if (!producto_id || !tipo || !cantidad || !motivo) {
    return res.status(400).json({
      mensaje: 'producto_id, tipo, cantidad y motivo son obligatorios.',
    });
  }

  const tipoUpper = tipo.toUpperCase();
  if (!['SALIDA', 'AJUSTE'].includes(tipoUpper)) {
    return res.status(400).json({
      mensaje: 'Tipo inválido. Solo se permiten SALIDA o AJUSTE desde este endpoint.',
    });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [[prod]] = await conn.execute(
      'SELECT id, nombre, cantidad, stock_minimo FROM productos WHERE id = ? AND estado = 1 FOR UPDATE',
      [producto_id]
    );
    if (!prod) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado o inactivo.' });
    }

    const cantidadNum     = Number(cantidad);
    const cantidadAnterior = Number(prod.cantidad);
    let   cantidadNueva;

    if (tipoUpper === 'SALIDA') {
      if (cantidadNum > cantidadAnterior) {
        await conn.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente. Disponible: ${cantidadAnterior}, solicitado: ${cantidadNum}`,
        });
      }
      cantidadNueva = cantidadAnterior - cantidadNum;
    } else {
      // AJUSTE: cantidad es la nueva cantidad total
      cantidadNueva = cantidadNum;
    }

    await conn.execute(
      `INSERT INTO movimientos_inventario
         (producto_id, usuario_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [producto_id, req.usuario.id, tipoUpper, cantidadNum, cantidadAnterior, cantidadNueva, motivo.trim()]
    );

    await conn.execute(
      'UPDATE productos SET cantidad = ? WHERE id = ?',
      [cantidadNueva, producto_id]
    );

    // Revisar y generar alertas automáticas
    await _verificarAlertas(conn, producto_id, cantidadNueva, prod.stock_minimo);

    await conn.commit();
    res.status(201).json({
      mensaje: 'Movimiento registrado correctamente.',
      cantidad_anterior: cantidadAnterior,
      cantidad_nueva:    cantidadNueva,
      estado_stock:      calcularEstado(cantidadNueva, prod.stock_minimo),
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * Función interna: crea o actualiza alertas de inventario después de un movimiento.
 * @param {import('mysql2/promise').PoolConnection} conn
 */
async function _verificarAlertas(conn, productoId, cantidadNueva, stockMinimo) {
  const c = Number(cantidadNueva);
  const m = Number(stockMinimo);

  let tipoAlerta = null;
  let mensaje    = null;

  if (c <= 0) {
    tipoAlerta = 'STOCK_AGOTADO';
    mensaje    = 'El producto se ha agotado completamente.';
  } else if (c <= m) {
    tipoAlerta = 'STOCK_BAJO';
    mensaje    = `Stock bajo: ${c} unidades (mínimo: ${m}).`;
  }

  if (tipoAlerta) {
    // Si ya existe una alerta PENDIENTE del mismo tipo, no duplicar
    const [[existente]] = await conn.execute(
      `SELECT id FROM alertas_inventario
       WHERE producto_id = ? AND tipo = ? AND estado = 'PENDIENTE'
       LIMIT 1`,
      [productoId, tipoAlerta]
    );
    if (!existente) {
      await conn.execute(
        `INSERT INTO alertas_inventario (producto_id, tipo, mensaje)
         VALUES (?, ?, ?)`,
        [productoId, tipoAlerta, mensaje]
      );
    }
  } else {
    // Si el stock se recuperó, marcar alertas pendientes como atendidas automáticamente
    await conn.execute(
      `UPDATE alertas_inventario
       SET estado = 'ATENDIDA', fecha_atencion = NOW()
       WHERE producto_id = ? AND estado = 'PENDIENTE'`,
      [productoId]
    );
  }
}

module.exports = { listar, registrar, _verificarAlertas };
