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
import { getPB, COLLECTIONS, type Role } from "@/lib/pocketbase"
import { toast } from "sonner"

const roleLabels: Record<Role, string> = {
  damnificado: "Damnificado",
  transportista: "Transportista",
  anfitrion: "Anfitrión",
  donante: "Donante",
  admin: "Admin",
}

export default function PerfilPage() {
  const t = useTranslations("nav")
  const tc = useTranslations("common")
  const router = useRouter()

  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [travelReqs, setTravelReqs] = useState<Record<string, unknown>[]>([])
  const [transportOffers, setTransportOffers] = useState<Record<string, unknown>[]>([])
  const [housingOffers, setHousingOffers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const pb = getPB()
    if (!pb.authStore.model) {
      router.push("/auth/login")
      return
    }

    async function loadProfile() {
      setLoading(true)
      try {
        const pb = getPB()
        const userId = pb.authStore.model!.id

        setUser(pb.authStore.model as Record<string, unknown>)

        const [travelRes, transportRes, housingRes] = await Promise.all([
          pb.collection(COLLECTIONS.TRAVEL_REQUESTS).getList(1, 50, { filter: `user = "${userId}"` }),
          pb.collection(COLLECTIONS.TRANSPORT_OFFERS).getList(1, 50, { filter: `user = "${userId}"` }),
          pb.collection(COLLECTIONS.HOUSING_OFFERS).getList(1, 50, { filter: `user = "${userId}"` }),
        ])

        setTravelReqs(travelRes.items as Record<string, unknown>[])
        setTransportOffers(transportRes.items as Record<string, unknown>[])
        setHousingOffers(housingRes.items as Record<string, unknown>[])
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  function handleLogout() {
    getPB().authStore.clear()
    router.push("/")
  }

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">{tc("loading")}</div>
  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("perfil")}</h1>
          <p className="text-muted-foreground">{user.name as string}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            {roleLabels[(user.role as Role) || "damnificado"]}
          </Badge>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            {t("cerrarSesion")}
          </Button>
        </div>
      </div>

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
              <Card key={req.id as string}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {req.origin_city as string} → {req.destination_city as string || "Sin destino"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {req.people_to_move as string} pers. · {req.status as string}
                      </p>
                    </div>
                    <Badge variant="outline">{req.status as string}</Badge>
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
              <Card key={offer.id as string}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {offer.vehicle_type as string} — {offer.origin_city as string} → {offer.destination_city as string}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {offer.capacity as string} plazas · {offer.status as string}
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
