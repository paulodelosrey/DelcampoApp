// ==============================================================================
// DELCAMPOAPP - SCRIPT DE INICIALIZACIÓN Y POBLADO DE BASE DE DATOS
// Ficha SENA ASTIN: 3186266 | Bitácora 4
// Aprendiz: Paulo Andrés De los Reyes González
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

  const db = getDatabase();
  console.log(`⚙️  Motor activo: ${db.engine}`);

  // Verificar si las tablas ya existen
  const checkTables = db.prepare(
    "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name IN ('usuarios', 'productos', 'pedidos')"
  ).get();

  if (checkTables.count >= 3 && !force) {
    console.log('✅ La base de datos ya contiene las tablas del modelo relacional.');
    printSummary(db);
    return true;
  }

  // 1. Ejecutar Schema DDL
  const schemaPath = path.join(__dirname, 'schema.sql');
  console.log(`📄 Leyendo esquema DDL desde: ${schemaPath}`);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);
  console.log('✅ Esquema DDL aplicado con éxito (6 tablas con integridad referencial e índices).');

  // 2. Ejecutar Seed DML
  const seedPath = path.join(__dirname, 'seed.sql');
  console.log(`🌾 Insertando datos semilla desde: ${seedPath}`);
  const seedSql = fs.readFileSync(seedPath, 'utf8');
  db.exec(seedSql);
  console.log('✅ Datos semilla insertados con éxito (Campesinos, Fincas, Cosechas, Aliados, Pedidos).');

  printSummary(db);
  console.log('------------------------------------------------------------');
  console.log('🎉 Base de datos lista para operar al 100%');
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

// Ejecutar si se llama directamente via CLI (`npm run init-db` o `node database/init_db.js`)
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
