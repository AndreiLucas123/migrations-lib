import type { Migration } from '../types';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { type LoggerMigrations, consoleLogger } from './logger';
import chokidar, { type WatchOptions } from 'chokidar';

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

export interface MigrationsLibOptions {
  /**
   * Directory to watch
   */
  directoryToWatch: string;

  /**
   * Logger used to log messages
   *
   * @default consoleLogger
   */
  logger?: LoggerMigrations;

  /**
   * Options for chokidar
   */
  chokidar?: WatchOptions;

  /**
   * Whether to watch the files or not
   */
  watch?: boolean;
}

//
//

export async function migrationsWatcher(
  opts: MigrationsLibOptions,
): Promise<chokidar.FSWatcher | null> {
  const {
    directoryToWatch,
    logger = consoleLogger,
    chokidar: chokidarOpts,
    watch = true,
  } = opts;

  let watcher: chokidar.FSWatcher | null = null;
  let filesWatched: FileWatched[] = [];
  let fileOutput: string | null = null;
  let timeout: any = null;

  const regex = /\d+-.+\.(ts|sql)/;

  //
  //

  function queueOutput() {
    clearTimeout(timeout);
    timeout = setTimeout(generateOutput, 50);
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

    const migrationsFile = `${directoryToWatch}/migrations.ts`;

    if (existsSync(migrationsFile)) {
      const fileContent = await fs.readFile(migrationsFile, 'utf-8');

      if (fileContent === output) {
        return;
      }
    }

    await fs.writeFile(migrationsFile, output, 'utf-8');
    logger.info(`file for migrations ${migrationsFile} generated successfully`);
  }

  //
  //

  async function add(filePath: string) {
    const _basename = path.basename(filePath);
    if (!regex.test(_basename)) {
      return false;
    }

    const sql = _basename.endsWith('.sql');

    const number = +_basename.split('-')[0];

    filesWatched.push({
      name: _basename.replace(/\.(ts|sql)$/, ''),
      content: sql ? await fs.readFile(filePath, 'utf-8') : '<!-- TS -->',
      path: filePath,
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
    ...chokidarOpts,
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
      setTimeout(() => {
        _resolve();
        _resolve = () => {};
        promise = null as any;

        if (!filesWatched.length) {
          logger.warn('No migration files found');
        }
      }, 100);
    });

  //
  //

  await promise;

  //
  //

  if (watch) {
    logger.info('Watching for migration files...');
  } else {
    watcher.close();
    watcher = null;
    return null;
  }

  //
  //

  return watcher;
}
