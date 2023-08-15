import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';

//
//

const sharedConfig = {
  watch: {
    clearScreen: false,
    include: 'src/**',
  },
  plugins: [
    esbuild({
      sourceMap: false,
      minify: false,
    }),
  ],
};

//
//

export default [
  //
  //  generateMigrations
  {
    input: './src/generateMigrations.ts',
    output: {
      file: './dist/generateMigrations.js',
      format: 'es',
      sourcemap: false,
    },
    external: ['chokidar', 'node:fs/promises', 'node:path'],
    ...sharedConfig,
  },
  //
  //  better-sqlite3
  {
    input: './src/runtime/better-sqlite3.ts',
    output: {
      file: './dist/better-sqlite3.js',
      format: 'es',
      sourcemap: false,
    },
    external: ['better-sqlite3'],
    ...sharedConfig,
  },
  //
  //  Types generations
  {
    input: './dist/types/runtime/better-sqlite3.d.ts',
    output: { file: 'dist/better-sqlite3.d.ts', format: 'es' },
    plugins: [dts()],
  },
  {
    input: './dist/types/generateMigrations.d.ts',
    output: { file: 'dist/generateMigrations.d.ts', format: 'es' },
    plugins: [dts()],
  },
];
