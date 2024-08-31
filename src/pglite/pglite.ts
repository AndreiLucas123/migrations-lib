import type { PGlite } from '@electric-sql/pglite';
import type { Migration } from '../types';

//
//

export async function migratePGLite(
  db: PGlite,
  migrations: Migration<PGlite>[],
) {
  // Get current date in format YYYY-MM-DDTHH:mm:ss.sssZ and remove the .sss
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  //

  await db.transaction(async (client) => {
    //
    const {
      rows: [migrationTable],
    } = await client.sql<string>`
SELECT table_name
FROM information_schema.tables
WHERE table_schema = current_schema()
  AND table_type = 'BASE TABLE';
`;

    // If migrations table doesn't exist, create it
    if (!migrationTable) {
      await client.sql`
CREATE TABLE migrations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL
);
`;
    }

    // Get all migrations from migrations table
    const { rows: migrationsInTable } = await client.sql<string>`
SELECT name
FROM migrations;
`;

    const newMigrationsNames = migrations.map((migration) => migration.file);

    // Check if migrations in migrations table are the same as migrations
    // passed to the function
    for (let i = 0; i < migrationsInTable.length; i++) {
      if (migrationsInTable[i] !== newMigrationsNames[i]) {
        throw new Error(
          `Migrations are probably corrupted. Migrations in migrations table are not the same as migrations passed to the migratePGLite() function.`,
        );
      }
    }

    for (let i = 0; i < migrations.length; i++) {
      const { file: migrationName, migration: migrationContent } = migrations[i];

      if (!migrationsInTable[i]) {
      if (typeof migrationContent === 'string') {
        db.exec(migrationContent);
      } else {
        migrationContent(db);
      }

      await client.sql`
INSERT INTO migrations (name, date)
VALUES (${migrationName}, ${date});
    `;
      }
    }
  });
}
