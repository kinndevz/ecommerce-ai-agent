import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/customer': path.resolve(__dirname, './src/customer'),
      '@/admin': path.resolve(__dirname, './src/admin'),
    },
  },
})
