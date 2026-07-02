"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getSupabase } from "@/lib/supabase"
import { getCitiesByState } from "@/lib/estados"
import { toast } from "sonner"

type TravelRequest = {
  id: string
  user_id: string
  origin_state: string
  origin_city: string
  destination_state: string
  destination_city: string
  has_destination: boolean
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedReq, setSelectedReq] = useState<TravelRequest | null>(null)
  const [mode, setMode] = useState<"full" | "partial">("full")
  const [partialOrigin, setPartialOrigin] = useState("")
  const [partialDest, setPartialDest] = useState("")
  const [originCities, setOriginCities] = useState<string[]>([])
  const [destCities, setDestCities] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  function openDialog(req: TravelRequest) {
    setSelectedReq(req)
    setMode("full")
    setPartialOrigin("")
    setPartialDest("")
    setOriginCities([])
    setDestCities([])
    setDialogOpen(true)

    if (req.origin_state) {
      getCitiesByState(req.origin_state).then(setOriginCities)
    }
    if (req.destination_state) {
      getCitiesByState(req.destination_state).then(setDestCities)
    }
  }

  async function confirmTake() {
    if (!selectedReq) return
    setSending(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No autenticado")

      let originCity = selectedReq.origin_city
      let originState = selectedReq.origin_state
      let destCity = selectedReq.destination_city
      let destState = selectedReq.destination_state
      let isFull = true

      if (mode === "partial") {
        originCity = partialOrigin
        destCity = partialDest
        destState = selectedReq.destination_state
        isFull = false
      }

      const res = await fetch("/api/route-segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          travel_request_id: selectedReq.id,
          transportista_id: user.id,
          origin_city: originCity,
          origin_state: originState,
          destination_city: destCity,
          destination_state: destState,
          is_full_route: isFull,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al tomar la solicitud")

      const msg = json.all_covered
        ? "Ruta tomada exitosamente"
        : `Tramo registrado (${json.distance_km} km). Pendiente de otros transportistas para completar la ruta.`

      toast.success(msg)
      setDialogOpen(false)
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setSending(false)
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
                      {req.origin_city || req.origin_state} → {req.destination_city || req.destination_state || "Sin destino"}
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
                  <Button size="sm" onClick={() => openDialog(req)}>
                    Tomar solicitud
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tomar solicitud de viaje</DialogTitle>
            <DialogDescription>
              {selectedReq && (
                <span>
                  Ruta: {selectedReq.origin_city || selectedReq.origin_state}
                  {" → "}
                  {selectedReq.destination_city || selectedReq.destination_state || "Sin destino"}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="route-mode"
                checked={mode === "full"}
                onChange={() => setMode("full")}
                className="accent-primary"
              />
              <span className="text-sm font-medium">Llevar toda la ruta</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="route-mode"
                checked={mode === "partial"}
                onChange={() => setMode("partial")}
                className="accent-primary"
              />
              <span className="text-sm font-medium">Llevar solo un tramo</span>
            </label>

            {mode === "partial" && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div className="space-y-1">
                  <Label>Desde</Label>
                  <Select value={partialOrigin} onValueChange={(v) => v && setPartialOrigin(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ciudad origen" />
                    </SelectTrigger>
                    <SelectContent>
                      {originCities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Hasta</Label>
                  <Select value={partialDest} onValueChange={(v) => v && setPartialDest(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ciudad destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {destCities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmTake}
              disabled={sending || (mode === "partial" && (!partialOrigin || !partialDest))}
            >
              {sending ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
