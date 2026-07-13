"use client"

import { CalendarDays, MapPin, ArrowRight } from "lucide-react"

type Props = {
  entries: Array<{
    id: string
    familyName: string
    route: string
    date: string
    status: string
  }>
}

export default function UpcomingSchedule({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No tienes rutas programadas.</p>
    )
  }

  return (
    <div className="divide-y divide-border rounded-lg border">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3 px-4 py-3 text-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span className="font-medium whitespace-nowrap">{entry.date || "Sin fecha"}</span>
            <span className="hidden sm:flex items-center gap-1 text-muted-foreground truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{entry.route}</span>
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize">
            {entry.status === "in_progress" ? "En ruta" : "Programado"}
          </span>
        </div>
      ))}
    </div>
  )
}
