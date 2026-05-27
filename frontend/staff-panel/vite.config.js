import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    fs: {
      // Allow serving files from the shared directory
      allow: ['..'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sessions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/stt': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/llm': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/tts': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/process': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/summary': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/analytics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/branches': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'oxc',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor';
          }
          if (id.includes('node_modules/zustand') || id.includes('node_modules/axios')) {
            return 'state';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react') || id.includes('node_modules/recharts')) {
            return 'ui';
          }
        },
      },
    },
  },
});
