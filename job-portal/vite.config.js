import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The setup guide tells people to open http://localhost:5173, so pin that port.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false },
  preview: { port: 5173 },
})
