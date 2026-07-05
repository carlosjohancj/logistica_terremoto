"use client"

import { useEffect, useRef } from "react"
import { StateCard } from "@/components/empiezo-desde-cero/state-card"
import type { Estado } from "@/lib/estados"

type HousingOffer = {
  id: string
  city: string
  state: string
  capacity: number
  accepts_children: boolean
  accepts_adults: boolean
  accepts_families: boolean
  notes?: string
}

type StatesMarqueeProps = {
  estados: Estado[]
  citiesByState: Record<string, string[]>
  housingByCity: Record<string, HousingOffer[]>
  search: string
}

const CARD_WIDTH = 288 // w-72
const GAP = 16 // gap-4
const STEP = CARD_WIDTH + GAP
const SPEED = 40 // px per second
const RESUME_DELAY = 1200 // ms of inactivity before auto-scroll resumes

export function StatesMarquee({ estados, citiesByState, housingByCity, search }: StatesMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const interactingRef = useRef(false)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openCardsRef = useRef<Set<string>>(new Set())
  const anyOpenRef = useRef(false)
  const hoveringRef = useRef(false)
  const focusedRef = useRef(false)
  const singleSetWidth = estados.length * STEP

  function markInteracting() {
    interactingRef.current = true
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = setTimeout(() => {
      interactingRef.current = false
    }, RESUME_DELAY)
  }

  function handleCardOpenChange(key: string, isOpen: boolean) {
    if (isOpen) openCardsRef.current.add(key)
    else openCardsRef.current.delete(key)
    anyOpenRef.current = openCardsRef.current.size > 0
    const el = containerRef.current
    if (el) el.style.touchAction = anyOpenRef.current ? "pan-y" : ""
  }

  // Auto-scroll loop
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let raf = 0
    let lastTime: number | null = null
    const searching = search.trim().length > 0

    function tick(time: number) {
      if (lastTime === null) lastTime = time
      const dt = (time - lastTime) / 1000
      lastTime = time

      const el = containerRef.current
      if (
        el &&
        !searching &&
        !interactingRef.current &&
        !anyOpenRef.current &&
        !hoveringRef.current &&
        !focusedRef.current &&
        singleSetWidth > 0
      ) {
        el.scrollLeft += SPEED * dt
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [search, singleSetWidth])

  // Seamless wraparound + manual scroll/drag support
  useEffect(() => {
    const el = containerRef.current
    if (!el || singleSetWidth === 0) return

    function onScroll() {
      if (!el) return
      if (el.scrollLeft >= singleSetWidth) {
        el.scrollLeft -= singleSetWidth
      } else if (el.scrollLeft < 0) {
        el.scrollLeft += singleSetWidth
      }
    }

    function onWheel(e: WheelEvent) {
      if (!el || anyOpenRef.current) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
        e.preventDefault()
      }
      markInteracting()
    }

    const DRAG_THRESHOLD = 6
    let isPointerDown = false
    let dragStarted = false
    let suppressNextClick = false
    let startX = 0
    let startScrollLeft = 0
    let pointerId = 0

    function onPointerDown(e: PointerEvent) {
      if (anyOpenRef.current) return
      isPointerDown = true
      dragStarted = false
      pointerId = e.pointerId
      startX = e.clientX
      startScrollLeft = el!.scrollLeft
      markInteracting()
    }

    function onPointerMove(e: PointerEvent) {
      if (!isPointerDown || !el || anyOpenRef.current) return
      const dx = e.clientX - startX
      if (!dragStarted) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return
        dragStarted = true
        el.setPointerCapture(pointerId)
        el.style.cursor = "grabbing"
      }
      el.scrollLeft = startScrollLeft - dx
    }

    function endDrag() {
      isPointerDown = false
      if (el) el.style.cursor = "grab"
      if (dragStarted) suppressNextClick = true
      dragStarted = false
      markInteracting()
    }

    function onClickCapture(e: MouseEvent) {
      if (suppressNextClick) {
        e.stopPropagation()
        e.preventDefault()
        suppressNextClick = false
      }
    }

    function onTouchStart() {
      markInteracting()
    }

    function onMouseEnter() {
      hoveringRef.current = true
    }

    function onMouseLeave() {
      hoveringRef.current = false
    }

    function onFocusIn() {
      focusedRef.current = true
    }

    function onFocusOut(e: FocusEvent) {
      if (!el!.contains(e.relatedTarget as Node)) focusedRef.current = false
    }

    el.addEventListener("scroll", onScroll)
    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointermove", onPointerMove)
    el.addEventListener("pointerup", endDrag)
    el.addEventListener("pointercancel", endDrag)
    el.addEventListener("click", onClickCapture, true)
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("mouseenter", onMouseEnter)
    el.addEventListener("mouseleave", onMouseLeave)
    el.addEventListener("focusin", onFocusIn)
    el.addEventListener("focusout", onFocusOut)

    return () => {
      el.removeEventListener("scroll", onScroll)
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointermove", onPointerMove)
      el.removeEventListener("pointerup", endDrag)
      el.removeEventListener("pointercancel", endDrag)
      el.removeEventListener("click", onClickCapture, true)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("mouseenter", onMouseEnter)
      el.removeEventListener("mouseleave", onMouseLeave)
      el.removeEventListener("focusin", onFocusIn)
      el.removeEventListener("focusout", onFocusOut)
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [singleSetWidth])

  // Jump to the first match while the user is searching
  useEffect(() => {
    const query = search.trim().toLowerCase()
    const el = containerRef.current
    if (!query || !el) return

    const matchIndex = estados.findIndex(
      (e) => e.name.toLowerCase().includes(query) || e.capital.toLowerCase().includes(query)
    )
    if (matchIndex === -1) return

    el.scrollTo({ left: matchIndex * STEP, behavior: "smooth" })
  }, [search, estados])

  const loopItems = [...estados, ...estados]

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Estados de Venezuela"
      className="flex gap-4 overflow-x-auto px-4 pb-1 cursor-grab select-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
    >
      {loopItems.map((e, i) => {
        const key = `${e.id}-${i}`
        return (
          <div key={key} className="w-72 shrink-0">
            <StateCard
              name={e.name}
              capital={e.capital}
              cities={citiesByState[e.name] || []}
              housingByCity={housingByCity}
              onOpenChange={(isOpen) => handleCardOpenChange(key, isOpen)}
            />
          </div>
        )
      })}
    </div>
  )
}
