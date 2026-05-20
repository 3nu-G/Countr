import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('countr.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        checkCount INTEGER,
        crossCount INTEGER,
        accuracy REAL
      );
    `);
  }
  return db;
}

export async function addSession(check: number, cross: number, accuracy: number) {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO sessions (date, checkCount, crossCount, accuracy) VALUES (?, ?, ?, ?)',
    [new Date().toISOString(), check, cross, accuracy]
  );
}

export async function getAllSessions() {
  const database = await getDatabase();
  const rows = await database.getAllAsync('SELECT * FROM sessions ORDER BY date DESC');
  return rows;
}