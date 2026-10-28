/**
 * backend/controllers/recetas.controller.js
 * CRUD de recetas y detalle_receta usando la tabla existente de productos como referencia.
 */
const { query, getConnection } = require('../lib/db');

function normalizarNumero(valor, fallback = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : fallback;
}

function normalizarEstado(valor) {
  const texto = String(valor ?? '').trim().toUpperCase();
  if (texto === 'ACTIVA' || texto === '1' || texto === 'TRUE') return 1;
  if (texto === 'INACTIVA' || texto === '0' || texto === 'FALSE') return 0;
  return Number(valor ?? 1) === 0 ? 0 : 1;
}

function estadoComoSql(valor) {
  return normalizarEstado(valor) === 1 ? 'ACTIVA' : 'INACTIVA';
}

function normalizarUnidad(valor) {
  return String(valor ?? '').trim().toLowerCase().replace(/\s+/g, '');
}

function obtenerUnidadVista(unidadInventario) {
  const inventario = normalizarUnidad(unidadInventario || 'unidad');
  if (inventario === 'kg') return 'g';
  if (inventario === 'litro' || inventario === 'litros' || inventario === 'l') return 'ml';
  return inventario || 'unidad';
}

function convertirVistaAInventario(cantidad, unidadInventario, unidadVista) {
  const valor = normalizarNumero(cantidad, 0);
  const inventario = normalizarUnidad(unidadInventario);
  const vista = normalizarUnidad(unidadVista || obtenerUnidadVista(inventario));

  if (inventario === 'kg') {
    if (vista === 'g' || vista === 'gramos') return valor / 1000;
    return valor;
  }

  if (inventario === 'litro' || inventario === 'litros' || inventario === 'l') {
    if (vista === 'ml' || vista === 'mililitro' || vista === 'mililitros') return valor / 1000;
    return valor;
  }

  return valor;
}

function convertirInventarioAVista(cantidad, unidadInventario) {
  const valor = normalizarNumero(cantidad, 0);
  const inventario = normalizarUnidad(unidadInventario);

  if (inventario === 'kg') {
    return { cantidad: valor * 1000, unidad: 'g' };
  }

  if (inventario === 'litro' || inventario === 'litros' || inventario === 'l') {
    return { cantidad: valor * 1000, unidad: 'ml' };
  }

  return { cantidad: valor, unidad: inventario || 'unidad' };
}


function normalizarUnidadCantidad(item, producto) {
  const cantidad = normalizarNumero(item.cantidad, 0);

  const unidadInventario = normalizarUnidad(
    producto?.unidad_medida || 'unidad'
  );

  // Si el frontend no envía la unidad, se asume que
  // la cantidad ya está expresada en la unidad del inventario.
  const unidadVistaRecibida = item.unidad_vista || item.unidad_medida;

  if (!unidadVistaRecibida) {
    return cantidad;
  }

  const unidadVista = normalizarUnidad(unidadVistaRecibida);

  return convertirVistaAInventario(
    cantidad,
    unidadInventario,
    unidadVista
  );
}


const listar = async (req, res, next) => {
  const { busqueda, activo } = req.query;
  try {
    let sql = `
      SELECT r.id, r.nombre, r.descripcion, r.precio_venta, r.estado, r.fecha_creacion, r.fecha_actualizacion,
             (SELECT COUNT(*) FROM detalle_receta dr WHERE dr.receta_id = r.id) AS total_ingredientes,
             (SELECT COALESCE(SUM(p.precio_compra * dr.cantidad), 0)
              FROM detalle_receta dr
              JOIN productos p ON p.id = dr.producto_id
              WHERE dr.receta_id = r.id) AS costo_estimado
      FROM recetas r
      WHERE 1=1
    `;
    const params = [];

    if (busqueda) {
      sql += ' AND r.nombre LIKE ?';
      params.push(`%${busqueda}%`);
    }
    if (activo !== undefined) {
      sql += ' AND r.estado = ?';
      params.push(Number(activo) === 1 ? 'ACTIVA' : 'INACTIVA');
    }

    sql += ' ORDER BY r.nombre ASC';

    const rows = await query(sql, params);
    const recetaIds = rows.map((r) => r.id);
    let ingredientesPorReceta = {};

    if (recetaIds.length > 0) {
      const placeholders = recetaIds.map(() => '?').join(',');
      const ingredientes = await query(
        `SELECT dr.receta_id, dr.producto_id, dr.cantidad, p.nombre AS producto_nombre, p.unidad_medida
         FROM detalle_receta dr
         JOIN productos p ON p.id = dr.producto_id
         WHERE dr.receta_id IN (${placeholders})
         ORDER BY dr.receta_id, p.nombre ASC`,
        recetaIds
      );

      for (const ing of ingredientes) {
        if (!ingredientesPorReceta[ing.receta_id]) ingredientesPorReceta[ing.receta_id] = [];
        ingredientesPorReceta[ing.receta_id].push({
          producto_id: Number(ing.producto_id),
          producto_nombre: ing.producto_nombre,
          unidad_medida: ing.unidad_medida,
          cantidad: Number(ing.cantidad),
        });
      }
    }

    res.json(rows.map((r) => ({
      ...r,
      costo_estimado: Number(r.costo_estimado || 0),
      total_ingredientes: Number(r.total_ingredientes || 0),
      estado: normalizarEstado(r.estado),
      ingredientes: ingredientesPorReceta[r.id] || [],
    })));
  } catch (err) {
    next(err);
  }
};

