/**
 * backend/services/auth.service.js
 * Servicio real de autenticación con bcryptjs + jsonwebtoken.
 * Columnas reales: usuarios.correo, usuarios.rol_id → roles.nombre
 */
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { query } = require('../lib/db');
const config  = require('../config/env');

/**
 * Busca el usuario por correo, verifica contraseña y retorna el objeto de usuario.
 */
async function validarCredenciales(correo, password) {
  const sql = `
    SELECT u.id, u.nombre, u.apellido, u.correo, u.password_hash,
           u.rol_id, u.estado, r.nombre AS rol_nombre
    FROM   usuarios u
    JOIN   roles    r ON r.id = u.rol_id
    WHERE  u.correo = ?
    LIMIT  1
  `;
  const rows = await query(sql, [correo]);

  if (rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const usuario = rows[0];

  if (!usuario.estado) {
    throw new Error('La cuenta está desactivada');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValida) {
    throw new Error('Credenciales inválidas');
  }

  // Actualizar último acceso
  await query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [usuario.id]);

  // Cargar permisos del rol
  const permisos = await query(
    `SELECT p.codigo
     FROM   rol_permisos rp
     JOIN   permisos     p ON p.id = rp.permiso_id
     WHERE  rp.rol_id = ?`,
    [usuario.rol_id]
  );

  return {
    id:       usuario.id,
    nombre:   usuario.nombre,
    apellido: usuario.apellido,
    correo:   usuario.correo,
    rol_id:   usuario.rol_id,
    rol:      usuario.rol_nombre,
    permisos: permisos.map(p => p.codigo),
  };
}

/**
 * Genera un token JWT firmado con los datos del usuario.
 */
function generarToken(usuario) {
  return jwt.sign(
    {
      id:       usuario.id,
      nombre:   usuario.nombre,
      apellido: usuario.apellido,
      correo:   usuario.correo,
      rol_id:   usuario.rol_id,
      rol:      usuario.rol,
      permisos: usuario.permisos,
    },
    config.jwt.secreto,
    { expiresIn: config.jwt.expiracion }
  );
}

/**
 * Genera un hash bcrypt para una contraseña en texto plano.
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

module.exports = { validarCredenciales, generarToken, hashPassword };
