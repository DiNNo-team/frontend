import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Fixed values, whatever each one has in .env.local: with a real Maps key and Map ID the forms would try to
    // load Google Maps, which jsdom cannot do (tests that need the map use LocationMap.fake).
    env: {
      VITE_API_URL: 'http://localhost:3000',
      VITE_USE_MOCKS: 'true',
      VITE_GOOGLE_MAPS_API_KEY: '',
      VITE_GOOGLE_MAPS_MAP_ID: '',
    },
  },
})
