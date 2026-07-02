"use client"

import { useState } from "react"
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
}

export function StateCard({ name, capital, cities, housingByCity }: StateCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card transition-all hover:shadow-md">
      <button
        onClick={() => setOpen(!open)}
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

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/30 max-h-72 overflow-y-auto">
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
        </div>
      )}
    </div>
  )
}
