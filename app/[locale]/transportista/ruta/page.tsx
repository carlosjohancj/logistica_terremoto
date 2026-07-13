"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import RoutePlanner from "@/components/transportista/route-planner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type TravelRequest = {
  id: string
  origin_city: string
  origin_state: string
  destination_city: string
  destination_state: string
  people_to_move: number
  notes: string
  status: string
}

export default function RoutePlannerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId")
  const scheduledDate = searchParams.get("date") || undefined
  const estimatedHours = searchParams.get("hours") ? Number(searchParams.get("hours")) : undefined
  const [request, setRequest] = useState<TravelRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!requestId) {
      setLoading(false)
      return
    }
    loadRequest(requestId)
  }, [requestId])

  async function loadRequest(id: string) {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("travel_requests")
      .select("*")
      .eq("id", id)
      .single()
    if (data) {
      setRequest(data as TravelRequest)
    }
    setLoading(false)
  }

  async function handleTakeFullRoute() {
    if (!request) return
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const body: Record<string, unknown> = {
        travel_request_id: request.id,
        origin_city: request.origin_city,
        origin_state: request.origin_state,
        destination_city: request.destination_city,
        destination_state: request.destination_state,
        is_full_route: true,
      }
      if (scheduledDate) body.scheduled_date = scheduledDate
      if (estimatedHours) body.estimated_hours = estimatedHours

      const res = await fetch("/api/route-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error")
      router.push("/transportista")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!requestId || !request) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Planificar ruta</h1>
          <p className="text-muted-foreground">Selecciona una solicitud desde el panel principal para planificar una ruta.</p>
        </div>
        <Button onClick={() => router.push("/transportista")}>
          Volver al panel
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planificar ruta</h1>
          <p className="text-muted-foreground">
            {request.origin_city} → {request.destination_city}
            {request.people_to_move && ` · ${request.people_to_move} pers.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/transportista")}>
            Volver
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">
              Haz clic en el mapa para agregar paradas intermedias, o toma la ruta completa directamente.
            </p>
            <Button variant="secondary" onClick={handleTakeFullRoute}>
              Tomar ruta completa
            </Button>
          </div>
          <RoutePlanner
            travelRequestId={request.id}
            originCity={request.origin_city || request.origin_state}
            originState={request.origin_state}
            destCity={request.destination_city || request.destination_state}
            destState={request.destination_state}
            onComplete={() => router.push("/transportista")}
            scheduledDate={scheduledDate}
            estimatedHours={estimatedHours}
          />
        </CardContent>
      </Card>
    </div>
  )
}
