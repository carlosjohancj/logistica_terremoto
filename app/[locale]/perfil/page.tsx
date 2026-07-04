"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabase, TABLES, type Role } from "@/lib/supabase"
import { toast } from "sonner"
import { SkeletonGrid, SkeletonProfile } from "@/components/ui/skeleton"
import { ArrowRight } from "lucide-react"
import SolicitudesPanel from "./solicitudes-panel"
import EmpresaPanel from "./empresa-panel"
import MensajesPanel from "./mensajes-panel"

const roleLabels: Record<Role, string> = {
  damnificado: "Damnificado",
  transportista: "Transportista",
  anfitrion: "Anfitrión",
  donante: "Donante",
  voluntario: "Voluntario",
  organizacion: "Organización",
  admin: "Admin",
}

type TabDef = {
  id: string
  label: string
  roles: string[]
}

const ALL_TABS: TabDef[] = [
  { id: "perfil", label: "Perfil", roles: ["*"] },
  { id: "publicaciones", label: "Mis Publicaciones", roles: ["*"] },
  { id: "solicitudes", label: "Solicitudes Disponibles", roles: ["voluntario", "transportista"] },
  { id: "ayuda", label: "Ayuda Asignada", roles: ["damnificado"] },
  { id: "conexiones", label: "Conexiones", roles: ["*"] },
  { id: "empresa", label: "Empresa", roles: ["empresa"] },
  { id: "organizacion", label: "Organización", roles: ["organizacion"] },
  { id: "mensajes", label: "Mensajes", roles: ["*"] },
]

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

type Profile = { name: string; phone: string }

type Match = {
  id: string
  travel_request_id: string
  user_id: string
  status: string
  created_at: string
  travel_requests?: { origin_city: string; origin_state: string; destination_city: string; people_to_move: number }
  profiles?: { name: string; phone: string }
}

