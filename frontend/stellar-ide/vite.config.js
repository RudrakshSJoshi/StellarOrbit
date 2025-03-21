import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Setup import aliases for cleaner imports
      '@': '/src',
      '@components': '/src/components',
      '@contexts': '/src/contexts',
      '@hooks': '/src/hooks',
      '@services': '/src/services',
      '@utils': '/src/utils'
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Custom configuration for Monaco Editor
  optimizeDeps: {
    include: ['monaco-editor/esm/vs/language/json/json.worker'],
    esbuildOptions: {
      // Ensure proper handling of Monaco workers
      define: {
        'process.env.NODE_ENV': JSON.stringify('development')
      }
    }
  }
});