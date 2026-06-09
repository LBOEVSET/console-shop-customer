import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    reporters: ['verbose', 'junit'],
    outputFile: { junit: './test-results.xml' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/app/**/*.tsx', 'src/components/**/*.tsx', 'src/lib/**/*.ts'],
      exclude: [
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/**/layout.tsx',
        'src/lib/api.ts',
        'src/lib/guest.ts',
        'node_modules',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80,
        branches: 65,
      },
    },
  },
})
