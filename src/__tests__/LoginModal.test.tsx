import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockLogin = vi.fn()
vi.mock('@/store/auth.store', () => ({
  useAuthStore: () => ({ login: mockLogin }),
}))

import LoginModal from '@/components/auth/LoginModal'

describe('LoginModal', () => {
  const onSuccess = vi.fn()
  const onClose   = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email/username and password fields', () => {
    render(<LoginModal onSuccess={onSuccess} onClose={onClose} />)
    expect(screen.getByPlaceholderText(/email or username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<LoginModal onSuccess={onSuccess} onClose={onClose} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSuccess when login succeeds', async () => {
    mockLogin.mockResolvedValue({ success: true })
    render(<LoginModal onSuccess={onSuccess} onClose={onClose} />)

    await userEvent.type(screen.getByPlaceholderText(/email or username/i), 'user@test.com')
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'pass123')
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
  })

  it('shows error message when login fails with message', async () => {
    mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' })
    render(<LoginModal onSuccess={onSuccess} onClose={onClose} />)

    await userEvent.type(screen.getByPlaceholderText(/email or username/i), 'user@test.com')
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrong')
    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument())
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('shows fallback error when login throws', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'))
    render(<LoginModal onSuccess={onSuccess} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(screen.getByText('Login failed')).toBeInTheDocument())
  })

  it('has a link to the register page', () => {
    render(<LoginModal onSuccess={onSuccess} onClose={onClose} />)
    const registerLink = screen.getByRole('link', { name: /create an account/i })
    expect(registerLink).toHaveAttribute('href', '/register')
  })
})
