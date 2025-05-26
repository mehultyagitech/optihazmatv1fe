import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-core': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            'mui-x': ['@mui/x-charts', '@mui/x-data-grid', '@mui/x-date-pickers', '@mui/lab'],
            'toolpad': ['@toolpad/core'],
            'query-state': ['@tanstack/react-query', 'recoil', 'recoil-persist'],
            'form-validation': ['react-hook-form', '@hookform/resolvers', 'joi'],
            'charts': ['chart.js', 'react-chartjs-2'],
            'image-processing': ['react-cropper', 'react-easy-crop', 'react-zoom-pan-pinch'],
            'utils': ['axios', 'date-fns', '@date-io/date-fns', 'lodash.debounce', 'nprogress'],
            'ui-components': ['react-toastify', 'react-paginate', 'toastr']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false, // Disable sourcemaps in production for smaller builds
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@mui/icons-material',
        '@emotion/react',
        '@emotion/styled'
      ]
    }
  }
})
