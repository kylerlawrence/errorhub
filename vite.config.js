import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/errorhub/', // use your repo name here
  plugins: [react()],
})
