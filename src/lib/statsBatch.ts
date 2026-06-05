/**
 * Client-side statistics event batcher.
 *
 * Instead of firing one HTTP request per product per event (which floods the
 * rate limiter when many products enter the viewport at once), all events are
 * queued and flushed in a single POST /statistics/batch every FLUSH_INTERVAL_MS.
 *
 * Usage:
 *   import { queueStat } from "@/lib/statsBatch"
 *   queueStat({ entityType: "PRODUCT", entityId: id, eventType: "SEE" })
 */

import api from "@/lib/api"

type EntityType = "PRODUCT" | "ARTICLE" | "EVENT" | "MERCHANDISE"
type EventType  = "SEE" | "VIEW" | "CLICK"

interface StatEvent {
  entityType: EntityType
  entityId:   string
  eventType:  EventType
  userId?:    string
}

const FLUSH_INTERVAL_MS = 2000  // flush every 2 seconds
const MAX_BATCH_SIZE    = 50    // safety cap per flush

const queue: StatEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

async function flush() {
  flushTimer = null
  if (queue.length === 0) return

  // Drain the queue (take up to MAX_BATCH_SIZE, leave the rest for next flush)
  const batch = queue.splice(0, MAX_BATCH_SIZE)

  try {
    await api.post("/statistics/batch", { events: batch })
  } catch {
    // Tracking must never break UX — silently discard on error
  }
}

function scheduleFlush() {
  if (flushTimer !== null) return   // already scheduled
  flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS)
}

export function queueStat(event: StatEvent) {
  queue.push(event)
  scheduleFlush()
}
