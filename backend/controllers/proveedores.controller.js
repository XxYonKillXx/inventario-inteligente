/**
 * backend/controllers/proveedores.controller.js
 * CRUD real contra la tabla `proveedores`.
 * Columnas reales: nit, correo (no email), contacto, observaciones
 */
const { query } = require('../lib/db');

/** GET /api/proveedores */
const listar = async (req, res, next) => {
  try {
    const rows = await query(`
      SELECT p.id, p.nombre, p.nit, p.telefono, p.correo,
             p.direccion, p.contacto, p.observaciones, p.estado,
             p.fecha_creacion,
             COUNT(c.id) AS total_compras
      FROM   proveedores p
      LEFT JOIN compras c ON c.proveedor_id = p.id
      WHERE  p.estado = 1
      GROUP  BY p.id
      ORDER  BY p.nombre ASC
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

/** GET /api/proveedores/:id */
const obtener = async (req, res, next) => {
  try {
    const [prov] = await query('SELECT * FROM proveedores WHERE id = ?', [req.params.id]);
    if (!prov) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });
    res.json(prov);
  } catch (err) { next(err); }
};

/** POST /api/proveedores */
const crear = async (req, res, next) => {
  const { nombre, nit, telefono, correo, direccion, contacto, observaciones } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ mensaje: 'El nombre es obligatorio.' });

  try {
    const result = await query(
      `INSERT INTO proveedores (nombre, nit, telefono, correo, direccion, contacto, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        nit?.trim()           || null,
        telefono?.trim()      || null,
        correo?.trim()        || null,
        direccion?.trim()     || null,
        contacto?.trim()      || null,
        observaciones?.trim() || null,
      ]
    );
    const [nuevo] = await query('SELECT * FROM proveedores WHERE id = ?', [result.insertId]);
    res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Ya existe un proveedor con ese NIT.' });
    }
    next(err);
  }
};

/** PUT /api/proveedores/:id */
const actualizar = async (req, res, next) => {
  const { nombre, nit, telefono, correo, direccion, contacto, observaciones, estado } = req.body;
  const { id } = req.params;

  try {
    const [prov] = await query('SELECT id FROM proveedores WHERE id = ?', [id]);
    if (!prov) return res.status(404).json({ mensaje: 'Proveedor no encontrado.' });

    await query(
      `UPDATE proveedores
       SET nombre        = COALESCE(?, nombre),
           nit           = COALESCE(?, nit),
           telefono      = COALESCE(?, telefono),
           correo        = COALESCE(?, correo),
           direccion     = COALESCE(?, direccion),
           contacto      = COALESCE(?, contacto),
           observaciones = COALESCE(?, observaciones),
           estado        = COALESCE(?, estado)
       WHERE id = ?`,
      [
        nombre?.trim()        || null,
        nit?.trim()           || null,
        telefono?.trim()      || null,
        correo?.trim()        || null,
        direccion?.trim()     || null,
        contacto?.trim()      || null,
        observaciones?.trim() || null,
        estado ?? null,
        id,
      ]
    );
    const [actualizado] = await query('SELECT * FROM proveedores WHERE id = ?', [id]);
    res.json(actualizado);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Ya existe un proveedor con ese NIT.' });
    }
    next(err);
  }
};

/** DELETE /api/proveedores/:id  (soft delete) */
const eliminar = async (req, res, next) => {
  try {
    await query('UPDATE proveedores SET estado = 0 WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Proveedor desactivado correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
