import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: '/https://github.com/noobiecoder75/noobiecoder75.github.io/',
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
