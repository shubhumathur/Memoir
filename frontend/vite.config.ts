import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:4000',
      '/journal': 'http://localhost:4000',
      '/chat': 'http://localhost:4000',
      '/sentiment': 'http://localhost:4000',
      '/insights': 'http://localhost:4000',
      '/settings': 'http://localhost:4000',
    },
  },
});


