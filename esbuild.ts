import * as esbuild from 'esbuild';

//
//  Build the project
//

await esbuild.build({
  entryPoints: ['./src/rollup-plugin/index.ts'],
  bundle: true,
  outfile: 'rollup-plugin-migrations/index.js',
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
