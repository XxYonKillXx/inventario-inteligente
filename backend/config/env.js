require('dotenv').config();

module.exports = {
  puerto: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secreto: process.env.JWT_SECRET || 'secreto_desarrollo',
    expiracion: process.env.JWT_EXPIRES_IN || '8h',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventario_inteligente',
    port: process.env.DB_PORT || 3306,
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