export default function PerfilPage() {
  const t = useTranslations("nav")
  const tc = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = pathname.split("/")[1] || "es"
  const tabParam = searchParams.get("tab")

  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [userRole, setUserRole] = useState("")
  const [travelReqs, setTravelReqs] = useState<TravelRequest[]>([])
  const [transportOffers, setTransportOffers] = useState<TransportOffer[]>([])
  const [housingOffers, setHousingOffers] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [hasCompanies, setHasCompanies] = useState(false)

  const [availableReqs, setAvailableReqs] = useState<TravelRequest[]>([])
  const [availableProfiles, setAvailableProfiles] = useState<Record<string, Profile>>({})

  const [ayudaData, setAyudaData] = useState<(TravelRequest & { match?: Match; transporter?: Profile; segments: Segment[] })[]>([])

  const [matches, setMatches] = useState<Match[]>([])

  const [localTab, setLocalTab] = useState<string>("")

  const computedActiveTab = useMemo(() => {
    const validTabs = ALL_TABS.filter((tab) => {
      if (tab.roles.includes("*")) return true
      if (tab.roles.includes("empresa")) return hasCompanies
      return tab.roles.includes(userRole)
    }).map((t) => t.id)

    if (tabParam && validTabs.includes(tabParam)) return tabParam
    return "perfil"
  }, [tabParam, userRole, hasCompanies])

  useEffect(() => {
    setLocalTab(computedActiveTab)
  }, [computedActiveTab])

  const activeTab = localTab || computedActiveTab

  const availableTabs = useMemo(() => {
    return ALL_TABS.filter((tab) => {
      if (tab.roles.includes("*")) return true
      if (tab.roles.includes("empresa")) return hasCompanies
      return tab.roles.includes(userRole)
    })
  }, [userRole, hasCompanies])

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
        const userAny = user as unknown as Record<string, unknown>
        const role = (userAny.user_metadata as Record<string, unknown>)?.role as string || ""
        setUser(userAny)
        setUserRole(role)

        const [travelRes, transportRes, housingRes, companyRes] = await Promise.all([
          supabase.from(TABLES.TRAVEL_REQUESTS).select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as never as { data: TravelRequest[] | null },
          supabase.from(TABLES.TRANSPORT_OFFERS).select("*").eq("user_id", user.id) as never as { data: TransportOffer[] | null },
          supabase.from(TABLES.HOUSING_OFFERS).select("*").eq("user_id", user.id) as never as { data: Record<string, unknown>[] | null },
          supabase.from(TABLES.COMPANIES).select("id").eq("user_id", user.id) as never as { data: { id: string }[] | null },
        ])

        setTravelReqs(travelRes.data ?? [])
        setTransportOffers(transportRes.data ?? [])
        setHousingOffers(housingRes.data ?? [])
        setHasCompanies((companyRes.data?.length ?? 0) > 0)

        // Load tab-specific data in background
        loadSolicitudesData(role, transportRes.data ?? [], user.id, supabase)
        loadAyudaData(travelRes.data ?? [], supabase)
        loadMatchesData(user.id, supabase)
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function loadSolicitudesData(role: string, userOffers: TransportOffer[], userId: string, supabase: ReturnType<typeof getSupabase>) {
    if (role !== "voluntario" && role !== "transportista") return

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
      const { data: profiles } = await (supabase
        .from(TABLES.PROFILES)
        .select("id, name, phone")
        .in("id", userIds) as never as { data: { id: string; name: string; phone: string }[] | null })
      const profileMap: Record<string, Profile> = {}
      for (const p of profiles ?? []) profileMap[p.id] = { name: p.name, phone: p.phone }
      setAvailableProfiles(profileMap)
    }
  }

  type Segment = {
    id: string
    travel_request_id: string
    transportista_id: string
    origin_city: string
    origin_state: string
    destination_city: string
    destination_state: string
    order: number
    distance_km: number
    is_full_route: boolean
    status: string
    profiles?: { name: string; phone: string }
  }

  async function loadAyudaData(myReqs: TravelRequest[], sb: ReturnType<typeof getSupabase>) {
    if (myReqs.length === 0) return
    const reqIds = myReqs.map((r) => r.id)
    const [matchResult, segmentResult] = await Promise.all([
      sb
        .from("matches")
        .select("*, profiles:user_id(name, phone)")
        .in("travel_request_id", reqIds) as never as { data: Match[] | null },
      fetch(`/api/route-segments?travel_request_ids=${reqIds.join(",")}&include_profile=true`),
    ])

    const matchData = matchResult.data
    const segJson = await segmentResult.json()
    const segmentData = segJson.segments as Segment[]

    if (!matchData || matchData.length === 0) return

    const segmentsByReqId: Record<string, Segment[]> = {}
    for (const seg of segmentData ?? []) {
      if (!segmentsByReqId[seg.travel_request_id]) segmentsByReqId[seg.travel_request_id] = []
      segmentsByReqId[seg.travel_request_id].push(seg)
    }

    const matchByReqId: Record<string, Match> = {}
    for (const m of matchData) matchByReqId[m.travel_request_id] = m

    const enriched = myReqs
      .filter((r) => matchByReqId[r.id])
      .map((r) => ({
        ...r,
        match: matchByReqId[r.id],
        transporter: matchByReqId[r.id]?.profiles,
        segments: segmentsByReqId[r.id] || [],
      })) as (TravelRequest & { match?: Match; transporter?: Profile; segments: Segment[] })[]
    setAyudaData(enriched)
  }

  async function loadMatchesData(userId: string, supabase: ReturnType<typeof getSupabase>) {
    const [asTransporter, asVictim] = await Promise.all([
      supabase
        .from("matches")
        .select("*, travel_requests:travel_request_id(origin_city, origin_state, destination_city, people_to_move)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }) as never as { data: Match[] | null },
      (async () => {
        const { data: myReqs } = await supabase
          .from(TABLES.TRAVEL_REQUESTS)
          .select("id")
          .eq("user_id", userId) as never as { data: { id: string }[] | null }
        const ids = (myReqs ?? []).map((r) => r.id)
        if (ids.length === 0) return { data: [] as Match[] }
        return supabase
          .from("matches")
          .select("*, travel_requests:travel_request_id(origin_city, origin_state, destination_city, people_to_move)")
          .in("travel_request_id", ids)
          .order("created_at", { ascending: false }) as never as { data: Match[] | null }
      })(),
    ])

    const all = [...(asTransporter.data ?? []), ...(asVictim.data ?? [])]
    const seen = new Set<string>()
    setMatches(all.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true }))
  }

  function handleLogout() {
    getSupabase().auth.signOut()
    router.push("/")
  }

  if (loading) return <SkeletonProfile />
  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("perfil")}</h1>
          <p className="text-muted-foreground">{user.name as string}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {roleLabels[(userRole as Role) || "damnificado"]}
          </Badge>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            {t("cerrarSesion")}
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {availableTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setLocalTab(tab.id)
              router.replace(`/${locale}/perfil?tab=${tab.id}`, { scroll: false })
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "perfil" && renderPerfilTab()}
      {activeTab === "publicaciones" && renderPublicacionesTab()}
      {activeTab === "solicitudes" && (
        <SolicitudesPanel availableReqs={availableReqs} availableProfiles={availableProfiles} transportOfferCount={transportOffers.length} />
      )}
      {activeTab === "ayuda" && renderAyudaTab()}
      {activeTab === "conexiones" && renderConexionesTab()}
      {activeTab === "empresa" && <EmpresaPanel />}
      {activeTab === "organizacion" && renderOrganizacionTab()}
      {activeTab === "mensajes" && <MensajesPanel />}
    </div>
  )

  function renderPerfilTab() {
    const vt = user?.volunteer_type as string
    const isGestion = userRole === "voluntario" && (vt === "gestion" || vt === "ambos")

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {isGestion && (
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Tareas de gestión</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">Solicitudes de viaje pendientes</p>
                    <p className="text-xs text-muted-foreground">Validar información y asignar transportistas</p>
                  </div>
                  <Badge>{travelReqs.length}</Badge>
                </div>
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">Mensajes sin leer</p>
                    <p className="text-xs text-muted-foreground">Gestionar comunicación entre partes</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setLocalTab("mensajes")
                    router.replace(`/${locale}/perfil?tab=mensajes`, { scroll: false })
                  }}>
                    Ir a mensajes
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium">Logística de reasentamiento</p>
                    <p className="text-xs text-muted-foreground">Coordinar viajes y hospedaje para damnificados</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setLocalTab("solicitudes")
                    router.replace(`/${locale}/perfil?tab=solicitudes`, { scroll: false })
                  }}>
                    Ver solicitudes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  function renderPublicacionesTab() {
    return (
      <div className="space-y-8">
        {travelReqs.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">{t("solicitarViaje")}</h2>
            <div className="space-y-3">
              {travelReqs.map((req) => (
                <Card key={req.id}>
                  <CardContent className="p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium">{req.origin_city} → {req.destination_city || "Sin destino"}</p>
                      <p className="text-sm text-muted-foreground">{req.people_to_move} pers. · {req.status}</p>
                    </div>
                    <Badge variant="outline">{req.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        {transportOffers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">{t("ofrecerTransporte")}</h2>
            <div className="space-y-3">
              {transportOffers.map((offer) => (
                <Card key={offer.id}>
                  <CardContent className="p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium">{offer.vehicle_type} — {offer.origin_city} → {offer.destination_city}</p>
                      <p className="text-sm text-muted-foreground">{offer.capacity} plazas · {offer.status}</p>
                    </div>
                    <Badge variant="outline">{offer.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        {housingOffers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">{t("ofrecerHospedaje")}</h2>
            <div className="space-y-3">
              {housingOffers.map((offer) => (
                <Card key={offer.id as string}>
                  <CardContent className="p-4 flex justify-between items-start">
                    <div>
                      <p className="font-medium">{offer.city as string}, {offer.state as string}</p>
                      <p className="text-sm text-muted-foreground">{offer.capacity as string} pers. · {offer.max_stay_days as string} días</p>
                    </div>
                    <Badge variant="outline">{offer.status as string}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
        {travelReqs.length === 0 && transportOffers.length === 0 && housingOffers.length === 0 && (
          <p className="text-muted-foreground">No tienes publicaciones aún.</p>
        )}
      </div>
    )
  }

  function renderAyudaTab() {
    if (ayudaData.length === 0) {
      return (
        <div>
          <p className="text-muted-foreground">No tienes ayuda asignada aún.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cuando un transportista tome tu solicitud, aparecerá aquí con sus datos de contacto.
          </p>
        </div>
      )
    }
    return (
      <div className="space-y-4">
        {ayudaData.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">
                    {item.origin_city} → {item.destination_city || "Sin destino"}
                  </p>
                  <p className="text-sm text-muted-foreground">{item.people_to_move} pers.</p>
                </div>
                <Badge>{item.match?.status || "matched"}</Badge>
              </div>

              {item.segments.length > 1 && (
                <div className="bg-muted/50 rounded-lg p-3 mt-2 space-y-2">
                  <p className="text-sm font-medium mb-1">Tramos de la ruta:</p>
                  {item.segments.map((seg) => (
                    <div key={seg.id} className="bg-background rounded p-2 border text-sm">
                      <p className="font-medium">
                        Tramo {seg.order}: {seg.origin_city} → {seg.destination_city}
                      </p>
                      <p className="text-muted-foreground">
                        {seg.distance_km.toFixed(1)} km · {seg.profiles?.name || "Transportista"}
                      </p>
                      {seg.profiles?.phone && (
                        <p className="text-muted-foreground">Tel: {seg.profiles.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {item.segments.length === 1 && item.transporter && (
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium">Transportista asignado:</p>
                  <p className="text-sm">{item.transporter.name}</p>
                  {item.transporter.phone && (
                    <p className="text-sm">Tel: {item.transporter.phone}</p>
                  )}
                  {item.segments[0]?.distance_km > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Distancia estimada: {item.segments[0].distance_km.toFixed(1)} km
                    </p>
                  )}
                </div>
              )}

              {item.segments.length === 0 && item.transporter && (
                <div className="bg-muted rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium">Transportista asignado:</p>
                  <p className="text-sm">{item.transporter.name}</p>
                  {item.transporter.phone && (
                    <p className="text-sm">Tel: {item.transporter.phone}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function renderConexionesTab() {
    const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "outline", confirmed: "default", in_progress: "secondary", completed: "default", cancelled: "destructive",
    }
    const statusLabels: Record<string, string> = {
      pending: "Pendiente", confirmed: "Confirmado", in_progress: "En progreso", completed: "Completado", cancelled: "Cancelado",
    }

    if (matches.length === 0) {
      return <p className="text-muted-foreground">No tienes conexiones aún.</p>
    }

    return (
      <div className="space-y-4">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {match.created_at ? new Date(match.created_at).toLocaleDateString() : ""}
                  </p>
                  {match.travel_requests && (
                    <p className="font-medium mt-1">
                      {match.travel_requests.origin_city || match.travel_requests.origin_state}
                      <ArrowRight className="inline h-4 w-4 mx-1" />
                      {match.travel_requests.destination_city || "Sin destino"}
                    </p>
                  )}
                </div>
                <Badge variant={statusVariant[match.status] ?? "outline"}>
                  {statusLabels[match.status] || match.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function renderOrganizacionTab() {
    const [org, setOrg] = useState<Record<string, unknown> | null>(null)
    const [members, setMembers] = useState<Record<string, unknown>[]>([])
    const [loadingOrg, setLoadingOrg] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [orgName, setOrgName] = useState("")
    const [orgDesc, setOrgDesc] = useState("")
    const [orgEmail, setOrgEmail] = useState("")
    const [orgPhone, setOrgPhone] = useState("")
    const [inviteEmail, setInviteEmail] = useState("")
    const [creating, setCreating] = useState(false)
    const [inviting, setInviting] = useState(false)

    useEffect(() => {
      fetchOrg()
    }, [])

    async function fetchOrg() {
      try {
        const res = await fetch("/api/organizations")
        const json = await res.json()
        if (json.organization) {
          setOrg(json.organization)
          setMembers(json.members || [])
        }
      } catch {
        // sin org
      } finally {
        setLoadingOrg(false)
      }
    }

    async function handleCreateOrg() {
      if (!orgName.trim()) return
      setCreating(true)
      try {
        const res = await fetch("/api/organizations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: orgName,
            description: orgDesc,
            contact_email: orgEmail,
            contact_phone: orgPhone,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        toast.success("Organización creada exitosamente")
        setShowCreate(false)
        setOrgName("")
        setOrgDesc("")
        setOrgEmail("")
        setOrgPhone("")
        fetchOrg()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tc("error"))
      } finally {
        setCreating(false)
      }
    }

    async function handleInvite() {
      if (!inviteEmail.trim() || !org) return
      setInviting(true)
      try {
        const res = await fetch("/api/organizations/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organization_id: org.id,
            member_email: inviteEmail,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        toast.success("Miembro agregado exitosamente")
        setInviteEmail("")
        fetchOrg()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : tc("error"))
      } finally {
        setInviting(false)
      }
    }

    if (loadingOrg) {
      return <div className="h-24 bg-muted animate-pulse rounded-xl" />
    }

    if (!org && !showCreate) {
      return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">No tienes una organización</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crea una organización para gestionar miembros y dar seguimiento a tus ayudas.
              </p>
              <Button onClick={() => setShowCreate(true)} className="rounded-full">
                Crear Organización
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (showCreate) {
      return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Crear Organización</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de la organización</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Ej: Fundación Ayuda Venezuela" />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea value={orgDesc} onChange={(e) => setOrgDesc(e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email de contacto</Label>
                    <Input value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowCreate(false)} className="rounded-full">Cancelar</Button>
                  <Button onClick={handleCreateOrg} disabled={creating || !orgName.trim()} className="rounded-full">
                    {creating ? "Creando..." : "Crear Organización"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{org?.name as string}</h3>
                {(org?.description as string) && (
                  <p className="text-sm text-muted-foreground mt-1">{org?.description as string}</p>
                )}
              </div>
              <Badge>{org?.status as string}</Badge>
            </div>
            {((org?.contact_email as string) || (org?.contact_phone as string)) && (
              <div className="text-sm text-muted-foreground mb-4">
                {(org?.contact_email as string) && <p>Email: {org?.contact_email as string}</p>}
                {(org?.contact_phone as string) && <p>Tel: {org?.contact_phone as string}</p>}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{members.length}</p>
                <p className="text-sm text-muted-foreground">Miembros</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">--</p>
                <p className="text-sm text-muted-foreground">Ayudas activas</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">--</p>
                <p className="text-sm text-muted-foreground">Solicitudes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3">Miembros</h4>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin miembros aún</p>
            ) : (
              <div className="space-y-2">
                {members.map((m) => {
                  const profile = m.profiles as Record<string, string> | undefined
                  return (
                    <div key={m.id as string} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-medium">{profile?.name || "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground">{profile?.email || ""}</p>
                      </div>
                      <Badge variant="outline">{m.role as string}</Badge>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4 border-t border-border pt-4">
              <h5 className="text-sm font-medium mb-2">Agregar miembro</h5>
              <div className="flex gap-2">
                <Input
                  placeholder="Email del miembro..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                  {inviting ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
