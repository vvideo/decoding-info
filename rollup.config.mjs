import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      format: 'cjs',
      file: './dist/index.common.cjs'
    },
    plugins: [typescript({ tsconfig: './tsconfig.build.json' })],
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'es',
      file: './dist/index.esm.js'
    },
    plugins: [typescript({ tsconfig: './tsconfig.build.json' })],
  }
];
