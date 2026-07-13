"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabase } from "@/types/supabase"
import RoutePlanner from "@/components/transportista/route-planner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Users, Package, Phone, User } from "lucide-react"

type TravelRequest = {
  id: string
  user_id: string
  origin_city: string
  origin_state: string
  destination_city: string
  destination_state: string
  people_to_move: number
  notes: string
  status: string
  needs_cargo_transport?: boolean
  cargo_description?: string
}

type Profile = {
  name: string
  phone: string
}

export default function RoutePlannerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestId = searchParams.get("requestId")
  const [request, setRequest] = useState<TravelRequest | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!requestId) {
      setLoading(false)
      return
    }
    loadData(requestId)
  }, [requestId])

  async function loadData(id: string) {
    const supabase = getSupabase()
    const { data: reqData } = await supabase
      .from("travel_requests")
      .select("*")
      .eq("id", id)
      .single()

    if (reqData) {
      const req = reqData as TravelRequest
      setRequest(req)

      if (req.user_id) {
        const { data: profData } = await supabase
          .from("profiles")
          .select("name, phone")
          .eq("id", req.user_id)
          .single()
        if (profData) setProfile(profData as Profile)
      }
    }
    setLoading(false)
  }

  async function handleTakeFullRoute() {
    if (!request) return
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const res = await fetch("/api/route-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          travel_request_id: request.id,
          origin_city: request.origin_city,
          origin_state: request.origin_state,
          destination_city: request.destination_city,
          destination_state: request.destination_state,
          is_full_route: true,
        }),
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
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p className="text-muted-foreground">Cargando solicitud...</p>
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

  const cargoTypes: string[] = []
  if (request.needs_cargo_transport) cargoTypes.push("Carga")
  if (!request.needs_cargo_transport) cargoTypes.push("Pasajeros")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/transportista")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Planificar ruta</h1>
            <p className="text-muted-foreground">
              {request.origin_city || request.origin_state} → {request.destination_city || request.destination_state}
            </p>
          </div>
        </div>
        <Button variant="default" onClick={handleTakeFullRoute}>
          Tomar ruta completa
        </Button>
      </div>

      {/* Requester info card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {profile && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{profile.name}</span>
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
            )}
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {request.people_to_move} pers.
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Package className="h-3 w-3" />
              {cargoTypes.join(" + ")}
            </Badge>
            {request.cargo_description && (
              <span className="text-xs text-muted-foreground">{request.cargo_description}</span>
            )}
          </div>
          {request.notes && (
            <p className="mt-2 text-sm text-muted-foreground">{request.notes}</p>
          )}
        </CardContent>
      </Card>

      {/* Planner */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">
            Haz clic en el mapa para agregar paradas intermedias, o toma la ruta completa directamente.
          </p>
          <RoutePlanner
            travelRequestId={request.id}
            originCity={request.origin_city || request.origin_state}
            originState={request.origin_state}
            destCity={request.destination_city || request.destination_state}
            destState={request.destination_state}
            onComplete={() => router.push("/transportista")}
            requesterName={profile?.name}
            requesterPhone={profile?.phone}
            peopleToMove={request.people_to_move}
            notes={request.notes}
            needsCargo={request.needs_cargo_transport}
            cargoDescription={request.cargo_description}
          />
        </CardContent>
      </Card>
    </div>
  )
}
