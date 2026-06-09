import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockPost = vi.fn()
vi.mock('@/lib/api', () => ({
  default: { post: mockPost },
}))

// Import after mock so the module gets the mocked api
import { queueStat } from '@/lib/statsBatch'

describe('statsBatch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockPost.mockResolvedValue({})
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
