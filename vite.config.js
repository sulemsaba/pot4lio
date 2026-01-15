import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({

  plugins: [vue()],
  server: {
    port: 3000,
    host: true,
    open: true,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
  

})
