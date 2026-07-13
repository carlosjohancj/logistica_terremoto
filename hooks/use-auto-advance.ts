"use client"

import { useEffect, useState } from "react"

/**
 * Cycles a value through [0, count) every `intervalMs`. The interval
 * restarts on every `active` change, so a manual selection resets the
 * countdown and autoplay always resumes from whichever step was picked.
 */
export function useAutoAdvance(count: number, intervalMs: number) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % count)
    }, intervalMs)
    return () => clearInterval(id)
  }, [active, count, intervalMs])

  return [active, setActive] as const
}
