"use client"

import { ChevronRight, MapPin, Home } from "lucide-react"
import { getStateFlagUrl } from "@/lib/state-flags"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  const flagUrl = getStateFlagUrl(name)

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <button className="w-full flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left cursor-pointer transition-all hover:border-primary/40 hover:shadow-md" />
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          {flagUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={flagUrl}
              alt={`Bandera de ${name}`}
              className="h-6 w-9 shrink-0 rounded-sm border border-border object-cover"
            />
          )}
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-base">{name}</h3>
            <p className="truncate text-xs text-muted-foreground">Capital: {capital}</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </DialogTrigger>

      <DialogContent className="p-6 sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {flagUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={flagUrl}
                alt={`Bandera de ${name}`}
                className="h-10 w-16 shrink-0 rounded-sm border border-border object-cover"
              />
            )}
            <div>
              <DialogTitle className="text-xl">{name}</DialogTitle>
              <DialogDescription className="text-base">Capital: {capital}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-96 space-y-4 overflow-y-auto py-1">
          {cities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin ciudades registradas</p>
          ) : (
            cities.map((city) => {
              const housings = housingByCity[city] || []
              return (
                <div key={city} className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium">{city}</p>
                    {housings.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {housings.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-start gap-2 text-sm text-muted-foreground bg-background rounded-lg p-3 border"
                          >
                            <Home className="h-4 w-4 mt-0.5 shrink-0" />
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
                      <p className="text-sm text-muted-foreground">Sin alojamientos registrados</p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
