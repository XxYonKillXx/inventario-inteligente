/**
 * backend/controllers/productos.controller.js
 * CRUD real contra la tabla `productos`.
 * Columnas reales: cantidad (no stock), categoria_id, unidad_medida, fecha_vencimiento
 */
const { query, getConnection } = require('../lib/db');

/** Calcula el estado lógico del producto */
function calcularEstado(cantidad, stock_minimo) {
  const c = Number(cantidad);
  const m = Number(stock_minimo);
  if (c <= 0)      return 'AGOTADO';
  if (c <= m)      return 'STOCK_BAJO';
  return 'DISPONIBLE';
}

/** GET /api/productos */
const listar = async (req, res, next) => {
  const { busqueda, categoria_id } = req.query;
  try {
    let sql = `
      SELECT p.id, p.codigo, p.nombre, p.descripcion,
             p.categoria_id, c.nombre AS categoria_nombre,
             p.unidad_medida, p.precio_compra, p.precio_venta,
             p.cantidad, p.stock_minimo, p.fecha_vencimiento,
             p.estado, p.fecha_creacion, p.fecha_actualizacion
      FROM   productos p
      JOIN   categorias c ON c.id = p.categoria_id
      WHERE  p.estado = 1
    `;
    const params = [];

    if (busqueda) {
      sql += ' AND (p.nombre LIKE ? OR p.codigo LIKE ?)';
      params.push(`%${busqueda}%`, `%${busqueda}%`);
    }
    if (categoria_id) {
      sql += ' AND p.categoria_id = ?';
      params.push(categoria_id);
    }
    sql += ' ORDER BY p.nombre ASC';

    const rows = await query(sql, params);
    const productos = rows.map(p => ({
      ...p,
      estado_stock: calcularEstado(p.cantidad, p.stock_minimo),
    }));
    res.json(productos);
  } catch (err) { next(err); }
};

/** GET /api/productos/:id */
const obtener = async (req, res, next) => {
  try {
    const [p] = await query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM   productos p
      JOIN   categorias c ON c.id = p.categoria_id
      WHERE  p.id = ?
    `, [req.params.id]);

    if (!p) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    res.json({ ...p, estado_stock: calcularEstado(p.cantidad, p.stock_minimo) });
  } catch (err) { next(err); }
};

/** POST /api/productos */
const crear = async (req, res, next) => {
  const {
    codigo, nombre, descripcion, categoria_id,
    unidad_medida = 'unidad', precio_compra = 0, precio_venta,
    cantidad = 0, stock_minimo = 0, fecha_vencimiento,
  } = req.body;

  if (!nombre?.trim())  return res.status(400).json({ mensaje: 'El nombre es obligatorio.' });
  if (!categoria_id)    return res.status(400).json({ mensaje: 'La categoría es obligatoria.' });
  if (precio_venta == null) return res.status(400).json({ mensaje: 'El precio de venta es obligatorio.' });

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `INSERT INTO productos
         (codigo, nombre, descripcion, categoria_id, unidad_medida,
          precio_compra, precio_venta, cantidad, stock_minimo, fecha_vencimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo?.trim() || null,
        nombre.trim(),
        descripcion?.trim() || null,
        categoria_id,
        unidad_medida,
        Number(precio_compra),
        Number(precio_venta),
        Number(cantidad),
        Number(stock_minimo),
        fecha_vencimiento || null,
      ]
    );

    const productoId = result.insertId;

    // Si se ingresa con stock inicial, registra movimiento de entrada
    if (Number(cantidad) > 0) {
      await conn.execute(
        `INSERT INTO movimientos_inventario
           (producto_id, usuario_id, tipo, cantidad, cantidad_anterior, cantidad_nueva, motivo)
         VALUES (?, ?, 'ENTRADA', ?, 0, ?, 'Stock inicial al crear el producto')`,
        [productoId, req.usuario.id, Number(cantidad), Number(cantidad)]
      );
    }

    await conn.commit();

    const [[nuevo]] = await conn.execute(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM   productos p JOIN categorias c ON c.id = p.categoria_id
      WHERE  p.id = ?
    `, [productoId]);

    res.status(201).json({ ...nuevo, estado_stock: calcularEstado(nuevo.cantidad, nuevo.stock_minimo) });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Ya existe un producto con ese código.' });
    }
    next(err);
  } finally {
    conn.release();
  }
};

/** PUT /api/productos/:id — NO actualiza cantidad directamente (usa movimientos) */
const actualizar = async (req, res, next) => {
  const {
    codigo, nombre, descripcion, categoria_id,
    unidad_medida, precio_compra, precio_venta,
    stock_minimo, fecha_vencimiento, estado,
  } = req.body;
  const { id } = req.params;

  try {
    const [prod] = await query('SELECT id FROM productos WHERE id = ?', [id]);
    if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado.' });

    await query(
      `UPDATE productos
       SET codigo            = COALESCE(?, codigo),
           nombre            = COALESCE(?, nombre),
           descripcion       = COALESCE(?, descripcion),
           categoria_id      = COALESCE(?, categoria_id),
           unidad_medida     = COALESCE(?, unidad_medida),
           precio_compra     = COALESCE(?, precio_compra),
           precio_venta      = COALESCE(?, precio_venta),
           stock_minimo      = COALESCE(?, stock_minimo),
           fecha_vencimiento = COALESCE(?, fecha_vencimiento),
           estado            = COALESCE(?, estado)
       WHERE id = ?`,
      [
        codigo?.trim()    || null,
        nombre?.trim()    || null,
        descripcion?.trim() !== undefined ? descripcion.trim() : null,
        categoria_id      || null,
        unidad_medida     || null,
        precio_compra != null ? Number(precio_compra) : null,
        precio_venta  != null ? Number(precio_venta)  : null,
        stock_minimo  != null ? Number(stock_minimo)  : null,
        fecha_vencimiento || null,
        estado        != null ? Number(estado)         : null,
        id,
      ]
    );

    const [actualizado] = await query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM   productos p JOIN categorias c ON c.id = p.categoria_id
      WHERE  p.id = ?
    `, [id]);

    res.json({ ...actualizado, estado_stock: calcularEstado(actualizado.cantidad, actualizado.stock_minimo) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Ya existe un producto con ese código.' });
    }
    next(err);
  }
};

/** DELETE /api/productos/:id  (soft delete) */
const eliminar = async (req, res, next) => {
  try {
    const [prod] = await query('SELECT id FROM productos WHERE id = ?', [req.params.id]);
    if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado.' });
    await query('UPDATE productos SET estado = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Producto desactivado correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar, calcularEstado };
