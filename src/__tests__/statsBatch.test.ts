import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// vi.mock is hoisted to the top of the file, so mockPost must be declared
// with vi.hoisted() to be accessible inside the factory.
const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }))

vi.mock('@/lib/api', () => ({
  default: { post: mockPost },
}))

// Re-import the module fresh each test so the singleton queue is reset
let queueStat: (event: any) => void

describe('statsBatch', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockPost.mockResolvedValue({})
    // Reset module so queue and flushTimer are cleared between tests
    vi.resetModules()
    const mod = await import('@/lib/statsBatch')
    queueStat = mod.queueStat
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not POST immediately on queueStat', () => {
    queueStat({ entityType: 'PRODUCT', entityId: 'p1', eventType: 'SEE' })
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('POSTs after 2-second flush interval', async () => {
    queueStat({ entityType: 'PRODUCT', entityId: 'p1', eventType: 'SEE' })
    await vi.advanceTimersByTimeAsync(2000)
    expect(mockPost).toHaveBeenCalledWith('/statistics/batch', {
      events: [{ entityType: 'PRODUCT', entityId: 'p1', eventType: 'SEE' }],
    })
  })

  it('batches multiple events into a single POST', async () => {
    queueStat({ entityType: 'PRODUCT', entityId: 'p1', eventType: 'SEE' })
    queueStat({ entityType: 'PRODUCT', entityId: 'p2', eventType: 'CLICK' })
    queueStat({ entityType: 'ARTICLE', entityId: 'a1', eventType: 'VIEW' })
    await vi.advanceTimersByTimeAsync(2000)
    expect(mockPost).toHaveBeenCalledTimes(1)
    expect(mockPost).toHaveBeenCalledWith('/statistics/batch', {
      events: expect.arrayContaining([
        expect.objectContaining({ entityId: 'p1' }),
        expect.objectContaining({ entityId: 'p2' }),
        expect.objectContaining({ entityId: 'a1' }),
      ]),
    })
  })

  it('does not POST when queue is empty after flush', async () => {
    // Trigger flush with nothing in the queue
    await vi.advanceTimersByTimeAsync(2000)
    expect(mockPost).not.toHaveBeenCalled()
  })

  it('silently ignores POST errors', async () => {
    mockPost.mockRejectedValue(new Error('Network error'))
    queueStat({ entityType: 'PRODUCT', entityId: 'p1', eventType: 'SEE' })
    // Should not throw
    await expect(vi.advanceTimersByTimeAsync(2000)).resolves.not.toThrow()
  })
})
