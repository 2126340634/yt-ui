import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@rao2126340634/yt-ui': path.resolve(__dirname, '../packages/yt-ui')
    }
  },
  optimizeDeps: {
    // 不预构建
    exclude: ['@rao2126340634/yt-ui']
  },
  server: {
    watch: {
      // !不忽略组件库变化监听
      ignored: ['!**/node_modules/@rao2126340634/yt-ui/**']
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        implementation: require('sass')
      }
    }
  }
})
