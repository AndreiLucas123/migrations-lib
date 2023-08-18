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
  //  rollup-plugin-migrations
  {
    input: './src/rollup-plugin/index.ts',
    output: {
      file: './dist/rollup-plugin-migrations.js',
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
    input: './dist/types/rollup-plugin/index.d.ts',
    output: { file: 'dist/rollup-plugin-migrations.d.ts', format: 'es' },
    plugins: [dts()],
  },
];
