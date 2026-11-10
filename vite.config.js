import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The site is served from the root of its custom domain
// (https://dj.pixelstreamsystems.co.za/), so assets load from "/".
// Without a custom domain it would need base: '/DJRun/' (https://<user>.github.io/DJRun/).
export default defineConfig({
  plugins: [react()],
  base: '/',
});
