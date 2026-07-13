"use client"

import { useEffect, useRef } from "react"

const SPEED = 40 // px per second
const RESUME_DELAY = 1200 // ms of inactivity before auto-scroll resumes

export function useMarqueeScroll({
  singleSetWidth,
  isSearching,
}: {
  singleSetWidth: number
  isSearching: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const interactingRef = useRef(false)
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openCardsRef = useRef<Set<string>>(new Set())
  const anyOpenRef = useRef(false)
  const hoveringRef = useRef(false)
  const focusedRef = useRef(false)

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
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    let raf = 0
    let lastTime: number | null = null

    function tick(time: number) {
      if (lastTime === null) lastTime = time
      const dt = (time - lastTime) / 1000
      lastTime = time

      const el = containerRef.current
      if (
        el &&
        !isSearching &&
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
  }, [isSearching, singleSetWidth])

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

  return { containerRef, handleCardOpenChange }
}
