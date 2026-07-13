"use client"

import { useMemo, useState } from "react"
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
import { NumberedPagination } from "@/components/shared/numbered-pagination"
import { MapPin, ArrowRight, Users, Phone, PackageSearch, AlertTriangle, Package } from "lucide-react"

type Props = {
  requests: Array<Record<string, any>>
  profiles: Record<string, { name: string; phone: string }>
  onTakeRequest: (req: Record<string, any>) => void
  transportistaOffers?: Array<{ capacity: number; origin_state: string; accepts_passengers: boolean; accepts_cargo: boolean }>
}

const PAGE_SIZE = 9

export default function RequestManager({ requests, profiles, onTakeRequest, transportistaOffers }: Props) {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Record<string, any> | null>(null)

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE))
  const visible = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return requests.slice(start, start + PAGE_SIZE)
  }, [requests, page])

  function handlePageChange(next: number) {
    setPage(next)
  }

  function confirmTake() {
    if (!selected) return
    onTakeRequest(selected)
    setSelected(null)
  }

  function openDialog(req: Record<string, any>) {
    setSelected(req)
  }

  function getCapacityInfo(req: Record<string, any>) {
    if (!transportistaOffers?.length) return null
    const match = transportistaOffers.find(o => o.origin_state === req.origin_state)
    if (!match) return null
    return {
      capacity: match.capacity,
      exceeded: req.people_to_move > match.capacity,
    }
  }

  function getCargoInfo(req: Record<string, any>) {
    const types: string[] = []
    if (req.needs_cargo_transport) types.push("Carga")
    if (req.needs_passenger_transport !== false) types.push("Pasajeros")
    return types.length > 0 ? types.join(" + ") : null
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
        <PackageSearch className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">No hay solicitudes disponibles</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Todavía no hay solicitudes abiertas en tu zona. Vuelve más tarde.
        </p>
      </div>
    )
  }

  const selectedProfile = selected ? profiles[selected.user_id] : undefined
  const capacityInfo = selected ? getCapacityInfo(selected) : null

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((req) => {
          const profile = profiles[req.user_id]
          const cap = getCapacityInfo(req)
          const cargo = getCargoInfo(req)
          return (
            <Card key={req.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className="truncate">{req.origin_city || req.origin_state}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{req.destination_city || req.destination_state}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="w-fit gap-1 font-normal">
                    <Users className="h-3 w-3" />
                    {req.people_to_move} pers.
                  </Badge>

                  {cargo && (
                    <Badge variant="secondary" className="w-fit gap-1 font-normal">
                      <Package className="h-3 w-3" />
                      {cargo}
                    </Badge>
                  )}

                  {cap && cap.exceeded && (
                    <Badge variant="destructive" className="w-fit gap-1 font-normal text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Capacidad: {cap.capacity}
                    </Badge>
                  )}
                  {cap && !cap.exceeded && (
                    <Badge variant="outline" className="w-fit gap-1 font-normal text-xs text-muted-foreground">
                      Cap. {cap.capacity} pers.
                    </Badge>
                  )}
                </div>

                <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {req.notes || "Sin notas adicionales"}
                </p>

                {profile && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary">
                      {profile.name?.charAt(0) || "?"}
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
                  Tomar ruta
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <NumberedPagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} className="mt-6" />

      <Dialog open={!!selected} onOpenChange={(open) => {
        if (!open) setSelected(null)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar toma de ruta</DialogTitle>
            <DialogDescription>
              Estás a punto de comprometerte a transportar esta solicitud. Podrás planificar los detalles de la ruta a continuación.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{selected.origin_city || selected.origin_state}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{selected.destination_city || selected.destination_state}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                {selected.people_to_move} persona{selected.people_to_move === 1 ? "" : "s"} ·{" "}
                {selected.notes || "Sin notas"}
              </div>
              {capacityInfo && capacityInfo.exceeded && (
                <div className="flex items-center gap-1.5 text-destructive text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Capacidad de tu vehículo: {capacityInfo.capacity} pers. — la solicitud pide {selected.people_to_move}
                </div>
              )}
              {selectedProfile && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  {selectedProfile.name} — {selectedProfile.phone || "sin teléfono"}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmTake}>
              Sí, tomar esta ruta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
