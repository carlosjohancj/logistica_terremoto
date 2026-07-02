"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabase, TABLES, type Role } from "@/lib/supabase"
import { toast } from "sonner"
import { SkeletonProfile } from "@/components/ui/skeleton"

const roleLabels: Record<Role, string> = {
  damnificado: "Damnificado",
  transportista: "Transportista",
  anfitrion: "Anfitrión",
  donante: "Donante",
  voluntario: "Voluntario",
  admin: "Admin",
}

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

type TransportOffer = {
  id: string
  origin_state: string
  origin_city: string
  destination_state: string
  destination_city: string
  vehicle_type: string
  capacity: number
  status: string
}

export default function PerfilPage() {
  const t = useTranslations("nav")
  const tc = useTranslations("common")
  const router = useRouter()

  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [travelReqs, setTravelReqs] = useState<TravelRequest[]>([])
  const [transportOffers, setTransportOffers] = useState<TransportOffer[]>([])
  const [housingOffers, setHousingOffers] = useState<Record<string, unknown>[]>([])
  const [availableReqs, setAvailableReqs] = useState<TravelRequest[]>([])
  const [availableProfiles, setAvailableProfiles] = useState<Record<string, { name: string; phone: string }>>({})
  const [takingId, setTakingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }
        const userId = user.id
        setUser(user as unknown as Record<string, unknown>)

        const [travelRes, transportRes, housingRes] = await Promise.all([
          supabase.from(TABLES.TRAVEL_REQUESTS).select("*").eq("user_id", userId) as never as { data: TravelRequest[] | null },
          supabase.from(TABLES.TRANSPORT_OFFERS).select("*").eq("user_id", userId) as never as { data: TransportOffer[] | null },
          supabase.from(TABLES.HOUSING_OFFERS).select("*").eq("user_id", userId) as never as { data: Record<string, unknown>[] | null },
        ])

        setTravelReqs(travelRes.data ?? [])
        setTransportOffers(transportRes.data ?? [])
        setHousingOffers(housingRes.data ?? [])

        const userAny = user as unknown as Record<string, unknown>
        const role = (userAny.user_metadata as Record<string, unknown>)?.role as string || ""
        if (role === "voluntario" || role === "transportista") {
          const userOffers = transportRes.data ?? []
          const states = [...new Set(userOffers.map((o) => o.origin_state).filter(Boolean))] as string[]

          let query = supabase
            .from(TABLES.TRAVEL_REQUESTS)
            .select("*")
            .eq("status", "open")
            .neq("user_id", userId) as never as { data: TravelRequest[] | null }

          if (states.length > 0) {
            query = supabase
              .from(TABLES.TRAVEL_REQUESTS)
              .select("*")
              .eq("status", "open")
              .neq("user_id", userId)
              .in("origin_state", states) as never as { data: TravelRequest[] | null }
          }

          const { data: available } = await query
          const reqs = available ?? []
          setAvailableReqs(reqs)

          if (reqs.length > 0) {
            const userIds = [...new Set(reqs.map((r) => r.user_id).filter(Boolean))] as string[]
            if (userIds.length > 0) {
              const { data: profiles } = await (supabase
                .from(TABLES.PROFILES)
                .select("id, name, phone")
                .in("id", userIds) as never as { data: { id: string; name: string; phone: string }[] | null })
              const profileMap: Record<string, { name: string; phone: string }> = {}
              for (const p of profiles ?? []) {
                profileMap[p.id] = { name: p.name, phone: p.phone }
              }
              setAvailableProfiles(profileMap)
            }
          }
        }
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

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
      setAvailableReqs((prev) => prev.filter((r) => r.id !== travelRequestId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error")
    } finally {
      setTakingId(null)
    }
  }

  function handleLogout() {
    getSupabase().auth.signOut()
    router.push("/")
  }

  if (loading) return <SkeletonProfile />
  if (!user) return null

  const userRole = ((user as Record<string, unknown>).user_metadata as Record<string, unknown>)?.role as string || ""
  const isVolunteer = userRole === "voluntario" || userRole === "transportista"

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("perfil")}</h1>
          <p className="text-muted-foreground">{user.name as string}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {roleLabels[(userRole as Role) || "damnificado"]}
          </Badge>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            {t("cerrarSesion")}
          </Button>
        </div>
      </div>

      {isVolunteer && availableReqs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Solicitudes disponibles en tu zona
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {transportOffers.length > 0
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
      )}

      {isVolunteer && availableReqs.length === 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Solicitudes disponibles en tu zona
          </h2>
          <p className="text-muted-foreground">
            No hay solicitudes abiertas por el momento.
          </p>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("solicitarViaje")}</CardTitle>
            <CardDescription>{travelReqs.length} publicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{travelReqs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("ofrecerTransporte")}</CardTitle>
            <CardDescription>{transportOffers.length} publicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">{transportOffers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t("ofrecerHospedaje")}</CardTitle>
            <CardDescription>{housingOffers.length} publicaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{housingOffers.length}</p>
          </CardContent>
        </Card>
      </div>

      {travelReqs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t("solicitarViaje")}</h2>
          <div className="space-y-3">
            {travelReqs.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {req.origin_city} → {req.destination_city || "Sin destino"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {req.people_to_move} pers. · {req.status}
                      </p>
                    </div>
                    <Badge variant="outline">{req.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {transportOffers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t("ofrecerTransporte")}</h2>
          <div className="space-y-3">
            {transportOffers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {offer.vehicle_type} — {offer.origin_city} → {offer.destination_city}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {offer.capacity} plazas · {offer.status}
                      </p>
                    </div>
                    <Badge variant="outline">{offer.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {housingOffers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{t("ofrecerHospedaje")}</h2>
          <div className="space-y-3">
            {housingOffers.map((offer) => (
              <Card key={offer.id as string}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {offer.city as string}, {offer.state as string}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {offer.capacity as string} pers. · {offer.max_stay_days as string} días · {offer.status as string}
                      </p>
                    </div>
                    <Badge variant="outline">{offer.status as string}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
