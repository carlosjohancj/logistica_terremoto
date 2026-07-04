"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  requests: Array<Record<string, any>>
  profiles: Record<string, { name: string; phone: string }>
  onTakeRequest: (req: Record<string, any>) => void
}

export default function RequestManager({ requests, profiles, onTakeRequest }: Props) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay solicitudes disponibles en tu zona.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const profile = profiles[req.user_id]
        return (
          <Card key={req.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium">
                    {req.origin_city || req.origin_state} → {req.destination_city || req.destination_state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {req.people_to_move} pers. · {req.notes || "Sin notas"}
                  </p>
                  {profile && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Contacto:</span> {profile.name} — {profile.phone || "sin teléfono"}
                    </p>
                  )}
                </div>
                <Button size="sm" onClick={() => onTakeRequest(req)}>
                  Tomar ruta
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
