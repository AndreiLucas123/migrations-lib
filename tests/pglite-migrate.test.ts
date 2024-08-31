import { PGlite } from '@electric-sql/pglite';
import { migratePGLite as migrate } from '../src/pglite/pglite';
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
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
  },
  {
    file: '2021-01-02-create-posts-table.sql',
    migration: `
    CREATE TABLE posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,
  },
  {
    file: '2021-01-03-create-comments-table.sql',
    migration: `
    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE posts_comments (
      post_id INTEGER NOT NULL,
      comment_id INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts (id),
      FOREIGN KEY (comment_id) REFERENCES comments (id)
    );`,
  },
];

//
//
test.describe('migrate PGlite', () => {
  //
  //
  test('should migrate without errors', async () => {
    const db = new PGlite();

    await migrate(db, migrations);
  });

  //
  //
  test('should create migrations table', async () => {
    const db = new PGlite();

    await migrate(db, migrations);

    const {
      rows: [{ table_name }],
    } = await db.sql<any>`
SELECT table_name
FROM information_schema.tables
WHERE table_schema = current_schema()
  AND table_type = 'BASE TABLE';`;

    expect(table_name).toBe('migrations');
  });

  //
  //
  test('should insert migrations into migrations table', async () => {
    const db = new PGlite();

    await migrate(db, migrations);

    const { rows: dbResult } = await db.sql<any>`
      SELECT name FROM migrations
    `;
    const migrationsInTable = dbResult.map((migration) => migration.name);
    const migrationsNames = migrations.map((migration) => migration.file);

    expect(migrationsInTable).toEqual(migrationsNames);
  });

  //
  //
  test('should execute migrations again and change nothing', async () => {
    const db = new PGlite();

    await migrate(db, migrations);

    const { rows: dbResult } = await db.sql<any>`
      SELECT name FROM migrations
    `;

    const migrationsInTable = dbResult.map((migration) => migration.name);
    const migrationsNames = migrations.map((migration) => migration.file);
    expect(migrationsInTable).toEqual(migrationsNames);
  });

  //
  //
  test('should throw error if migrations are corrupted', async () => {
    const db = new PGlite();

    await migrate(db, migrations);

    expect(async () => {
      await migrate(db, [
        {
          file: '2021-01-01-create-random-table.sql',
          migration: `
        CREATE TABLE random_table (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );`,
        },
      ]);
    }).rejects.toThrowError();
  });
});