const obtener = async (req, res, next) => {
  try {
    const [receta] = await query(
      `SELECT r.*
        FROM recetas r
        WHERE r.id = ?`,
      [req.params.id]
    );

    if (!receta) {
      return res.status(404).json({ mensaje: 'Receta no encontrada.' });
    }

    const ingredientes = await query(
      `SELECT dr.id, dr.receta_id, dr.producto_id, p.nombre AS producto_nombre,
              p.unidad_medida, p.precio_compra, dr.cantidad,
              (p.precio_compra * dr.cantidad) AS costo_parcial
       FROM detalle_receta dr
       JOIN productos p ON p.id = dr.producto_id
       WHERE dr.receta_id = ?
       ORDER BY p.nombre ASC`,
      [req.params.id]
    );

    const costoEstimado = ingredientes.reduce((sum, item) => sum + Number(item.costo_parcial || 0), 0);

    res.json({
      ...receta,
      estado: normalizarEstado(receta.estado),
      costo_estimado: Number(costoEstimado),
      ingredientes: ingredientes.map((item) => ({
        ...item,
        cantidad: Number(item.cantidad),
        costo_parcial: Number(item.costo_parcial || 0),
      })),
    });
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  const { nombre, descripcion, precio_venta, activa = 1, ingredientes = [] } = req.body;

  if (!nombre || !String(nombre).trim()) {
    return res.status(400).json({ mensaje: 'El nombre de la receta es obligatorio.' });
  }
  if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
    return res.status(400).json({ mensaje: 'Debe incluir al menos un ingrediente.' });
  }
  if (normalizarNumero(precio_venta, 0) <= 0) {
    return res.status(400).json({ mensaje: 'El precio de venta debe ser mayor que cero.' });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const nombres = new Set();
    for (const item of ingredientes) {
      if (!item.producto_id) {
        throw new Error('Cada ingrediente requiere un producto válido.');
      }
      const [[producto]] = await conn.execute('SELECT id, unidad_medida FROM productos WHERE id = ?', [Number(item.producto_id)]);
      if (!producto) {
        throw new Error('El producto del ingrediente no existe.');
      }
      const cantidad = normalizarUnidadCantidad(item, producto);

      console.log('DEBUG INGREDIENTE:', {
  producto_id: item.producto_id,
  cantidad_recibida: item.cantidad,
  unidad_vista: item.unidad_vista,
  unidad_medida: item.unidad_medida,
  unidad_inventario: producto.unidad_medida,
  cantidad_convertida: cantidad
});



        if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error(
            `La cantidad del ingrediente ${producto.id} debe ser mayor que cero.`
        );
        }

        const cantidadRedondeada = Number(cantidad.toFixed(3));

        if (cantidadRedondeada <= 0) {
        throw new Error(
            'La cantidad es demasiado pequeña para almacenarse con tres decimales.'
        );
        }

        item.cantidad_inventario = cantidadRedondeada;

      if (nombres.has(Number(item.producto_id))) {
        throw new Error('No se puede repetir el mismo producto en una receta.');
      }
      nombres.add(Number(item.producto_id));
      item.cantidad_inventario = cantidad;
    }

    const estadoReceta = estadoComoSql(activa);
    const [result] = await conn.execute(
      `INSERT INTO recetas (nombre, descripcion, precio_venta, estado)
       VALUES (?, ?, ?, ?)`,
      [String(nombre).trim(), descripcion ? String(descripcion).trim() : null, normalizarNumero(precio_venta), estadoReceta]
    );

    const recetaId = result.insertId;

    for (const item of ingredientes) {
      const productoId = Number(item.producto_id);
      await conn.execute(
        'INSERT INTO detalle_receta (receta_id, producto_id, cantidad) VALUES (?, ?, ?)',
        [recetaId, productoId, normalizarNumero(item.cantidad_inventario, 0)]
      );
    }

    await conn.commit();

    const [[recetaCreada]] = await conn.execute('SELECT * FROM recetas WHERE id = ?', [recetaId]);
    res.status(201).json({
      ...recetaCreada,
      mensaje: 'Receta creada correctamente.',
      estado: normalizarEstado(recetaCreada.estado),
    });
  } catch (err) {
    await conn.rollback();
    if (err.message && err.message.includes('repetido')) {
      return res.status(400).json({ mensaje: err.message });
    }
    next(err);
  } finally {
    conn.release();
  }
};

