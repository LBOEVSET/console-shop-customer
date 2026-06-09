import { describe, it, expect } from 'vitest'
import { getProductPrice } from '@/lib/getProductPrice'
import type { Product } from '@/types/product'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeProduct(prices: Product['prices']): Product {
  return {
    id: 'p1',
    title: 'Test Game',
    slug: 'test-game',
    description: 'desc',
    stock: 10,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    platformId: 'plat-1',
    categoryId: 'cat-1',
    platform: { id: 'plat-1', name: 'PC' },
    prices,
    categories: [],
    media: [],
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getProductPrice', () => {
  it('returns null when no prices are defined', () => {
    const product = makeProduct([])
    expect(getProductPrice(product, 'TH')).toBeNull()
  })

  it('returns null when no matching region and no US fallback', () => {
    const product = makeProduct([{ region: 'EU', currency: 'EUR', price: 20 }])
    expect(getProductPrice(product, 'TH')).toBeNull()
  })

  it('returns exact region price when available', () => {
    const product = makeProduct([
      { region: 'TH', currency: 'THB', price: 399 },
      { region: 'US', currency: 'USD', price: 10 },
    ])
    const result = getProductPrice(product, 'TH')
    expect(result?.price).toBe(399)
    expect(result?.converted).toBe(false)
  })

  it('converts US price to THB (×35) when TH region has no price', () => {
    const product = makeProduct([{ region: 'US', currency: 'USD', price: 10 }])
    const result = getProductPrice(product, 'TH')
    expect(result?.price).toBe(350)   // 10 × 35
    expect(result?.converted).toBe(true)
  })

  it('converts US salePrice to THB when salePrice exists', () => {
    const product = makeProduct([
      { region: 'US', currency: 'USD', price: 20, salePrice: 10 },
    ])
    const result = getProductPrice(product, 'TH')
    expect(result?.price).toBe(700)       // 20 × 35
    expect(result?.salePrice).toBe(350)   // 10 × 35
    expect(result?.hasDiscount).toBe(true)
  })

  it('falls back to US price for non-TH region', () => {
    const product = makeProduct([{ region: 'US', currency: 'USD', price: 15 }])
    const result = getProductPrice(product, 'EU')
    expect(result?.price).toBe(15)
    expect(result?.converted).toBe(false)
  })

  it('calculates hasDiscount = false when salePrice is undefined', () => {
    const product = makeProduct([{ region: 'US', currency: 'USD', price: 30 }])
    const result = getProductPrice(product, 'US')
    expect(result?.hasDiscount).toBe(false)
    expect(result?.finalPrice).toBe(30)
  })

  it('calculates hasDiscount = false when salePrice is 0', () => {
    const product = makeProduct([{ region: 'US', currency: 'USD', price: 30, salePrice: 0 }])
    const result = getProductPrice(product, 'US')
    expect(result?.hasDiscount).toBe(false)
  })

  it('sets finalPrice to salePrice when there is a discount', () => {
    const product = makeProduct([{ region: 'US', currency: 'USD', price: 40, salePrice: 25 }])
    const result = getProductPrice(product, 'US')
    expect(result?.hasDiscount).toBe(true)
    expect(result?.finalPrice).toBe(25)
  })

  it('calculates discount percentage correctly', () => {
    const product = makeProduct([{ region: 'US', currency: 'USD', price: 100, salePrice: 75 }])
    const result = getProductPrice(product, 'US')
    expect(result?.discountPercent).toBe(25)
  })

  it('rounds discount percentage', () => {
    // (100 - 66) / 100 = 34% rounded
    const product = makeProduct([{ region: 'US', currency: 'USD', price: 100, salePrice: 66 }])
    const result = getProductPrice(product, 'US')
    expect(result?.discountPercent).toBe(34)
  })
})
