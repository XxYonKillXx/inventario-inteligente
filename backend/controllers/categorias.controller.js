/**
 * backend/controllers/categorias.controller.js
 * CRUD real contra la tabla `categorias`.
 */
const { query } = require('../lib/db');

/** GET /api/categorias */
const listar = async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT c.id, c.nombre, c.descripcion, c.estado,
             c.fecha_creacion,
             COUNT(p.id) AS total_productos
      FROM   categorias c
      LEFT JOIN productos p ON p.categoria_id = c.id AND p.estado = 1
      GROUP BY c.id
      ORDER BY c.nombre ASC
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

/** GET /api/categorias/:id */
const obtener = async (req, res, next) => {
  try {
    const [cat] = await query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!cat) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
    res.json(cat);
  } catch (err) { next(err); }
};

/** POST /api/categorias */
const crear = async (req, res, next) => {
  const { nombre, descripcion } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ mensaje: 'El nombre es obligatorio.' });

  try {
    const result = await query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre.trim(), descripcion?.trim() || null]
    );
    const [nueva] = await query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);
    res.status(201).json(nueva);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: `Ya existe una categoría con el nombre "${nombre}".` });
    }
    next(err);
  }
};

/** PUT /api/categorias/:id */
const actualizar = async (req, res, next) => {
  const { nombre, descripcion, estado } = req.body;
  const { id } = req.params;

  try {
    const [cat] = await query('SELECT id FROM categorias WHERE id = ?', [id]);
    if (!cat) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });

    await query(
      `UPDATE categorias
       SET nombre      = COALESCE(?, nombre),
           descripcion = COALESCE(?, descripcion),
           estado      = COALESCE(?, estado)
       WHERE id = ?`,
      [nombre?.trim() || null, descripcion?.trim() || null, estado ?? null, id]
    );
    const [actualizada] = await query('SELECT * FROM categorias WHERE id = ?', [id]);
    res.json(actualizada);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Ya existe una categoría con ese nombre.' });
    }
    next(err);
  }
};

/** DELETE /api/categorias/:id  (soft delete) */
const eliminar = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [productosActivos] = await query(
      'SELECT COUNT(*) AS total FROM productos WHERE categoria_id = ? AND estado = 1',
      [id]
    );
    if (productosActivos.total > 0) {
      return res.status(409).json({
        mensaje: `No se puede desactivar: hay ${productosActivos.total} producto(s) activo(s) en esta categoría.`,
      });
    }
    await query('UPDATE categorias SET estado = 0 WHERE id = ?', [id]);
    res.json({ mensaje: 'Categoría desactivada correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
