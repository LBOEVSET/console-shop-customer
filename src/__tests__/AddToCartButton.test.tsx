import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockAddToCart = vi.fn()
vi.mock('@/store/cart.store', () => ({
  useCartStore: (selector: any) => selector({ addToCart: mockAddToCart }),
}))

vi.mock('@/lib/flyToCart', () => ({
  flyToCart: vi.fn(),
}))

import AddToCartButton from '@/components/cart/AddToCartButton'

describe('AddToCartButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAddToCart.mockResolvedValue(undefined)
  })

  it('renders Add to Cart button', () => {
    render(<AddToCartButton productId="p1" stock={5} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('is disabled when stock is 0', () => {
    render(<AddToCartButton productId="p1" stock={0} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is enabled when stock > 0', () => {
    render(<AddToCartButton productId="p1" stock={3} />)
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('calls addToCart with productId and quantity 1 on click', async () => {
    render(<AddToCartButton productId="prod-123" stock={5} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockAddToCart).toHaveBeenCalledWith('prod-123', 1)
  })

  it('does not call addToCart when stock is 0', () => {
    render(<AddToCartButton productId="p1" stock={0} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockAddToCart).not.toHaveBeenCalled()
  })
})
