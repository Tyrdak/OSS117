import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet']
  },
  define: {
    global: 'globalThis',
  },
  server: {
    proxy: {
      '/api/lescagoles': {
        target: 'https://lescagoles.fr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/lescagoles/, ''),
        secure: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const status = proxyRes.statusCode || 0;
            const loc = proxyRes.headers['location'];
            if ((status === 301 || status === 302 || status === 303 || status === 307 || status === 308) && typeof loc === 'string') {
              try {
                const u = new URL(loc, 'https://lescagoles.fr');
                const newPath = '/api/lescagoles' + u.pathname + (u.search || '')
                // Rewrite Location to stay within proxy so browser doesn't leave origin
                proxyRes.headers['location'] = newPath;
              } catch {}
            }
          });
        }
      }
    }
  }
})
