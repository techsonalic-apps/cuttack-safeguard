
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-pwa-assets',
      closeBundle() {
        const files = ['manifest.json', 'sw.js'];
        const distPath = join(process.cwd(), 'dist');
        if (!existsSync(distPath)) {
          mkdirSync(distPath, { recursive: true });
        }
        files.forEach(file => {
          try {
            const src = join(process.cwd(), file);
            const dest = join(distPath, file);
            if (existsSync(src)) {
              writeFileSync(dest, readFileSync(src));
              console.log(`Successfully copied ${file} to dist/`);
            }
          } catch (e) {
            console.error(`Failed to copy ${file}:`, e);
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
});