const actualizar = async (req, res, next) => {
  const { nombre, descripcion, precio_venta, activa, ingredientes = [] } = req.body;
  const { id } = req.params;

  if (!nombre || !String(nombre).trim()) {
    return res.status(400).json({ mensaje: 'El nombre de la receta es obligatorio.' });
  }
  if (!Array.isArray(ingredientes) || ingredientes.length === 0) {
    return res.status(400).json({ mensaje: 'Debe incluir al menos un ingrediente.' });
  }
  if (normalizarNumero(precio_venta, 0) <= 0) {
    return res.status(400).json({ mensaje: 'El precio de venta debe ser mayor que cero.' });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const [[recetaActual]] = await conn.execute('SELECT * FROM recetas WHERE id = ? FOR UPDATE', [id]);
    if (!recetaActual) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'Receta no encontrada.' });
    }

    const productosSet = new Set();
    for (const item of ingredientes) {
      if (!item.producto_id) {
        throw new Error('Cada ingrediente requiere un producto válido.');
      }
      const producto = await conn.query('SELECT id, unidad_medida FROM productos WHERE id = ?', [Number(item.producto_id)]);
      if (!producto[0]?.[0]) {
        throw new Error('El producto del ingrediente no existe.');
      }
      const cantidad = normalizarNumero(item.cantidad, 0);
      const vista = item.unidad_vista || item.unidad_medida || producto[0][0].unidad_medida;
      const cantidadInventario = convertirVistaAInventario(cantidad, producto[0][0].unidad_medida, vista);
      if (cantidadInventario <= 0) {
        throw new Error('La cantidad de cada ingrediente debe ser mayor que cero.');
      }
      const productoId = Number(item.producto_id);
      if (productosSet.has(productoId)) {
        throw new Error('No se puede repetir el mismo producto en una receta.');
      }
      productosSet.add(productoId);
      item.cantidad_inventario = cantidadInventario;
    }

    const estadoReceta = estadoComoSql(activa);
    await conn.execute(
      `UPDATE recetas
       SET nombre = ?, descripcion = ?, precio_venta = ?, estado = ?
       WHERE id = ?`,
      [String(nombre).trim(), descripcion ? String(descripcion).trim() : null, normalizarNumero(precio_venta), estadoReceta, id]
    );

    await conn.execute('DELETE FROM detalle_receta WHERE receta_id = ?', [id]);

    for (const item of ingredientes) {
      await conn.execute(
        'INSERT INTO detalle_receta (receta_id, producto_id, cantidad) VALUES (?, ?, ?)',
        [id, Number(item.producto_id), normalizarNumero(item.cantidad_inventario, 0)]
      );
    }

    await conn.commit();

    const [[recetaActualizada]] = await conn.execute('SELECT * FROM recetas WHERE id = ?', [id]);
    res.json({
      ...recetaActualizada,
      mensaje: 'Receta actualizada correctamente.',
      estado: normalizarEstado(recetaActualizada.estado),
    });
  } catch (err) {
    await conn.rollback();
    if (err.message && err.message.includes('repetido')) {
      return res.status(400).json({ mensaje: err.message });
    }
    next(err);
  } finally {
    conn.release();
  }
};

const cambiarEstado = async (req, res, next) => {
  const { estado } = req.body;
  try {
    const valor = normalizarEstado(estado);
    const [receta] = await query('SELECT id, nombre, estado FROM recetas WHERE id = ?', [req.params.id]);
    if (!receta) {
      return res.status(404).json({ mensaje: 'Receta no encontrada.' });
    }

    await query('UPDATE recetas SET estado = ? WHERE id = ?', [valor === 1 ? 'ACTIVA' : 'INACTIVA', req.params.id]);
    res.json({
      mensaje: `Receta ${valor === 1 ? 'activada' : 'inactivada'} correctamente.`,
      estado: valor,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };
