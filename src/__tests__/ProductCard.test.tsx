import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Product } from '@/types/product'

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({ user: null }),
}))

vi.mock('@/store/currency.store', () => ({
  useCurrencyStore: () => ({ region: 'US', currency: 'USD' }),
}))

vi.mock('@/hooks/useTrack', () => ({
  useTrack: () => ({ ref: { current: null }, trackClick: vi.fn() }),
}))

vi.mock('@/components/cart/AddToCartButton', () => ({
  default: () => <button>Add to Cart</button>,
}))

// ── Import after mocks ────────────────────────────────────────────────────────

import ProductCard from '@/components/product/ProductCard'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const baseProduct: Product = {
  id: 'p1',
  title: 'Awesome Game',
  slug: 'awesome-game',
  description: 'A great game',
  stock: 5,
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  platformId: 'plat-1',
  categoryId: 'cat-1',
  platform: { id: 'plat-1', name: 'PC' },
  prices: [{ region: 'US', currency: 'USD', price: 29.99 }],
  categories: [{ id: 'c1', name: 'Action' }],
  media: [{ id: 'm1', productId: 'p1', type: 'IMAGE', url: '/img.jpg', sortOrder: 0 }],
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders product title', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('Awesome Game')).toBeInTheDocument()
  })

  it('renders a link to the product detail page', () => {
    render(<ProductCard product={baseProduct} />)
    const links = screen.getAllByRole('link')
    expect(links.some(l => l.getAttribute('href') === '/products/awesome-game')).toBe(true)
  })

  it('renders the category tag', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders a discount badge when salePrice is set', () => {
    const discounted: Product = {
      ...baseProduct,
      prices: [{ region: 'US', currency: 'USD', price: 40, salePrice: 20 }],
    }
    render(<ProductCard product={discounted} />)
    expect(screen.getByText(/-50%/)).toBeInTheDocument()
  })

  it('does not render discount badge when no salePrice', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.queryByText(/-%/)).toBeNull()
  })

  it('renders nothing when product has no prices', () => {
    const noPrices: Product = { ...baseProduct, prices: [] }
    const { container } = render(<ProductCard product={noPrices} />)
    expect(container.firstChild).toBeNull()
  })

  it('uses placeholder image when no media', () => {
    const noMedia: Product = { ...baseProduct, media: [] }
    render(<ProductCard product={noMedia} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('/placeholder.png')
  })

  it('uses first IMAGE media url when media is present', () => {
    render(<ProductCard product={baseProduct} />)
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('/img.jpg')
  })

  it('shows Add to Cart button', () => {
    render(<ProductCard product={baseProduct} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })
})
