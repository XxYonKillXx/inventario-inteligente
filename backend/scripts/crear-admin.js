/**
 * backend/scripts/crear-admin.js
 * Ejecutar UNA sola vez para crear el primer usuario administrador.
 *
 * Uso:
 *   node scripts/crear-admin.js
 *
 * O con credenciales personalizadas:
 *   ADMIN_CORREO=mi@correo.com ADMIN_PASS=MiPass123 node scripts/crear-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const bcrypt  = require('bcryptjs');
const mysql   = require('mysql2/promise');

const CORREO   = process.env.ADMIN_CORREO || 'admin@inventario.com';
const PASSWORD = process.env.ADMIN_PASS   || 'Admin123!';
const NOMBRE   = process.env.ADMIN_NOMBRE || 'Administrador';
const APELLIDO = process.env.ADMIN_APELLIDO || 'Sistema';

async function main() {
  console.log('\n🔧 Creando usuario administrador...\n');

  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'inventario_inteligente',
    port:     Number(process.env.DB_PORT || 3306),
  });

  try {
    // Verificar si ya existe un admin
    const [existentes] = await conn.execute(
      "SELECT id FROM usuarios WHERE correo = ?",
      [CORREO]
    );

    if (existentes.length > 0) {
      console.log(`⚠️  Ya existe un usuario con el correo ${CORREO}.`);
      console.log('   Si quieres resetear la contraseña, elimínalo primero en phpMyAdmin.\n');
      process.exit(0);
    }

    const hash = await bcrypt.hash(PASSWORD, 12);

    const [result] = await conn.execute(
      `INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol_id)
       VALUES (?, ?, ?, ?, 1)`,
      [NOMBRE, APELLIDO, CORREO, hash]
    );

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`   ID:       ${result.insertId}`);
    console.log(`   Nombre:   ${NOMBRE} ${APELLIDO}`);
    console.log(`   Correo:   ${CORREO}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log('\n⚠️  CAMBIA la contraseña en tu primera sesión.\n');
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('❌ Error al crear el usuario:', err.message);
  process.exit(1);
});
