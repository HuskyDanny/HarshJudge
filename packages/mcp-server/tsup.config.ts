import { defineConfig } from 'tsup';
import { cpSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    index: 'src/index.ts',
    'dashboard-worker': 'src/services/dashboard-worker.ts',
  },
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  outDir: 'dist',
  clean: true,
  dts: false, // Skip DTS generation (not needed for MCP server CLI)
  sourcemap: true,
  splitting: false,
  treeshake: true,
  // Bundle @harshjudge packages into the output
  noExternal: [/@harshjudge\/.*/],
  // Skip TypeScript errors during bundling (we'll typecheck separately)
  skipNodeModulesBundle: true,
  // Copy UX dist files after build
  onSuccess: async () => {
    const uxDistSrc = resolve(__dirname, '../ux/dist');
    const uxDistDest = resolve(__dirname, 'dist/ux-dist');

    if (existsSync(uxDistSrc)) {
      if (!existsSync(uxDistDest)) {
        mkdirSync(uxDistDest, { recursive: true });
      }
      cpSync(uxDistSrc, uxDistDest, { recursive: true });
      console.log('✓ Copied UX dist files to dist/ux-dist');
    } else {
      console.warn('⚠ UX dist files not found at', uxDistSrc);
      console.warn('  Run "pnpm --filter @harshjudge/ux build" first');
    }
  },
});
