const config = require('../config/env');

/**
 * Middleware centralizado para el manejo de errores en Express
 */
const manejarError = (err, req, res, next) => {
  const esDesarrollo = config.nodeEnv === 'development';
  const statusCode = err.status || err.statusCode || 500;
  const codigo = err.codigo || 'ERROR_INTERNO_SERVIDOR';
  const mensaje = err.mensaje || err.message || 'Ha ocurrido un error inesperado en el servidor';

  if (esDesarrollo) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  const respuesta = {
    mensaje,
    codigo,
    ...(esDesarrollo && {
      detalle: err.stack || err.detalle || err.toString()
    })
  };

  res.status(statusCode).json(respuesta);
};

/**
 * Middleware para rutas no encontradas (404)
 */
const manejarRutaNoEncontrada = (req, res) => {
  res.status(404).json({
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    codigo: 'RUTA_NO_ENCONTRADA'
  });
};

module.exports = {
  manejarError,
  manejarRutaNoEncontrada
};
