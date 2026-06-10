import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InsertCoinButton from '@/components/arcade/InsertCoinButton'

describe('InsertCoinButton', () => {
  it('shows INSERT COIN by default', () => {
    render(<InsertCoinButton />)
    expect(screen.getByRole('button')).toHaveTextContent('INSERT COIN')
  })

  it('shows GAME STARTED! after click', () => {
    render(<InsertCoinButton />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('GAME STARTED!')
  })

  it('remains GAME STARTED! on subsequent clicks', () => {
    render(<InsertCoinButton />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button')).toHaveTextContent('GAME STARTED!')
  })
})
