import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
  },
  {
    entry: { 'qtrobot-sdk': 'src/index.ts' },
    format: ['iife'],
    globalName: 'QTRobotSDK',
    platform: 'browser',
    define: { global: 'globalThis' },
    outExtension: () => ({ js: '.umd.js' }),
    sourcemap: true,
    minify: true,
  },
])
