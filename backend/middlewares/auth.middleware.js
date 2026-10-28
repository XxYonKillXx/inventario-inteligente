/**
 * backend/middlewares/auth.middleware.js
 * Middleware JWT real con bcryptjs + jsonwebtoken instalados.
 */
const jwt    = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Verifica el token Bearer y adjunta req.usuario con id, nombre, rol y permisos.
 */
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      mensaje: 'Acceso no autorizado: token no proporcionado.',
      codigo:  'TOKEN_NO_PROPORCIONADO',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodificado = jwt.verify(token, config.jwt.secreto);
    req.usuario = decodificado;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'El token ha expirado.', codigo: 'TOKEN_EXPIRADO' });
    }
    return res.status(401).json({ mensaje: 'Token inválido.', codigo: 'TOKEN_INVALIDO' });
  }
};

/**
 * Verifica que el usuario tenga un permiso específico (código del catálogo).
 * Uso: requerirPermiso('productos.crear')
 */
const requerirPermiso = (codigo) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ mensaje: 'No autenticado.', codigo: 'NO_AUTENTICADO' });
  }
  const permisos = req.usuario.permisos || [];
  if (!permisos.includes(codigo)) {
    return res.status(403).json({
      mensaje: `No tienes el permiso requerido: ${codigo}`,
      codigo:  'PERMISO_INSUFICIENTE',
    });
  }
  next();
};

/**
 * Verifica que el usuario tenga al menos uno de los roles indicados.
 * Uso: requerirRol(['administrador'])
 */
const requerirRol = (roles = []) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ mensaje: 'No autenticado.', codigo: 'NO_AUTENTICADO' });
  }
  if (roles.length > 0 && !roles.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'Rol insuficiente.', codigo: 'ROL_INSUFICIENTE' });
  }
  next();
};

module.exports = { verificarToken, requerirPermiso, requerirRol };
