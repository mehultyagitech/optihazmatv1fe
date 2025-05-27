import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // modern browsers, smaller build
    cssCodeSplit: true,
    sourcemap: false,  // disable sourcemaps in production to save memory/time
    chunkSizeWarningLimit: 1000,  // raise warning limit if you get many warnings
    rollupOptions: {
      output: {
        manualChunks: {
          // split vendor chunk for faster caching
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  optimizeDeps: {
    // force optimize only necessary deps to reduce RAM usage
    include: ['react', 'react-dom']
  },
  esbuild: {
    minify: true, // use esbuild minifier, much faster than terser
  },
  server: {
    allowedHosts: true
  }
})
