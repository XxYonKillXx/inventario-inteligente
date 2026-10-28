/**
 * backend/lib/db.js
 * Pool de conexiones con mysql2/promise.
 * Mantiene conexion.js intacto; este módulo es el que usan los controladores.
 */
const mysql = require('mysql2/promise');
const config = require('../config/env');

const pool = mysql.createPool({
  host:     config.db.host,
  user:     config.db.user,
  password: config.db.password,
  database: config.db.database,
  port:     Number(config.db.port),
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '-05:00',
  charset:            'utf8mb4',
});

/**
 * Ejecuta una consulta con parámetros.
 * @param {string} sql
 * @param {any[]} params
 * @returns {Promise<any[]>}
 */
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Obtiene una conexión individual para manejar transacciones manualmente.
 * @returns {Promise<mysql.PoolConnection>}
 */
async function getConnection() {
  return pool.getConnection();
}

module.exports = { query, getConnection, pool };
