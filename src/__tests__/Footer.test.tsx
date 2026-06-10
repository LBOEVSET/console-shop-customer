import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/footer'

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />)
    expect(screen.getByText('Arcade')).toBeInTheDocument()
    expect(screen.getByText('Zenter')).toBeInTheDocument()
  })

  it('renders Shop section heading', () => {
    render(<Footer />)
    expect(screen.getByText('Shop')).toBeInTheDocument()
  })

  it('renders Account section heading', () => {
    render(<Footer />)
    expect(screen.getByText('Account')).toBeInTheDocument()
  })

  it('renders Info section heading', () => {
    render(<Footer />)
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders links to key pages', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: /games/i })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: /merchandise/i })).toHaveAttribute('href', '/merchandise')
    expect(screen.getByRole('link', { name: /my orders/i })).toHaveAttribute('href', '/orders')
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile')
  })

  it('renders copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(/arcadezenter/i)).toBeInTheDocument()
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument()
  })
})
