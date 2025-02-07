import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import compress from 'astro-compress';

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    compress(),
  ],
  build: {
    inlineStylesheets: 'auto',
    splitting: true,
    prerender: true
  },
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom'],
          }
        }
      }
    }
  }
});