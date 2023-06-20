import sqlite3 from 'sqlite3';

export class CacheRepository {
  private readonly db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  public async saveCache(subreddit: string, posts: string): Promise<void> {
    const timestamp = Date.now();

    return new Promise<void>((resolve, reject) => {
      const stmt = this.db.prepare(`
        REPLACE INTO subreddit_cache (subreddit, timestamp, posts)
        VALUES (?, ?, ?)
      `);

      stmt.run(subreddit, timestamp, posts, (error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  public async getCache(
    subreddit: string,
    expirationTime: number
  ): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      this.db.get(
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
    const stmt = this.db.prepare(`
      DELETE FROM subreddit_cache
      WHERE subreddit = ?
    `);

    stmt.run(subreddit);
    stmt.finalize();
  }
}
