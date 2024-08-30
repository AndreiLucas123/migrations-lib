import * as esbuild from 'esbuild';

//
//  Build the project
//

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
});

//
//  Build the http-errors module
//

await esbuild.build({
  entryPoints: ['./src/http-errors.ts'],
  bundle: true,
  outfile: 'http-errors/index.js',
  format: 'esm',
});
