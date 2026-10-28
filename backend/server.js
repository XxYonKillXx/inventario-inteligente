require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const config  = require('./config/env');

// ─── Rutas ────────────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth.routes');
const productosRoutes   = require('./routes/productos.routes');
const categoriasRoutes  = require('./routes/categorias.routes');
const recetasRoutes     = require('./routes/recetas.routes');
const ventasRoutes      = require('./routes/ventas.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const comprasRoutes     = require('./routes/compras.routes');
const movimientosRoutes = require('./routes/movimientos.routes');
const alertasRoutes     = require('./routes/alertas.routes');
const dashboardRoutes   = require('./routes/dashboard.routes');
const usuariosRoutes    = require('./routes/usuarios.routes');
const reportesRoutes    = require('./routes/reportes.routes');

// ─── Middlewares de error ─────────────────────────────────────────────────────
const { manejarError, manejarRutaNoEncontrada } = require('./middlewares/error.middleware');

const app = express();

// ─── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors({
  origin:      config.frontendUrl || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ─── Ruta de prueba de conexión MySQL (usa conexion.js legacy) ────────────────
app.get('/api/prueba', (req, res) => {
  const conexion = require('./conexion');
  conexion.query('SELECT 1 AS resultado', (error, resultados) => {
    if (error) return res.status(500).json({ mensaje: 'Error MySQL', error: error.message });
    res.json({ mensaje: 'Conexión MySQL exitosa ✅', datos: resultados });
  });
});

// ─── Endpoints de la API ──────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/productos',   productosRoutes);
app.use('/api/categorias',  categoriasRoutes);
app.use('/api/recetas',     recetasRoutes);
app.use('/api/ventas',      ventasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/compras',     comprasRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/alertas',     alertasRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/usuarios',    usuariosRoutes);
app.use('/api/reportes',    reportesRoutes);

// ─── Manejo de errores ────────────────────────────────────────────────────────
app.use(manejarRutaNoEncontrada);
app.use(manejarError);

// ─── Inicio ───────────────────────────────────────────────────────────────────
const PORT = config.puerto || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 Backend corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${config.nodeEnv}`);
  console.log(`   BD:      ${config.db.database}@${config.db.host}:${config.db.port}\n`);
});

module.exports = app;
