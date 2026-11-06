import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  // No GitHub Pages o site fica em https://<usuario>.github.io/logo_ali_locacoes/,
  // então o workflow de deploy define BASE_PATH=/logo_ali_locacoes/. Localmente fica na raiz.
  base: process.env.BASE_PATH ?? '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
