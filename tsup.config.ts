import { defineConfig } from 'tsup';
import { cpSync, existsSync } from 'fs';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    'dashboard-worker': 'src/services/dashboard-worker.ts',
  },
  format: ['esm'],
  target: 'node18',
  clean: true,
  sourcemap: true,
  splitting: false,
  onSuccess: async () => {
    if (existsSync('dist-ux')) {
      cpSync('dist-ux', 'dist/ux-dist', { recursive: true });
      console.log('✓ Copied UX dist files to dist/ux-dist');
    } else {
      console.log(
        '⚠ dist-ux not found — run "pnpm build:ux" first for dashboard support'
      );
    }
  },
});
