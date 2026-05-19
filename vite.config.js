import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/scenes/**', 'src/main.js']
    }
  },
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
