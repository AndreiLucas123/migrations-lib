import { assert } from 'chai';
import { describe, it } from 'mocha';
import Database, { Database as DB } from 'better-sqlite3';
import { migrateBetterSQLite3 as migrate } from '../src/runtime/better-sqlite3';

const db = new Database(':memory:');
// const db = new Database('db.db');
db.pragma('journal_mode = WAL');

const migrations = [
  {
    file: '2021-01-01-create-users-table.sql',
    migration: `
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
  },
  {
    file: '2021-01-02-create-posts-table.sql',
    migration: `
    CREATE TABLE posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
  },
  {
    file: '2021-01-03-create-comments-table.ts',
    migration: (db: DB) => {
      db.exec(
        `
        CREATE TABLE comments (
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
        );
        `,
      );
    },
  },
];

//
//
describe('migrate', () => {
  //
  //
  it('should migrate without errors', () => {
    migrate(db, migrations);
  });

  //
  //
  it('should create migrations table', () => {
    const migrationTable = db
      .prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?')
      .get('table', 'migrations');

    assert.exists(migrationTable);
  });

  //
  //
  it('should insert migrations into migrations table', () => {
    const dbResult = db.prepare('SELECT name FROM migrations').all() as {
      name: string;
    }[];

    const migrationsInTable = dbResult.map((migration) => migration.name);
    const migrationsNames = migrations.map((migration) => migration.file);

    assert.deepEqual(migrationsInTable, migrationsNames);
  });

  //
  //
  it('should execute migrations again and change nothing', () => {
    migrate(db, migrations);

    const dbResult = db.prepare('SELECT name FROM migrations').all() as {
      name: string;
    }[];

    const migrationsInTable = dbResult.map((migration) => migration.name);
    const migrationsNames = migrations.map((migration) => migration.file);

    assert.deepEqual(migrationsInTable, migrationsNames);
  });

  //
  //
  it('should throw error if migrations are corrupted', () => {
    assert.throws(() => {
      migrate(db, [
        {
          file: '2021-01-01-create-random-table.sql',
          migration: `
        CREATE TABLE random_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
        );`,
        },
      ]);
    });
  });
});
