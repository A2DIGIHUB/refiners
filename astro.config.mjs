import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';

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