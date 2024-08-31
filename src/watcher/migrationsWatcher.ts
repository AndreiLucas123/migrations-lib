import type { Migration } from '../types';
import { basename } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { type LoggerMigrations, consoleLogger } from './logger';
import chokidar from 'chokidar';

//
//

type FileWatched = {
  name: string;
  path: string;
  content: string;
  sql: boolean;
  number: number;
};

//
//

export async function migrationsWatcher(
  directoryToWatch: string,
  logger: LoggerMigrations = consoleLogger,
): Promise<chokidar.FSWatcher> {
  let watcher: chokidar.FSWatcher | null = null;
  let filesWatched: FileWatched[] = [];
  let fileOutput: string | null = null;
  let timeout: any = null;

  const regex = /\d+-.+\.(ts|sql)/;

  //
  //

  function queueOutput() {
    clearTimeout(timeout);
    timeout = setTimeout(generateOutput, 100);
  }

  //
  //

  function sortFiles() {
    filesWatched = filesWatched.sort((a, b) => {
      const aNumber = a.number;
      const bNumber = b.number;
      if (aNumber < bNumber) return -1;
      if (aNumber > bNumber) return 1;
      return 0;
    });
  }

  //
  //

  async function generateOutput() {
    sortFiles();

    let tsFiles = 0;
    let output = '';
    let imports = '';
    let outputObjArray: Migration<any>[] = [];

    for (const file of filesWatched) {
      if (!file.sql) {
        imports += `import ts${++tsFiles} from './${file.name}';\n`;
      }

      outputObjArray.push({ file: file.name, migration: file.content });
    }

    if (tsFiles) {
      output += imports;
      output += '\n';
    }

    let counter = 0;
    output += `export default ${JSON.stringify(
      outputObjArray,
      null,
      2,
    )};`.replace(/"<!-- TS -->"/g, () => `ts${++counter}`);

    if (output === fileOutput) {
      return;
    }

    fileOutput = output;

    const migrationsDir = `${directoryToWatch}/migrations.ts`;

    const fileContent = await readFile(migrationsDir, 'utf-8');

    if (fileContent === output) {
      return;
    }

    await writeFile(migrationsDir, output, 'utf-8');
    logger.info(`file for migrations ${migrationsDir} generated successfully`);
  }

  //
  //

  async function add(path: string) {
    const _basename = basename(path);
    if (!regex.test(_basename)) {
      return false;
    }

    const sql = _basename.endsWith('.sql');

    const number = +_basename.split('-')[0];

    filesWatched.push({
      name: _basename.replace(/\.(ts|sql)$/, ''),
      content: sql ? await readFile(path, 'utf-8') : '<!-- TS -->',
      path,
      sql,
      number,
    });

    queueOutput();

    return true;
  }

  //
  //

  function remove(path: string) {
    filesWatched = filesWatched.filter((file) => file.path !== path);
    queueOutput();
  }

  //
  //

  let _resolve = () => {};

  let promise = new Promise<void>((resolve) => {
    _resolve = resolve;
  });

  //
  //

  watcher = chokidar.watch(`${directoryToWatch}/*.{ts,sql}`, {
    ignored: /(^|[\/\\])\../, // Ignorar arquivos ocultos
    persistent: true,
  });

  watcher
    .on('add', add)
    .on('change', async (path) => {
      remove(path);
      const changed = await add(path);
      if (changed) {
        logger.info('Changed migration file: ' + path);
      }
    })
    .on('unlink', (path) => {
      remove(path);
      logger.info('Removed migration file: ' + path);
    })
    .on('ready', () => {
      _resolve();
      _resolve = () => {};
      promise = null as any;
    });

  //
  //

  await promise;

  //
  //

  return watcher;
}
