import * as esbuild from 'esbuild';

//
//  Build the project
//

await esbuild.build({
  entryPoints: ['./src/watcher/index.ts'],
  bundle: true,
  outfile: 'watcher/index.js',
  format: 'esm',
  external: ['chokidar', 'node:*'],
});

//
//  Build the http-errors module
//

await esbuild.build({
  entryPoints: ['./src/runtime/better-sqlite3.ts'],
  bundle: true,
  outfile: 'better-sqlite3/index.js',
  format: 'esm',
  external: ['better-sqlite3'],
});
