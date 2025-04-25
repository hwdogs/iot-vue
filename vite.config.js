import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 配置代理
      '/iot-warehouse': {
        target: 'http://47.113.101.152:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
