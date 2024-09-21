import * as esbuild from 'esbuild';

//
//  Build the project
//

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  external: ['chokidar', 'node:*'],
});

//
//  Build the databases migrations module
//

await esbuild.build({
  entryPoints: ['./src/better-sqlite3/better-sqlite3.ts'],
  bundle: true,
  outfile: 'better-sqlite3/index.js',
  format: 'esm',
  external: ['better-sqlite3'],
});

await esbuild.build({
  entryPoints: ['./src/pglite/pglite.ts'],
  bundle: true,
  outfile: 'pglite/index.js',
  format: 'esm',
  external: ['@electric-sql/pglite'],
});

await esbuild.build({
  entryPoints: ['./src/bun/bun.ts'],
  bundle: true,
  outfile: 'bun/index.js',
  format: 'esm',
  external: ['bun:*'],
});
