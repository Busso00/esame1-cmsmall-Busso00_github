import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // This matches the path in the server code
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // During development, proxy API requests to your local server
      '/api': {
        target: 'https://esame1-cmsmall-busso00-github.onrender.com/', // Your backend server address
        changeOrigin: true,
      }
    }
  }
})