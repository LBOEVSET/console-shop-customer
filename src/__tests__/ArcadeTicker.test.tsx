import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ArcadeTicker from '@/components/arcade/ArcadeTicker'

describe('ArcadeTicker', () => {
  it('renders without crashing', () => {
    const { container } = render(<ArcadeTicker />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays hot deals text', () => {
    render(<ArcadeTicker />)
    expect(screen.getByText(/hot deals/i)).toBeInTheDocument()
  })

  it('displays instant delivery text', () => {
    render(<ArcadeTicker />)
    expect(screen.getByText(/instant digital delivery/i)).toBeInTheDocument()
  })
})
