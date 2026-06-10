import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Override next/navigation for this file — we need to control useSearchParams
const { mockSearchParams } = vi.hoisted(() => ({
  mockSearchParams: { value: new URLSearchParams() },
}))

vi.mock('next/navigation', () => ({
  useRouter:       () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname:     () => '/',
  useSearchParams: () => mockSearchParams.value,
}))

import SessionExpiredBanner from '@/components/auth/SessionExpiredBanner'

describe('SessionExpiredBanner', () => {
  beforeEach(() => {
    mockSearchParams.value = new URLSearchParams()
  })

  it('renders nothing when session param is not present', () => {
    const { container } = render(<SessionExpiredBanner />)
    expect(container.firstChild).toBeNull()
  })

  it('shows the banner when session=expired is in the URL', async () => {
    mockSearchParams.value = new URLSearchParams('session=expired')
    render(<SessionExpiredBanner />)
    await waitFor(() =>
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
    )
  })

  it('hides the banner when the close button is clicked', async () => {
    mockSearchParams.value = new URLSearchParams('session=expired')
    render(<SessionExpiredBanner />)
    await waitFor(() => expect(screen.getByText(/session expired/i)).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByText(/session expired/i)).not.toBeInTheDocument()
  })
})
