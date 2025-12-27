import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 👇 新增這段 Server 設定來解決跨域問題
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 後端位址
        changeOrigin: true,
      }
    }
  }
})
