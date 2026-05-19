import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('phaser')) return 'phaser'
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
