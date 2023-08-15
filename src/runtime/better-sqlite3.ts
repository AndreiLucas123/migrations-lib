import type { Database } from 'better-sqlite3';
import type { Migration } from './types';

//
//

export function migrateBetterSQLite3(
  db: Database,
  migrations: Migration<Database>[],
): void {
  // Get current date in format YYYY-MM-DDTHH:mm:ss.sssZ and remove the .sss
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  //
  db.transaction(() => {
    // Check if migrations table exists
    const migrationTable = db
      .prepare(`SELECT name FROM sqlite_master WHERE type = ? AND name = ?`)
      .pluck()
      .get('table', 'migrations') as string | undefined;

    // If migrations table doesn't exist, create it
    if (!migrationTable) {
      db.prepare(
        `CREATE TABLE migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL);`,
      ).run();
    }

    // Get all migrations from migrations table
    const migrationsInTable = db
      .prepare('SELECT name FROM migrations')
      .all()
      .map((migration: any) => migration.name as string);

    const newMigrationsNames = migrations.map((migration) => migration.file);

    // Check if migrations in migrations table are the same as migrations
    // passed to the function
    for (let i = 0; i < migrationsInTable.length; i++) {
      if (migrationsInTable[i] !== newMigrationsNames[i]) {
        throw new Error(
          `Migrations are probably corrupted. Migrations in migrations table are not the same as migrations passed to the migrate() function.`,
        );
      }
    }

    migrations.forEach((migration, i) => {
      const { file: migrationName, migration: migrationContent } = migration;

      if (!migrationsInTable[i]) {
        if (typeof migrationContent === 'string') {
          db.exec(migrationContent);
        } else {
          migrationContent(db);
        }

        db.prepare('INSERT INTO migrations (name, date) VALUES (?, ?)').run(
          migrationName,
          date,
        );
      }
    });
  })();
}

export * from './utils/better-sqlite3-crud';
