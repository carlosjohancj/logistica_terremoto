"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type TimelineEntry = {
  id: string
  familyName: string
  route: string
  date: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En ruta",
  completed: "Completado",
  cancelled: "Cancelado",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
}

type Props = {
  entries: TimelineEntry[]
}

export default function Timeline({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay viajes registrados todavía.
      </div>
    )
  }

  return (
    <div className="relative pl-6 space-y-4">
      <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
      {entries.map((entry) => (
        <div key={entry.id} className="relative">
          <div className="absolute -left-4 mt-1.5 w-3 h-3 rounded-full border-2 border-primary bg-background" />
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{entry.familyName}</p>
                  <p className="text-sm text-muted-foreground">{entry.route}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.date}</p>
                </div>
                <Badge className={statusColors[entry.status]}>
                  {statusLabels[entry.status]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
