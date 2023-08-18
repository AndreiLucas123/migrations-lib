import type { Migration } from '../runtime/types';
import { basename } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { LoggerMigrations, consoleLogger } from './logger';
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

export function generateMigrationsWatcher(
  directoryToWatch: string,
  logger: LoggerMigrations = consoleLogger,
): { start(): void; stop(): void } {
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

    logger.info(`Generating '${migrationsDir}' file...`);
    await writeFile(migrationsDir, output, 'utf-8');
    logger.info(`'${migrationsDir}' file generated successfully`);
  }

  //
  //

  async function add(path: string) {
    const _basename = basename(path);
    if (!regex.test(_basename)) {
      return;
    }

    queueOutput();

    const sql = _basename.endsWith('.sql');

    const number = +_basename.split('-')[0];

    filesWatched.push({
      name: _basename.replace(/\.(ts|sql)$/, ''),
      content: sql ? await readFile(path, 'utf-8') : '<!-- TS -->',
      path,
      sql,
      number,
    });
  }

  //
  //

  function remove(path: string) {
    filesWatched = filesWatched.filter((file) => file.path !== path);
    queueOutput();
  }

  //
  //

  return {
    start() {
      watcher = chokidar.watch(`${directoryToWatch}/*.{ts,sql}`, {
        ignored: /(^|[\/\\])\../, // Ignorar arquivos ocultos
        persistent: true,
      });

      watcher
        .on('add', add)
        .on('change', (path) => {
          remove(path);
          add(path);
          logger.info('Changed migration file: ' + path);
        })
        .on('unlink', (path) => {
          remove(path);
          logger.info('Removed migration file: ' + path);
        });
    },
    stop() {
      clearTimeout(timeout);
      watcher?.close();
    },
  };
}
