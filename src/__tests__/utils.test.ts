import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (classname utility)', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters out falsy values', () => {
    expect(cn('foo', undefined, null, false, 'bar')).toBe('foo bar')
  })

  it('handles conditional object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })

  it('deduplicates conflicting Tailwind classes (last wins)', () => {
    // twMerge resolves conflicts — p-4 wins over p-2
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('merges text color conflicts correctly', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('')
  })

  it('handles array syntax from clsx', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})
