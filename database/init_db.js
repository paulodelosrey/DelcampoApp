// ==============================================================================
// DELCAMPOAPP - INICIALIZACIÓN DE BASE DE DATOS
// Plataforma AgTech de Comercio Justo y Rutas Programadas
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { getDatabase, DB_FILE } = require('./db');

function initializeDatabase(options = {}) {
  const { force = false } = options;
  console.log('------------------------------------------------------------');
  console.log('🌱 [DelCampoApp] Inicializando Base de Datos Embebida SQLite3');
  console.log('------------------------------------------------------------');
  console.log(`📂 Archivo BD: ${DB_FILE}`);

  // Limpiar posibles archivos temporales de WAL si existen
  const shmFile = `${DB_FILE}-shm`;
  const walFile = `${DB_FILE}-wal`;
  if (fs.existsSync(shmFile)) try { fs.unlinkSync(shmFile); } catch (e) {}
  if (fs.existsSync(walFile)) try { fs.unlinkSync(walFile); } catch (e) {}

  const db = getDatabase();
  console.log(`⚙️  Motor activo: ${db.engine}`);

  // 1. Ejecutar Schema DDL
  const schemaPath = path.join(__dirname, 'schema.sql');
  console.log(`📄 Aplicando esquema DDL: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  console.log('✅ Esquema DDL aplicado con éxito (6 tablas con integridad referencial e índices).');

  // 2. Ejecutar Seed DML Nacional
  const seedPath = path.join(__dirname, 'seed.sql');
  console.log(`🌾 Insertando cosechas y datos de productores de Colombia: ${seedPath}`);
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  db.exec(seedSql);
  console.log('✅ Datos semilla nacionales cargados (Caribe / Atlántico, Cundinamarca y Antioquia).');

  printSummary(db);
  console.log('------------------------------------------------------------');
  console.log('🎉 Base de datos consolidada y lista para producción.');
  console.log('------------------------------------------------------------');
  return true;
}

function printSummary(db) {
  const tables = [
    'usuarios',
    'productores_fincas',
    'productos',
    'puntos_aliados',
    'pedidos',
    'detalle_pedidos'
  ];

  console.log('\n📊 Conteo de Registros por Tabla:');
  const counts = {};
  for (const table of tables) {
    const row = db.prepare(`SELECT count(*) as count FROM ${table}`).get();
    counts[table] = row.count;
    console.log(`   - ${table.padEnd(20)}: ${row.count} registros`);
  }
  return counts;
}

if (require.main === module) {
  try {
    initializeDatabase({ force: true });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

module.exports = {
  initializeDatabase,
  printSummary
};
