import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The setup guide tells people to open http://localhost:5173, so pin that port and
// use strictPort: without it Vite quietly falls back to 5174 when 5173 is busy, and
// the reader opens the documented URL to find something else serving there.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, open: false },
  preview: { port: 5173, strictPort: true },
})
