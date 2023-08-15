import { Database as DB } from 'better-sqlite3';

//
//

export default function migrate(db: DB) {
  db.exec(
    `CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE posts_comments (
      post_id INTEGER NOT NULL,
      comment_id INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts (id),
      FOREIGN KEY (comment_id) REFERENCES comments (id)
    );`,
  );
}
