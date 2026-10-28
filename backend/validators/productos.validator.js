/**
 * backend/validators/productos.validator.js
 * Validaciones manuales adaptadas a las columnas reales de la tabla `productos`.
 */

const validarCrearProducto = (req, res, next) => {
  const errores = [];
  const { nombre, categoria_id, precio_venta, cantidad, stock_minimo } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0)
    errores.push({ campo: 'nombre', mensaje: 'El nombre es obligatorio.' });
  else if (nombre.trim().length > 150)
    errores.push({ campo: 'nombre', mensaje: 'El nombre no puede superar 150 caracteres.' });

  if (!categoria_id || isNaN(Number(categoria_id)))
    errores.push({ campo: 'categoria_id', mensaje: 'La categoría es obligatoria y debe ser un número válido.' });

  if (precio_venta == null || isNaN(Number(precio_venta)) || Number(precio_venta) < 0)
    errores.push({ campo: 'precio_venta', mensaje: 'El precio de venta es obligatorio y debe ser ≥ 0.' });

  if (cantidad != null && (isNaN(Number(cantidad)) || Number(cantidad) < 0))
    errores.push({ campo: 'cantidad', mensaje: 'La cantidad inicial debe ser ≥ 0.' });

  if (stock_minimo != null && (isNaN(Number(stock_minimo)) || Number(stock_minimo) < 0))
    errores.push({ campo: 'stock_minimo', mensaje: 'El stock mínimo debe ser ≥ 0.' });

  if (errores.length > 0) return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
  next();
};

const validarActualizarProducto = (req, res, next) => {
  const errores = [];
  const { nombre, precio_venta, precio_compra, stock_minimo } = req.body;

  if (nombre !== undefined) {
    if (typeof nombre !== 'string' || nombre.trim().length === 0)
      errores.push({ campo: 'nombre', mensaje: 'El nombre no puede estar vacío.' });
    else if (nombre.trim().length > 150)
      errores.push({ campo: 'nombre', mensaje: 'El nombre no puede superar 150 caracteres.' });
  }

  if (precio_venta !== undefined && (isNaN(Number(precio_venta)) || Number(precio_venta) < 0))
    errores.push({ campo: 'precio_venta', mensaje: 'El precio de venta debe ser ≥ 0.' });

  if (precio_compra !== undefined && (isNaN(Number(precio_compra)) || Number(precio_compra) < 0))
    errores.push({ campo: 'precio_compra', mensaje: 'El precio de compra debe ser ≥ 0.' });

  if (stock_minimo !== undefined && (isNaN(Number(stock_minimo)) || Number(stock_minimo) < 0))
    errores.push({ campo: 'stock_minimo', mensaje: 'El stock mínimo debe ser ≥ 0.' });

  if (errores.length > 0) return res.status(400).json({ mensaje: 'Datos inválidos.', errores });
  next();
};

module.exports = { validarCrearProducto, validarActualizarProducto };
