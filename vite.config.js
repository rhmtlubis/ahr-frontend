import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/sanctum': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined
            }

            if (id.includes('react-router-dom') || id.includes('react-router')) {
              return 'router'
            }

            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor'
            }

            if (id.includes('gsap')) {
              return 'gsap'
            }

            if (id.includes('lucide-react')) {
              return 'icons'
            }

            return 'vendor'
          },
        },
      },
    },
  }
})
