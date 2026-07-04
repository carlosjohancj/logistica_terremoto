"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, ChevronUp, MapPin, Home } from "lucide-react"

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

type StateCardProps = {
  name: string
  capital: string
  cities: string[]
  housingByCity: Record<string, HousingOffer[]>
  onOpenChange?: (open: boolean) => void
}

export function StateCard({ name, capital, cities, housingByCity, onOpenChange }: StateCardProps) {
  const [open, setOpen] = useState(false)
  const [panelRect, setPanelRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  function close() {
    setOpen(false)
    onOpenChange?.(false)
  }

  function toggle() {
    if (open) {
      close()
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setPanelRect({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen(true)
    onOpenChange?.(true)
  }

  // Floating panel doesn't reposition on scroll, so close it instead of
  // letting it drift away from the button that opened it.
  useEffect(() => {
    if (!open) return

    function handleScroll(e: Event) {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return
      close()
    }

    function handleResize() {
      close()
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return
      close()
    }

    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", handleResize)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("mousedown", handleClickOutside)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card transition-all hover:shadow-md">
      <button
        ref={buttonRef}
        onClick={toggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-base">{name}</h3>
          <p className="text-xs text-muted-foreground">Capital: {capital}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && panelRect && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-50 space-y-2 rounded-xl border border-border bg-popover px-4 py-3 shadow-lg max-h-72 overflow-y-auto"
            style={{ top: panelRect.top, left: panelRect.left, width: panelRect.width }}
          >
            {cities.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sin ciudades registradas</p>
            ) : (
              cities.map((city) => {
                const housings = housingByCity[city] || []
                return (
                  <div key={city} className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{city}</p>
                      {housings.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {housings.map((h) => (
                            <div
                              key={h.id}
                              className="flex items-start gap-1.5 text-xs text-muted-foreground bg-background rounded p-1.5 border"
                            >
                              <Home className="h-3 w-3 mt-0.5 shrink-0" />
                              <div>
                                <p>
                                  {h.city} — Capacidad: {h.capacity} pers.
                                </p>
                                {h.notes && (
                                  <p className="italic">{h.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {housings.length === 0 && (
                        <p className="text-xs text-muted-foreground">Sin alojamientos registrados</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>,
          document.body
        )}
    </div>
  )
}
