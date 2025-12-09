import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/components/index.ts',
      name: 'YtUI',
      fileName: format => `yt-ui.${format}.js`,
      formats: ['es', 'cjs', 'umd']
    },
    rollupOptions: {
      external: ['vue', '@dcloudio/uni-app'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@dcloudio/uni-app': 'uni'
        }
      }
    },
    minify: 'esbuild'
  }
})
