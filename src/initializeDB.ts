import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { LogContext, logger } from './logger';

function initializeDB() {
  const dbDir = path.resolve(__dirname, './reddit/data');
  const dbPath = path.resolve(__dirname, './reddit/data/db.sqlite');

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, ''); // Creates an empty file
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      logger(LogContext.Error, `Error connecting to local db: ${err}`);
    }
  });

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS subreddit_cache (
        subreddit TEXT PRIMARY KEY,
        timestamp INTEGER,
        posts TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS post (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        url TEXT,
        communityName TEXT
      );
    `);
  });
}

initializeDB();
