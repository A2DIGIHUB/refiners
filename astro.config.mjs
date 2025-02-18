import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import compress from 'astro-compress';
import vercel from '@astrojs/vercel/adapter';

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
  ],
  output: 'server',
  adapter: vercel(),
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