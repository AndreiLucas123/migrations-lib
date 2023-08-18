import type { Plugin, PluginContext } from 'rollup';
import { LoggerMigrations } from './logger';
import { generateMigrationsWatcher } from './generateMigrationsWatcher';

//
//

export function migrationsPlugin(directoryToWatch: string): Plugin {
  let pluginContext: PluginContext | null = null;

  let logger: LoggerMigrations = {
    info: (message: string) => pluginContext?.info(message),
    warn: (message: string) => pluginContext?.warn(message),
    error: (message: string) => pluginContext?.error(message),
  };

  const watcher = generateMigrationsWatcher(directoryToWatch, logger);

  //
  //

  return {
    name: 'migrations-plugin',

    //
    //

    buildStart() {
      pluginContext = this;
      watcher.start();
    },

    //
    //

    buildEnd() {
      pluginContext = null;
      watcher.stop();
    },
  };
}
