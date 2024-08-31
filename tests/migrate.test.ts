import Database, { type Database as DB } from 'better-sqlite3';
import { migrateBetterSQLite3 as migrate } from '../src/better-sqlite3/better-sqlite3';
import test, { expect } from '@playwright/test';

const migrations = [
  {
    file: '2021-01-01-create-users-table.sql',
    migration: `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
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
      id SERIAL PRIMARY KEY,
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
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE posts_comments (
          post_id SERIAL PRIMARY KEY,
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
test.describe('migrate', () => {
  //
  //
  test('should migrate without errors', () => {
    const db = new Database(':memory:');

    migrate(db, migrations);
  });

  //
  //
  test('should create migrations table', () => {
    const db = new Database(':memory:');

    migrate(db, migrations);

    const migrationTable = db
      .prepare('SELECT name FROM sqlite_master WHERE type = ? AND name = ?')
      .get('table', 'migrations');

    expect(migrationTable).toBeTruthy();
  });

  //
  //
  test('should insert migrations into migrations table', () => {
    const db = new Database(':memory:');
    
    migrate(db, migrations);

    const dbResult = db.prepare('SELECT name FROM migrations').all() as {
      name: string;
    }[];

    const migrationsInTable = dbResult.map((migration) => migration.name);
    const migrationsNames = migrations.map((migration) => migration.file);

    expect(migrationsInTable).toEqual(migrationsNames);
  });

  //
  //
  test('should execute migrations again and change nothing', () => {
    const db = new Database(':memory:');

    migrate(db, migrations);

    const dbResult = db.prepare('SELECT name FROM migrations').all() as {
      name: string;
    }[];

    const migrationsInTable = dbResult.map((migration) => migration.name);
    const migrationsNames = migrations.map((migration) => migration.file);

    expect(migrationsInTable).toEqual(migrationsNames);
  });

  //
  //
  test('should throw error if migrations are corrupted', () => {
    const db = new Database(':memory:');

    expect(() => {
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
    }).toThrowError();
  });
});
