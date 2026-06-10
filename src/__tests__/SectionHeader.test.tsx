import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SectionHeader from '@/components/ui/SectionHeader'

describe('SectionHeader', () => {
  it('renders the title', () => {
    render(<SectionHeader title="Featured Games" />)
    expect(screen.getByText('Featured Games')).toBeInTheDocument()
  })

  it('renders the View All link', () => {
    render(<SectionHeader title="New Arrivals" />)
    expect(screen.getByText(/view all/i)).toBeInTheDocument()
  })

  it('renders different titles correctly', () => {
    const { rerender } = render(<SectionHeader title="Action" />)
    expect(screen.getByText('Action')).toBeInTheDocument()
    rerender(<SectionHeader title="RPG" />)
    expect(screen.getByText('RPG')).toBeInTheDocument()
  })
})
