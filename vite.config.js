// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // This block correctly handles the date-fns-tz package
  optimizeDeps: {
    exclude: ['date-fns-tz'],
  },
  base: '/',
});