import { defineConfig } from 'tsup';
import { cpSync } from 'fs';

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
    cpSync('dist-ux', 'dist/ux-dist', { recursive: true });
    console.log('✓ Copied UX dist files to dist/ux-dist');
  },
});
