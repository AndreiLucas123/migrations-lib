import { generateMigrationsWatcher } from '../src/rollup-plugin/generateMigrationsWatcher';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import test, { expect } from '@playwright/test';

//
//
test.describe('generateMigrations', () => {
  let watcher: ReturnType<typeof generateMigrationsWatcher> | null = null;

  //
  //

  test.afterEach(() => {
    watcher?.stop();
    watcher = null;
  });

  //
  //

  let fileText = `import ts1 from './002-blureal';

export default [
  {
    "file": "001-facal",
    "migration": "CREATE TABLE users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL,\n  password TEXT NOT NULL,\n  created_at TEXT NOT NULL,\n  updated_at TEXT NOT NULL\n);\n"
  },
  {
    "file": "002-blureal",
    "migration": ts1
  }
];`
    .replace(/\\n/g, '\n')
    .replace(/ +/g, ' ');

  //
  //

  test('should migrate without errors', async function () {
    const __dirname = new URL('.', import.meta.url).pathname;
    watcher = generateMigrationsWatcher(resolve(__dirname, 'migrations-test'));
    watcher.start();

    await new Promise((resolve) => setTimeout(resolve, 200));

    const file = resolve(__dirname, 'migrations-test', 'migrations.ts');
    const fileContent = readFileSync(file, 'utf-8')
      .toString()
      .trim()
      .replace(/\\n/g, '\n')
      .replace(/ +/g, ' ');

    expect(fileContent).toBe(fileText);
  });
});
