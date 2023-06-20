import sqlite3 from 'sqlite3';
import { Post } from '../../lemmy';

export class PostRepository {
  private readonly db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  savePost(post: Post): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO post (title, content, url, communityName)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(
        post.title,
        post.content,
        post.url,
        post.communityName,
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );

      stmt.finalize();
    });
  }

  getPostByUrl(url: string, communityName: string): Promise<Post | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM post WHERE url = ? AND communityName = ?',
        [url, communityName],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as Post | null);
          }
        }
      );
    });
  }
}
