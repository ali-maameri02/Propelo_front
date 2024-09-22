import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',  // Sets the base path for the production build.
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://propelo.runasp.net',  // Pointing to the backend server for API calls
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',  // Specify the output directory for production build
    sourcemap: false, // Optional: Disable sourcemaps for smaller production files
  },
  resolve: {
    alias: {
      '@': '/src',  // Optional: Aliases if you use absolute imports
    }
  },
})
