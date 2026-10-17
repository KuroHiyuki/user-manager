import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export function createDB(file = process.env.DB_PATH || '.data/users.db') {
    if(file !== ':memory:') fs.mkdirSync(path.dirname(file), {recursive: true});

    const db = new Database(file);

    db.pragma('journal_mode = WAL');

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`
    )
    return db;
}

//TẠO KẾT NỐI ĐẾN DB