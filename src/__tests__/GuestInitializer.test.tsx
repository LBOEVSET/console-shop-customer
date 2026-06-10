import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

// Control what useAuthStore returns per test
const { mockAuthState } = vi.hoisted(() => ({
  mockAuthState: { user: null as any, loading: false },
}))

vi.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) => selector(mockAuthState),
}))

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

import GuestInitializer from '@/components/auth/GuestInitializer'

describe('GuestInitializer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockResolvedValue({ ok: true })
    mockAuthState.user    = null
    mockAuthState.loading = false
    sessionStorage.clear()
  })

  it('renders null', () => {
    const { container } = render(<GuestInitializer />)
    expect(container.firstChild).toBeNull()
  })

  it('calls guest init fetch when user is null and not already initialized', async () => {
    render(<GuestInitializer />)
    await vi.waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/guest/init'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('does not call fetch when user is logged in', async () => {
    mockAuthState.user = { id: 'u1', email: 'user@test.com' }
    render(<GuestInitializer />)
    await new Promise(r => setTimeout(r, 20))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does not call fetch while auth is still loading', async () => {
    mockAuthState.loading = true
    render(<GuestInitializer />)
    await new Promise(r => setTimeout(r, 20))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does not call fetch a second time when sessionStorage flag is set', async () => {
    sessionStorage.setItem('guestInitialized', '1')
    render(<GuestInitializer />)
    await new Promise(r => setTimeout(r, 20))
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
