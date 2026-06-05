"use client"

import { useRef, useEffect, useCallback } from "react"
import { queueStat } from "@/lib/statsBatch"

type EntityType = "PRODUCT" | "ARTICLE" | "EVENT" | "MERCHANDISE"
type EventType  = "SEE" | "VIEW" | "CLICK"

interface TrackOptions {
  entityType:   EntityType
  entityId:     string
  userId?:      string
  /** Milliseconds of continuous viewport visibility before a VIEW is fired (default: 3000) */
  viewDwellMs?: number
}

/**
 * Fires SEE when the element enters the viewport, VIEW after `viewDwellMs`
 * of continuous visibility, and provides a `trackClick` callback.
 *
 * Returns a ref to attach to the element you want to observe.
 *
 * Usage:
 *   const { ref, trackClick } = useTrack({ entityType: "PRODUCT", entityId: id })
 *   <div ref={ref} onClick={() => { trackClick(); router.push(...) }}>
 *
 * The guestId is sent automatically by the backend via the guest cookie — no
 * need to pass it explicitly from the client.
 */
export function useTrack({
  entityType,
  entityId,
  userId,
  viewDwellMs = 3000,
}: TrackOptions) {
  const ref          = useRef<HTMLDivElement>(null)
  const seeFired     = useRef(false)
  const viewFired    = useRef(false)
  const dwellTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fire = useCallback(
    (eventType: EventType) => {
      // Events are queued and flushed in a single batch request every 2 seconds
      // instead of firing one HTTP request per product — prevents rate limit floods.
      queueStat({ entityType, entityId, eventType, userId })
    },
    [entityType, entityId, userId],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // SEE — fires once per mount
          if (!seeFired.current) {
            seeFired.current = true
            fire("SEE")
          }

          // VIEW — fires once after dwell time
          if (!viewFired.current) {
            dwellTimer.current = setTimeout(() => {
              if (!viewFired.current) {
                viewFired.current = true
                fire("VIEW")
              }
            }, viewDwellMs)
          }
        } else {
          // Scrolled out of view — cancel pending VIEW dwell timer
          if (dwellTimer.current) {
            clearTimeout(dwellTimer.current)
            dwellTimer.current = null
          }
        }
      },
      { threshold: 0.4 }, // at least 40% visible before counting
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (dwellTimer.current) clearTimeout(dwellTimer.current)
    }
  }, [fire, viewDwellMs])

  const trackClick = useCallback(() => {
    fire("CLICK")
  }, [fire])

  return { ref, trackClick }
}
