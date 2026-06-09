import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '@/components/ui/Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders Previous and Next buttons', () => {
    render(<Pagination page={2} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText(/previous/i)).toBeInTheDocument()
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('Previous button is disabled on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText(/previous/i).closest('button')).toBeDisabled()
  })

  it('Next button is disabled on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />)
    expect(screen.getByText(/next/i).closest('button')).toBeDisabled()
  })

  it('calls onPageChange with page - 1 when Previous clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText(/previous/i))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with page + 1 when Next clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText(/next/i))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('calls onPageChange with specific page number when clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={5} onPageChange={onPageChange} />)
    fireEvent.click(screen.getByText('4'))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('renders all pages when totalPages <= 7', () => {
    render(<Pagination page={1} totalPages={6} onPageChange={vi.fn()} />)
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument()
    }
  })

  it('renders ellipsis for large page ranges', () => {
    render(<Pagination page={5} totalPages={15} onPageChange={vi.fn()} />)
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1)
  })

  it('highlights the current page', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={vi.fn()} />)
    const btn = screen.getByText('3').closest('button')
    expect(btn?.className).toMatch(/bg-fuchsia-600/)
  })

  it('accepts optional className prop', () => {
    const { container } = render(
      <Pagination page={2} totalPages={5} onPageChange={vi.fn()} className="mt-8" />
    )
    expect(container.firstChild).toHaveClass('mt-8')
  })
})
