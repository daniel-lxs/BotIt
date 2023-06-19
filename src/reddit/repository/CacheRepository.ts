import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { LogContext, LogDomain, logger } from '../../logger';

const dbDir = path.resolve(__dirname, '../data');
const dbPath = path.resolve(__dirname, '../data/cache.sqlite');

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

export class CacheRepository {
  constructor() {
    this.initializeCacheTable();
  }

  private initializeCacheTable(): void {
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

  public async saveCache(subreddit: string, posts: string): Promise<void> {
    const timestamp = Date.now();

    return new Promise<void>((resolve, reject) => {
      db.run(
        `
        REPLACE INTO subreddit_cache (subreddit, timestamp, posts)
        VALUES (?, ?, ?)
        `,
        [subreddit, timestamp, posts],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public async getCache(
    subreddit: string,
    expirationTime: number
  ): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      db.get(
        `
        SELECT timestamp, posts FROM subreddit_cache
        WHERE subreddit = ?
        `,
        [subreddit],
        (error, row: { timestamp: number; posts: string }) => {
          if (error) {
            reject(error);
          } else {
            if (row) {
              const { timestamp, posts } = row;
              const currentTime = Date.now();
              const cacheExpirationTime = timestamp + expirationTime;

              if (currentTime > cacheExpirationTime) {
                // Cache has expired, delete it and return null
                this.deleteCache(subreddit);
                resolve(null);
              } else {
                // Cache is still valid, return the cached data
                resolve(posts);
              }
            } else {
              resolve(null);
            }
          }
        }
      );
    });
  }

  private deleteCache(subreddit: string): void {
    db.run(
      `
      DELETE FROM subreddit_cache
      WHERE subreddit = ?
      `,
      [subreddit]
    );
  }
}
