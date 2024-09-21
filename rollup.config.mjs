import { dts } from 'rollup-plugin-dts';

const config = [
  //
  //  Build the watcher types
  //

  {
    input: './dist/types/src/index.d.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()],
  },

  //
  //  Build the migrations-lib for better-sqlite3, pglite and bun
  //

  {
    input: './dist/types/src/better-sqlite3/better-sqlite3.d.ts',
    output: [{ file: 'better-sqlite3/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  {
    input: './dist/types/src/pglite/pglite.d.ts',
    output: [{ file: 'pglite/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  {
    input: './dist/types/src/bun/bun.d.ts',
    output: [{ file: 'bun/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external: ['bun:*'],
  },
];

export default config;
