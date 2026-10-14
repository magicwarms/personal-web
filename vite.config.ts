import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    // Hashed bundles and fonts go here, apart from the unhashed files copied
    // from public/assets, so the server can cache the folder for a year.
    assetsDir: '_app',
  },
  server: {
    // Forwards the contact endpoint to the API process during development, so
    // the front end can use the same relative '/api/contact' path it uses in
    // production. Keeps any host or credential out of the browser bundle.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
