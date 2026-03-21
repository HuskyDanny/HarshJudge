import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/ux'),
      '@/components': resolve(__dirname, './src/ux/components'),
      '@/hooks': resolve(__dirname, './src/ux/hooks'),
      '@/lib': resolve(__dirname, './src/ux/lib'),
      '@/services': resolve(__dirname, './src/ux/services'),
      '@/styles': resolve(__dirname, './src/ux/styles'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['chokidar', 'fs/promises', 'path'],
    },
  },
});
