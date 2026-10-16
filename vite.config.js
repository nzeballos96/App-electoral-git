import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Permite desplegar en GitHub Pages bajo cualquier subdirectorio
  server: {
    port: 3000,
  },
});
