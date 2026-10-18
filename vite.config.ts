import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://deliver-different-testing.github.io/dfrnt-voice-mock/
export default defineConfig({
  base: '/dfrnt-voice-mock/',
  plugins: [react()],
})
