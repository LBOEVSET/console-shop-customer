import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const { mockGet, mockSetUser, mockSetLoading, mockSetItems } = vi.hoisted(() => ({
  mockGet:       vi.fn(),
  mockSetUser:   vi.fn(),
  mockSetLoading: vi.fn(),
  mockSetItems:  vi.fn(),
}))

vi.mock('@/lib/api', () => ({ default: { get: mockGet } }))
vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) => selector({ setUser: mockSetUser, setLoading: mockSetLoading }),
}))
vi.mock('@/store/cart.store', () => ({
  useCartStore: (selector: any) => selector({ setItems: mockSetItems }),
}))

import AuthInitializer from '@/components/auth/auth-initializer'

describe('AuthInitializer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders null', () => {
    mockGet.mockResolvedValue({ data: { data: { profile: null, cart: null } } })
    const { container } = render(<AuthInitializer />)
    expect(container.firstChild).toBeNull()
  })

  it('calls setUser and setItems on successful profile fetch', async () => {
    const profile = { id: 'u1', email: 'user@test.com' }
    const cart    = { items: [{ productId: 'p1', quantity: 1 }] }
    mockGet.mockResolvedValue({ data: { data: { profile, cart } } })

    render(<AuthInitializer />)

    await vi.waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(profile))
    expect(mockSetItems).toHaveBeenCalledWith(cart.items)
    expect(mockSetLoading).toHaveBeenCalledWith(false)
  })

  it('calls setUser(null) and setLoading(false) on API error', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'))

    render(<AuthInitializer />)

    await vi.waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(null))
    expect(mockSetLoading).toHaveBeenCalledWith(false)
  })

  it('handles null profile in response gracefully', async () => {
    mockGet.mockResolvedValue({ data: { data: { profile: null, cart: null } } })

    render(<AuthInitializer />)

    await vi.waitFor(() => expect(mockSetUser).toHaveBeenCalledWith(null))
    expect(mockSetItems).toHaveBeenCalledWith([])
  })
})
