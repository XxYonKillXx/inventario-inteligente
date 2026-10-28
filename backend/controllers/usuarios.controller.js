/**
 * backend/controllers/usuarios.controller.js
 * CRUD de la tabla `usuarios`.
 * Columna: correo (no email), rol_id (FK → roles), nombre + apellido separados.
 */
const { query, getConnection } = require('../lib/db');
const { hashPassword } = require('../services/auth.service');

const CAMPOS_PUBLICOS = `
  u.id, u.nombre, u.apellido, u.correo,
  u.rol_id, r.nombre AS rol_nombre,
  u.estado, u.ultimo_acceso, u.fecha_creacion, u.fecha_actualizacion
`;

/** GET /api/usuarios */
const listar = async (_req, res, next) => {
  try {
    const rows = await query(`
      SELECT ${CAMPOS_PUBLICOS}
      FROM   usuarios u
      JOIN   roles    r ON r.id = u.rol_id
      ORDER  BY u.fecha_creacion DESC
    `);
    res.json(rows);
  } catch (err) { next(err); }
};

/** GET /api/usuarios/:id */
const obtener = async (req, res, next) => {
  try {
    const [u] = await query(`
      SELECT ${CAMPOS_PUBLICOS}
      FROM   usuarios u JOIN roles r ON r.id = u.rol_id
      WHERE  u.id = ?
    `, [req.params.id]);
    if (!u) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    res.json(u);
  } catch (err) { next(err); }
};

/** POST /api/usuarios */
const crear = async (req, res, next) => {
  const { nombre, apellido, correo, password, rol_id = 2 } = req.body;

  if (!nombre?.trim())   return res.status(400).json({ mensaje: 'El nombre es obligatorio.' });
  if (!correo?.trim())   return res.status(400).json({ mensaje: 'El correo es obligatorio.' });
  if (!password || password.length < 8)
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });

  try {
    const password_hash = await hashPassword(password);
    const result = await query(
      `INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol_id)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre.trim(), apellido?.trim() || null, correo.trim().toLowerCase(), password_hash, rol_id]
    );
    const [nuevo] = await query(`
      SELECT ${CAMPOS_PUBLICOS}
      FROM   usuarios u JOIN roles r ON r.id = u.rol_id
      WHERE  u.id = ?
    `, [result.insertId]);
    res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo.' });
    }
    next(err);
  }
};

/** PUT /api/usuarios/:id */
const actualizar = async (req, res, next) => {
  const { nombre, apellido, correo, rol_id, estado, password } = req.body;
  const { id } = req.params;

  if (nombre !== undefined && (typeof nombre !== 'string' || !nombre.trim()))
    return res.status(400).json({ mensaje: 'El nombre es obligatorio.' });
  if (apellido !== undefined && apellido !== null && typeof apellido !== 'string')
    return res.status(400).json({ mensaje: 'El apellido no es válido.' });
  if (correo !== undefined && (typeof correo !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())))
    return res.status(400).json({ mensaje: 'Ingresa un correo electrónico válido.' });
  if (rol_id !== undefined && (!Number.isInteger(Number(rol_id)) || Number(rol_id) < 1))
    return res.status(400).json({ mensaje: 'El rol seleccionado no es válido.' });
  if (estado !== undefined && ![0, 1].includes(Number(estado)))
    return res.status(400).json({ mensaje: 'El estado debe ser activo o inactivo.' });
  if (password !== undefined && password !== '' && (typeof password !== 'string' || password.length < 8))
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [[actual]] = await conn.execute(
      'SELECT id, nombre, apellido, correo, rol_id, estado FROM usuarios WHERE id = ? FOR UPDATE',
      [id]
    );
    if (!actual) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const rolId = rol_id !== undefined ? Number(rol_id) : actual.rol_id;
    if (rol_id !== undefined) {
      const [[rol]] = await conn.execute('SELECT id FROM roles WHERE id = ?', [rolId]);
      if (!rol) {
        await conn.rollback();
        return res.status(400).json({ mensaje: 'El rol seleccionado no existe.' });
      }
    }

    const nuevoPassword = password !== undefined && password !== ''
      ? await hashPassword(password)
      : null;
    await conn.execute(
      `UPDATE usuarios
       SET nombre = ?, apellido = ?, correo = ?, rol_id = ?, estado = ?,
           password_hash = COALESCE(?, password_hash)
       WHERE id = ?`,
      [
        nombre !== undefined ? nombre.trim() : actual.nombre,
        apellido !== undefined ? (apellido === null ? null : (apellido.trim() || null)) : actual.apellido,
        correo !== undefined ? correo.trim().toLowerCase() : actual.correo,
        rolId,
        estado !== undefined ? Number(estado) : actual.estado,
        nuevoPassword,
        id,
      ]
    );

    await conn.commit();
    const [actualizado] = await query(`
      SELECT ${CAMPOS_PUBLICOS}
      FROM   usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?
    `, [id]);
    res.json(actualizado);
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensaje: 'Ya existe un usuario con ese correo.' });
    }
    next(err);
  } finally {
    conn.release();
  }
};

/** PATCH /api/usuarios/:id/password */
const cambiarPassword = async (req, res, next) => {
  const { password } = req.body;
  const { id }       = req.params;

  if (!password || password.length < 8)
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });

  try {
    const password_hash = await hashPassword(password);
    await query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [password_hash, id]);
    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, cambiarPassword };
