"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { NumberedPagination } from "@/components/shared/numbered-pagination"
import { getSupabase } from "@/lib/supabase"
import { getCitiesByState } from "@/lib/estados"
import { getInitials } from "@/lib/utils"
import { toast } from "sonner"
import { ArrowRight, Users, Phone, PackageSearch } from "lucide-react"

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

const PAGE_SIZE = 9

export default function SolicitudesPanel({
  availableReqs,
  availableProfiles,
  transportOfferCount,
}: {
  availableReqs: TravelRequest[]
  availableProfiles: Record<string, Profile>
  transportOfferCount: number
}) {
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedReq, setSelectedReq] = useState<TravelRequest | null>(null)
  const [mode, setMode] = useState<"full" | "partial">("full")
  const [partialOrigin, setPartialOrigin] = useState("")
  const [partialDest, setPartialDest] = useState("")
  const [originCities, setOriginCities] = useState<string[]>([])
  const [destCities, setDestCities] = useState<string[]>([])
  const [sending, setSending] = useState(false)

  const totalPages = Math.max(1, Math.ceil(availableReqs.length / PAGE_SIZE))
  const visible = availableReqs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
      const originState = selectedReq.origin_state
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
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <PackageSearch className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No hay solicitudes disponibles</p>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            No hay solicitudes abiertas por el momento. Vuelve más tarde.
          </p>
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((req) => {
          const profile = availableProfiles[req.user_id]
          return (
            <Card key={req.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-base font-bold leading-snug">
                  {req.origin_city || req.origin_state}{" "}
                  <ArrowRight className="inline h-4 w-4 text-muted-foreground" />{" "}
                  {req.destination_city || req.destination_state || "Sin destino"}
                </p>

                <Badge variant="outline" className="w-fit gap-1 font-normal">
                  <Users className="h-3 w-3" />
                  {req.people_to_move} pers.
                </Badge>

                <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {req.notes || "Sin notas"}
                </p>

                {profile && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary">
                      {getInitials(profile.name || "?")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{profile.name}</p>
                      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        {profile.phone || "sin teléfono"}
                      </p>
                    </div>
                  </div>
                )}

                <Button className="mt-1 w-full" onClick={() => openDialog(req)}>
                  Tomar solicitud
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <NumberedPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />

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
