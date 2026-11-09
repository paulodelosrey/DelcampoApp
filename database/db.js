// ==============================================================================
// DELCAMPOAPP - CONECTOR DE BASE DE DATOS SQLITE3
// Soporta 'node:sqlite' nativo (Node 22+) y 'better-sqlite3'
// Modo de journaling DELETE para mantener la base de datos limpia y autocontenida
// ==============================================================================

const path = require('path');
const fs = require('fs');

const DB_DIR = __dirname;
const DB_FILE = path.join(DB_DIR, 'delcampoapp.db');

// Asegurar que la carpeta database exista
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;
let engineName = '';

function getDatabase() {
  if (dbInstance) return dbInstance;

  try {
    // 1. Priorizar node:sqlite nativo
    const { DatabaseSync } = require('node:sqlite');
    const rawDb = new DatabaseSync(DB_FILE);
    rawDb.exec('PRAGMA foreign_keys = ON;');
    rawDb.exec('PRAGMA journal_mode = DELETE;');
    rawDb.exec('PRAGMA synchronous = NORMAL;');
    engineName = 'SQLite 3 (Node.js native node:sqlite)';

    dbInstance = {
      raw: rawDb,
      engine: engineName,
      path: DB_FILE,
      exec(sql) {
        return rawDb.exec(sql);
      },
      prepare(sql) {
        const stmt = rawDb.prepare(sql);
        return {
          all(...params) {
            return stmt.all(...params);
          },
          get(...params) {
            return stmt.get(...params);
          },
          run(...params) {
            return stmt.run(...params);
          }
        };
      },
      transaction(fn) {
        return (...args) => {
          rawDb.exec('BEGIN IMMEDIATE;');
          try {
            const result = fn(...args);
            rawDb.exec('COMMIT;');
            return result;
          } catch (err) {
            rawDb.exec('ROLLBACK;');
            throw err;
          }
        };
      }
    };
  } catch (nativeErr) {
    // 2. Intentar better-sqlite3 si está presente
    try {
      const Database = require('better-sqlite3');
      const bDb = new Database(DB_FILE);
      bDb.pragma('foreign_keys = ON');
      bDb.pragma('journal_mode = DELETE');
      bDb.pragma('synchronous = NORMAL');
      engineName = 'SQLite 3 (better-sqlite3)';

      dbInstance = {
        raw: bDb,
        engine: engineName,
        path: DB_FILE,
        exec(sql) {
          return bDb.exec(sql);
        },
        prepare(sql) {
          const stmt = bDb.prepare(sql);
          return {
            all(...params) {
              return stmt.all(...params);
            },
            get(...params) {
              return stmt.get(...params);
            },
            run(...params) {
              return stmt.run(...params);
            }
          };
        },
        transaction(fn) {
          return bDb.transaction(fn);
        }
      };
    } catch (betterErr) {
      console.error('Error crítico: No se pudo inicializar ningún motor SQLite.', {
        nativeErr: nativeErr.message,
        betterErr: betterErr.message
      });
      throw new Error('No se pudo inicializar SQLite en este entorno');
    }
  }

  return dbInstance;
}

module.exports = {
  getDatabase,
  DB_FILE
};
