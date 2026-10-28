/**
 * backend/controllers/auth.controller.js
 * Controlador de autenticación con MySQL real.
 */
const authService = require('../services/auth.service');

/** POST /api/auth/login */
const login = async (req, res, next) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({
      mensaje: 'El correo y la contraseña son obligatorios.',
      codigo:  'DATOS_INCOMPLETOS',
    });
  }

  try {
    const usuario = await authService.validarCredenciales(correo.trim().toLowerCase(), password);
    const token   = authService.generarToken(usuario);

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario,
    });
  } catch (error) {
    if (
      error.message === 'Credenciales inválidas' ||
      error.message === 'La cuenta está desactivada'
    ) {
      return res.status(401).json({ mensaje: error.message, codigo: 'CREDENCIALES_INVALIDAS' });
    }
    next(error);
  }
};

/** POST /api/auth/logout */
const logout = (_req, res) => {
  return res.status(200).json({ mensaje: 'Sesión cerrada exitosamente' });
};

/**
 * GET /api/auth/perfil
 * Retorna el perfil del usuario autenticado (datos del token).
 */
const perfil = (req, res) => {
  return res.status(200).json({ usuario: req.usuario });
};

module.exports = { login, logout, perfil };
