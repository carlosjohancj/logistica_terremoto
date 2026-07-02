"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getSupabase } from "@/lib/supabase"
import { toast } from "sonner"

type TravelRequest = {
  id: string
  user_id: string
  origin_state: string
  origin_city: string
  destination_city: string
  people_to_move: number
  status: string
  notes: string
}

type Profile = {
  name: string
  phone: string
}

export default function SolicitudesPanel({
  availableReqs,
  availableProfiles,
  transportOfferCount,
}: {
  availableReqs: TravelRequest[]
  availableProfiles: Record<string, Profile>
  transportOfferCount: number
}) {
  const [takingId, setTakingId] = useState<string | null>(null)

  async function handleTakeRequest(travelRequestId: string) {
    setTakingId(travelRequestId)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travel_request_id: travelRequestId, user_id: user.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al tomar la solicitud")

      toast.success("Solicitud tomada exitosamente")
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setTakingId(null)
    }
  }

  if (availableReqs.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-2">Solicitudes disponibles en tu zona</h2>
        <p className="text-muted-foreground">
          No hay solicitudes abiertas por el momento.
        </p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">Solicitudes disponibles en tu zona</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {transportOfferCount > 0
          ? "Coinciden con tus rutas de transporte registradas"
          : "Mostrando todas las solicitudes abiertas — registra una oferta de transporte para filtrar por zona"}
      </p>
      <div className="space-y-3">
        {availableReqs.map((req) => {
          const profile = availableProfiles[req.user_id]
          return (
            <Card key={req.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">
                      {req.origin_city || req.origin_state} → {req.destination_city || "Sin destino"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {req.people_to_move} pers. · {req.notes || "Sin notas"}
                    </p>
                    {profile && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Contacto:</span>{" "}
                        {profile.name} — {profile.phone || "sin teléfono"}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleTakeRequest(req.id)}
                    disabled={takingId === req.id}
                  >
                    {takingId === req.id ? "Tomando..." : "Tomar solicitud"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
