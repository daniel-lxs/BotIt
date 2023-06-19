import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { LogContext, LogDomain, logger } from './logger';

function initializeDB() {
  const dbDir = path.resolve(__dirname, './reddit/data');
  const dbPath = path.resolve(__dirname, './reddit/data/cache.sqlite');

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, ''); // Creates an empty file
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      logger(
        LogContext.Error,
        `Error connecting to local db: ${err}`,
        LogDomain.Reddit
      );
    }
  });

  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS subreddit_cache (
        subreddit TEXT PRIMARY KEY,
        timestamp INTEGER,
        posts TEXT
      )
    `
    );
  });
}

initializeDB();
