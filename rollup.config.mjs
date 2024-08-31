import { dts } from 'rollup-plugin-dts';

const config = [
  //
  //  Build the watcher types
  //

  {
    input: './dist/types/watcher/index.d.ts',
    output: { file: 'watcher/index.d.ts', format: 'es' },
    plugins: [dts()],
  },

  //
  //  Build the migrations-lib for better-sqlite3
  //

  {
    input: './dist/types/runtime/better-sqlite3.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
