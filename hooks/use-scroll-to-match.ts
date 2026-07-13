"use client"

import { useEffect, type RefObject } from "react"

type Searchable = { name: string; capital: string }

/** Jumps the marquee to the first item matching `search` while the user is typing. */
export function useScrollToMatch(
  containerRef: RefObject<HTMLDivElement | null>,
  items: Searchable[],
  search: string,
  step: number
) {
  useEffect(() => {
    const query = search.trim().toLowerCase()
    const el = containerRef.current
    if (!query || !el) return

    const matchIndex = items.findIndex(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.capital.toLowerCase().includes(query)
    )
    if (matchIndex === -1) return

    el.scrollTo({ left: matchIndex * step, behavior: "smooth" })
  }, [search, items, containerRef, step])
}
