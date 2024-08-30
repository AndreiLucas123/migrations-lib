import { dts } from 'rollup-plugin-dts';

const config = [
  //
  //  Build the migrations-lib for better-sqlite3
  //

  {
    input: './dist/types/runtime/better-sqlite3.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  //
  //  Build the plugin types
  //

  {
    input: './dist/types/rollup-plugin/index.d.ts',
    output: { file: 'rollup-plugin-migrations/index.d.ts', format: 'es' },
    plugins: [dts()],
  },
];

export default config;
