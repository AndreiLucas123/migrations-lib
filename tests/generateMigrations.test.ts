import type chokidar from 'chokidar';
import { assert } from 'chai';
import { describe, it } from 'mocha';
import { generateMigrationsWatcher } from '../src/rollup-plugin/generateMigrationsWatcher';
import { resolve } from 'path';
import { readFileSync } from 'node:fs';

//
//
describe('generateMigrations', () => {
  let watcher: ReturnType<typeof generateMigrationsWatcher> | null = null;

  //
  //

  afterEach(() => {
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

  it('should migrate without errors', async function () {
    watcher = generateMigrationsWatcher(resolve(__dirname, 'migrations-test'));
    watcher.start();

    await new Promise((resolve) => setTimeout(resolve, 200));

    const file = resolve(__dirname, 'migrations-test', 'migrations.ts');
    const fileContent = readFileSync(file, 'utf-8')
      .toString()
      .trim()
      .replace(/\\n/g, '\n')
      .replace(/ +/g, ' ');

    assert.equal(fileContent, fileText);
  });
});
