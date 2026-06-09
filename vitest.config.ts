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
    setupFiles: ['./src/__tests__/setup.tsx'],
    reporters: ['verbose', 'junit'],
    outputFile: { junit: './test-results.xml' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Only measure coverage on files that have tests.
      // Expand this list as you add more test files.
      include: [
        'src/lib/getProductPrice.ts',
        'src/lib/utils.ts',
        'src/lib/statsBatch.ts',
        'src/components/product/ProductCard.tsx',
        'src/components/ui/Pagination.tsx',
        'src/components/cart/AddToCartButton.tsx',
        'src/components/auth/LoginModal.tsx',
        'src/components/article/ArticleCard.tsx',
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
