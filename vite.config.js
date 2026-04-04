import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@monaco-editor') || id.includes('node_modules/monaco-editor')) {
            return 'vendor-monaco'
          }
          if (id.includes('node_modules/@chakra-ui') || id.includes('node_modules/@emotion') || id.includes('node_modules/framer-motion')) {
            return 'vendor-chakra'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
        },
      },
    },
  },
})
