/**
 * backend/controllers/ventas.controller.js
 * Encabezado y detalle de ventas con descuento automático de inventario.
 */
const { query, getConnection } = require('../lib/db');
const { _verificarAlertas } = require('./movimientos.controller');

function normalizarNumero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

async function generarNumeroVenta() {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [row] = await query(
    `SELECT COUNT(*) AS total FROM ventas WHERE numero_venta LIKE ?`,
    [`VT-${ym}-%`]
  );
  const seq = String(Number(row.total) + 1).padStart(4, '0');
  return `VT-${ym}-${seq}`;
}

const listar = async (req, res, next) => {
  try {
    const { estado, desde, hasta } = req.query;
    let sql = `
      SELECT v.id, v.numero_venta, v.fecha_venta, v.subtotal, v.impuestos, v.total,
             v.estado, v.observaciones,
             CONCAT(u.nombre, ' ', IFNULL(u.apellido, '')) AS usuario_nombre,
             COUNT(dv.id) AS items
      FROM ventas v
      LEFT JOIN detalle_ventas dv ON dv.venta_id = v.id
      JOIN usuarios u ON u.id = v.usuario_id
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      sql += ' AND v.estado = ?';
      params.push(String(estado).toUpperCase());
    }
    if (desde) {
      sql += ' AND v.fecha_venta >= ?';
      params.push(`${desde} 00:00:00`);
    }
    if (hasta) {
      sql += ' AND v.fecha_venta <= ?';
      params.push(`${hasta} 23:59:59`);
    }

    sql += ' GROUP BY v.id ORDER BY v.fecha_venta DESC';
    res.json(await query(sql, params));
  } catch (err) {
    next(err);
  }
};

const obtener = async (req, res, next) => {
  try {
    const [venta] = await query(
      `SELECT v.*, CONCAT(u.nombre, ' ', IFNULL(u.apellido, '')) AS usuario_nombre
       FROM ventas v
       JOIN usuarios u ON u.id = v.usuario_id
       WHERE v.id = ?`,
      [req.params.id]
    );

    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada.' });
    }

    const detalles = await query(
      `SELECT dv.id, dv.receta_id, dv.receta_nombre, dv.cantidad, dv.precio_unitario, dv.subtotal
       FROM detalle_ventas dv
       WHERE dv.venta_id = ?
       ORDER BY dv.id ASC`,
      [req.params.id]
    );

    res.json({ ...venta, detalles });
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  const { items = [], impuestos = 0, observaciones = '' } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ mensaje: 'Debe incluir al menos una receta en la venta.' });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const recetaMap = new Map();
    for (const item of items) {
      const recetaId = Number(item.receta_id);
      const cantidad = normalizarNumero(item.cantidad, 0);
      if (!recetaId || cantidad <= 0) {
        throw new Error('Cada receta debe tener un ID válido y una cantidad mayor que cero.');
      }
      recetaMap.set(recetaId, (recetaMap.get(recetaId) || 0) + cantidad);
    }

    const ids = [...recetaMap.keys()];
    if (ids.length === 0) {
      throw new Error('No hay recetas válidas para registrar.');
    }

    const recetasRows = await conn.query(
      `SELECT r.id, r.nombre, r.precio_venta, r.estado
       FROM recetas r
       WHERE r.id IN (?)
       ORDER BY r.id ASC`,
      [ids]
    );

    const recetasById = new Map(recetasRows[0].map((r) => [Number(r.id), r]));
    const faltantes = ids.filter((id) => !recetasById.has(Number(id)));
    if (faltantes.length > 0) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Hay recetas no encontradas o inactivas.' });
    }

    const recetasActivas = ids.filter((id) => {
      const receta = recetasById.get(Number(id));
      return receta && String(receta.estado).toUpperCase() === 'ACTIVA';
    });
    if (recetasActivas.length !== ids.length) {
      await conn.rollback();
      return res.status(400).json({ mensaje: 'No se pueden vender recetas inactivas.' });
    }

    const consumoByProducto = new Map();
    for (const [recetaId, cantidadVendida] of recetaMap.entries()) {
      const receta = recetasById.get(Number(recetaId));
      const ingredientes = await conn.query(
        `SELECT dr.producto_id, dr.cantidad
         FROM detalle_receta dr
         WHERE dr.receta_id = ?`,
        [recetaId]
      );

      for (const ing of ingredientes[0]) {
        const productoId = Number(ing.producto_id);
        const cantidadNecesaria = normalizarNumero(ing.cantidad) * cantidadVendida;
        consumoByProducto.set(productoId, (consumoByProducto.get(productoId) || 0) + cantidadNecesaria);
      }
    }

    const productoIds = [...consumoByProducto.keys()];
    const productosRows = await conn.query(
      `SELECT id, nombre, cantidad, stock_minimo, unidad_medida
       FROM productos
       WHERE id IN (?)
       FOR UPDATE`,
      [productoIds]
    );
    const productosById = new Map(productosRows[0].map((p) => [Number(p.id), p]));

    const insuficientes = [];
    for (const [productoId, totalNecesario] of consumoByProducto.entries()) {
      const producto = productosById.get(Number(productoId));
      if (!producto) {
        insuficientes.push({ nombre: `Producto #${productoId}`, faltante: totalNecesario, disponible: 0 });
        continue;
      }
      if (Number(producto.cantidad) < totalNecesario) {
        insuficientes.push({
          nombre: producto.nombre,
          faltante: Number(totalNecesario - Number(producto.cantidad)).toFixed(3),
          disponible: Number(producto.cantidad).toFixed(3),
        });
      }
    }

    if (insuficientes.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        mensaje: 'No hay suficiente stock para completar la venta.',
        detalles: insuficientes,
      });
    }

    const numeroVenta = await generarNumeroVenta();
    const subtotal = [...recetaMap.entries()].reduce((sum, [recetaId, cantidad]) => {
      const receta = recetasById.get(Number(recetaId));
      return sum + normalizarNumero(receta?.precio_venta || 0) * cantidad;
    }, 0);

    
    const impuestosCalculados = normalizarNumero(impuestos, 0);
    const total = subtotal + impuestosCalculados;


    const [ventaResult] = await conn.execute(
      `INSERT INTO ventas (numero_venta, usuario_id, fecha_venta, subtotal, impuestos, total, estado, observaciones)
       VALUES (?, ?, NOW(), ?, ?, ?, 'CONFIRMADA', ?)`,
      [numeroVenta, req.usuario.id, subtotal, impuestosCalculados, total, observaciones ? String(observaciones).trim() : null]
    );

    const ventaId = ventaResult.insertId;

    for (const [recetaId, cantidad] of recetaMap.entries()) {
      const receta = recetasById.get(Number(recetaId));
      const precioUnitario = normalizarNumero(receta?.precio_venta || 0);
      const subtotalItem = precioUnitario * cantidad;

      await conn.execute(
        `INSERT INTO detalle_ventas (venta_id, receta_id, cantidad, precio_unitario, subtotal, nombre_receta)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ventaId, Number(recetaId),  cantidad, precioUnitario, subtotalItem, String(receta.nombre)]
      );
    }

    for (const [productoId, totalNecesario] of consumoByProducto.entries()) {
      const producto = productosById.get(Number(productoId));
      const cantidadAnterior = Number(producto.cantidad);
      const cantidadNueva = cantidadAnterior - totalNecesario;

      await conn.execute(
        'UPDATE productos SET cantidad = ? WHERE id = ?',
        [cantidadNueva, Number(productoId)]
      );

      await conn.execute(
        `INSERT INTO movimientos_inventario
           (producto_id, usuario_id, venta_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo)
         VALUES (?, ?, ?, 'SALIDA', ?, ?, ?, 'Venta')`,
        [Number(productoId), req.usuario.id, ventaId, totalNecesario, cantidadAnterior, cantidadNueva]
      );

      await _verificarAlertas(conn, Number(productoId), cantidadNueva, Number(producto.stock_minimo));
    }

    await conn.commit();

    const [[ventaCreada]] = await conn.execute('SELECT * FROM ventas WHERE id = ?', [ventaId]);
    res.status(201).json({
      ...ventaCreada,
      mensaje: 'Venta registrada correctamente.',
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const anular = async (req, res, next) => {
  const { id } = req.params;
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const [[venta]] = await conn.execute('SELECT * FROM ventas WHERE id = ? FOR UPDATE', [id]);
    if (!venta) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Venta no encontrada.' });
    }
    if (venta.estado === 'ANULADA') {
      await conn.rollback();
      return res.status(409).json({ mensaje: 'La venta ya fue anulada.' });
    }

    const [detalles] = await conn.execute(
      `SELECT dv.receta_id, dv.cantidad
       FROM detalle_ventas dv
       WHERE dv.venta_id = ?`,
      [id]
    );

    const consumoByProducto = new Map();
    for (const detalle of detalles) {
      const ingredientes = await conn.query(
        `SELECT dr.producto_id, dr.cantidad
         FROM detalle_receta dr
         WHERE dr.receta_id = ?`,
        [detalle.receta_id]
      );

      for (const item of ingredientes[0]) {
        const productoId = Number(item.producto_id);
        const cantidadReversa = normalizarNumero(item.cantidad) * normalizarNumero(detalle.cantidad);
        consumoByProducto.set(productoId, (consumoByProducto.get(productoId) || 0) + cantidadReversa);
      }
    }

    for (const [productoId, cantidad] of consumoByProducto.entries()) {
      const [[producto]] = await conn.execute(
        'SELECT id, cantidad, stock_minimo FROM productos WHERE id = ? FOR UPDATE',
        [productoId]
      );
      if (!producto) continue;
      const nuevaCantidad = Number(producto.cantidad) + Number(cantidad);
      await conn.execute(
        'UPDATE productos SET cantidad = ? WHERE id = ?',
        [nuevaCantidad, productoId]
      );
      await conn.execute(
        `INSERT INTO movimientos_inventario
           (producto_id, usuario_id, venta_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo)
         VALUES (?, ?, ?, 'ENTRADA', ?, ?, ?, 'Anulación de venta')`,
        [productoId, req.usuario.id, id, cantidad, Number(producto.cantidad), nuevaCantidad]
      );
      await _verificarAlertas(conn, Number(productoId), nuevaCantidad, Number(producto.stock_minimo));
    }

    await conn.execute('UPDATE ventas SET estado = ? WHERE id = ?', ['ANULADA', id]);
    await conn.commit();
    res.json({ mensaje: 'Venta anulada correctamente y stock restaurado.' });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

module.exports = { listar, obtener, crear, anular };
