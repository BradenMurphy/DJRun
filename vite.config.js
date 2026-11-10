import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the site from https://<user>.github.io/DJRun/
export default defineConfig({
  plugins: [react()],
  base: '/DJRun/',
});
