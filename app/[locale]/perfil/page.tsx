"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { getSupabase, TABLES, type Role } from "@/types/supabase"
import { toast } from "sonner"
import { SkeletonProfile } from "@/components/ui/skeleton"
import { StatCard } from "@/components/ui/stat-card"
import {
  ArrowRight,
  Building,
  Building2,
  ClipboardList,
  FileText,
  HeartHandshake,
  LogOut,
  MapPin,
  MessageSquare,
  Phone,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import SolicitudesPanel from "./solicitudes-panel"
import EmpresaPanel from "./empresa-panel"
import MensajesPanel from "./mensajes-panel"
import { PublicationSection } from "@/components/perfil/publication-section"
import { PublicationDetailDialog } from "@/components/perfil/publication-detail-dialog"
import { StatusBadge } from "@/components/perfil/status-badge"
import type { Publication } from "@/components/perfil/publication-types"

const TAB_ICONS: Record<string, LucideIcon> = {
  publicaciones: FileText,
  solicitudes: ClipboardList,
  ayuda: HeartHandshake,
  conexiones: Users,
  empresa: Building2,
  organizacion: Building,
  mensajes: MessageSquare,
}

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
  travel_requests?: { origin_city: string; origin_state: string; destination_city: string; people_to_move: number; user_id?: string }
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
  const [ownProfile, setOwnProfile] = useState<Record<string, unknown> | null>(null)
  const [userRole, setUserRole] = useState("")
  const [travelReqs, setTravelReqs] = useState<TravelRequest[]>([])
  const [transportOffers, setTransportOffers] = useState<TransportOffer[]>([])
  const [housingOffers, setHousingOffers] = useState<Record<string, unknown>[]>([])
  const [supplies, setSupplies] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [hasCompanies, setHasCompanies] = useState(false)
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)

  const [availableReqs, setAvailableReqs] = useState<TravelRequest[]>([])
  const [availableProfiles, setAvailableProfiles] = useState<Record<string, Profile>>({})

  const [ayudaData, setAyudaData] = useState<(TravelRequest & { match?: Match; transporter?: Profile; segments: Segment[] })[]>([])

  const [matches, setMatches] = useState<Match[]>([])
  const [matchProfiles, setMatchProfiles] = useState<Record<string, Profile>>({})

  const [localTab, setLocalTab] = useState<string>("")

  const computedActiveTab = useMemo(() => {
    const validTabs = ALL_TABS.filter((tab) => {
      if (tab.roles.includes("*")) return true
      if (tab.roles.includes("empresa")) return hasCompanies
      return tab.roles.includes(userRole)
    }).map((t) => t.id)

    if (tabParam && validTabs.includes(tabParam)) return tabParam
    return "publicaciones"
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

        const [travelRes, transportRes, housingRes, companyRes, profileRes, suppliesRes] = await Promise.all([
          supabase.from(TABLES.TRAVEL_REQUESTS).select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as never as { data: TravelRequest[] | null },
          supabase.from(TABLES.TRANSPORT_OFFERS).select("*").eq("user_id", user.id) as never as { data: TransportOffer[] | null },
          supabase.from(TABLES.HOUSING_OFFERS).select("*").eq("user_id", user.id) as never as { data: Record<string, unknown>[] | null },
          supabase.from(TABLES.COMPANIES).select("id").eq("user_id", user.id) as never as { data: { id: string }[] | null },
          supabase.from(TABLES.PROFILES).select("*").eq("id", user.id).single() as never as { data: Record<string, unknown> | null },
          supabase.from(TABLES.SUPPLIES).select("*").eq("user_id", user.id).order("created_at", { ascending: false }) as never as { data: Record<string, unknown>[] | null },
        ])

        setTravelReqs(travelRes.data ?? [])
        setTransportOffers(transportRes.data ?? [])
        setHousingOffers(housingRes.data ?? [])
        setHasCompanies((companyRes.data?.length ?? 0) > 0)
        setOwnProfile(profileRes.data ?? null)
        setSupplies(suppliesRes.data ?? [])

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
        .select("*, travel_requests:travel_request_id(origin_city, origin_state, destination_city, people_to_move, user_id)")
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
          .select("*, travel_requests:travel_request_id(origin_city, origin_state, destination_city, people_to_move, user_id)")
          .in("travel_request_id", ids)
          .order("created_at", { ascending: false }) as never as { data: Match[] | null }
      })(),
    ])

    const all = [...(asTransporter.data ?? []), ...(asVictim.data ?? [])]
    const seen = new Set<string>()
    const unique = all.filter((m) => { if (seen.has(m.id)) return false; seen.add(m.id); return true })
    setMatches(unique)

    const counterpartIds = [
      ...new Set(
        unique
          .map((m) => (m.user_id === userId ? m.travel_requests?.user_id : m.user_id))
          .filter((id): id is string => Boolean(id))
      ),
    ]

    if (counterpartIds.length > 0) {
      const { data: profiles } = await (supabase
        .from(TABLES.PROFILES)
        .select("id, name, phone")
        .in("id", counterpartIds) as never as { data: { id: string; name: string; phone: string }[] | null })
      const map: Record<string, Profile> = {}
      for (const p of profiles ?? []) map[p.id] = { name: p.name, phone: p.phone }
      setMatchProfiles(map)
    }
  }

  function handleLogout() {
    getSupabase().auth.signOut()
    router.push("/")
  }

  if (loading) return <SkeletonProfile />
  if (!user) return null

  const userMetadata = user.user_metadata as Record<string, unknown> | undefined
  const fullName = (ownProfile?.name as string) || (userMetadata?.name as string) || "Usuario"
  const memberSince = (ownProfile?.created_at as string | undefined) ?? (user.created_at as string | undefined)
  const volunteerType = ownProfile?.volunteer_type as string
  const isGestion = userRole === "voluntario" && (volunteerType === "gestion" || volunteerType === "ambos")

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold uppercase text-primary-foreground">
            {getInitials(fullName)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold leading-tight">{t("perfil")}</h1>
            <p className="truncate text-sm text-muted-foreground">{fullName}</p>
            {memberSince && (
              <p className="text-xs text-muted-foreground">
                Miembro desde el {new Date(memberSince).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
            {roleLabels[(userRole as Role) || "damnificado"]}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-card px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("cerrarSesion")}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <StatCard
          label={t("solicitarViaje")}
          value={String(travelReqs.length)}
          desc="Tus solicitudes de traslado registradas."
        />
        <StatCard
          label={t("ofrecerTransporte")}
          value={String(transportOffers.length)}
          desc="Tus ofertas de transporte publicadas."
        />
        <StatCard
          label={t("ofrecerHospedaje")}
          value={String(housingOffers.length)}
          desc="Tus ofertas de hospedaje publicadas."
        />
      </div>

      {isGestion && (
        <Card className="mb-6">
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

      <div className="mb-6 flex flex-wrap gap-2">
        {availableTabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id]
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setLocalTab(tab.id)
                router.replace(`/${locale}/perfil?tab=${tab.id}`, { scroll: false })
              }}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "publicaciones" && renderPublicacionesTab()}
      {activeTab === "solicitudes" && (
        <SolicitudesPanel availableReqs={availableReqs} availableProfiles={availableProfiles} transportOfferCount={transportOffers.length} />
      )}
      {activeTab === "ayuda" && renderAyudaTab()}
      {activeTab === "conexiones" && renderConexionesTab()}
      {activeTab === "empresa" && <EmpresaPanel />}
      {activeTab === "organizacion" && renderOrganizacionTab()}
      {activeTab === "mensajes" && <MensajesPanel />}

      <PublicationDetailDialog
        publication={selectedPublication}
        onOpenChange={(open) => !open && setSelectedPublication(null)}
      />
    </div>
  )

  function renderPublicacionesTab() {
    const hasAnyPublication =
      travelReqs.length > 0 || transportOffers.length > 0 || housingOffers.length > 0 || supplies.length > 0

    return (
      <div className="space-y-8">
        <PublicationSection
          title={t("solicitarViaje")}
          kind="travel_request"
          items={travelReqs as unknown as Publication["data"][]}
          onSelect={setSelectedPublication}
        />
        <PublicationSection
          title={t("ofrecerTransporte")}
          kind="transport_offer"
          items={transportOffers as unknown as Publication["data"][]}
          onSelect={setSelectedPublication}
        />
        <PublicationSection
          title={t("ofrecerHospedaje")}
          kind="housing_offer"
          items={housingOffers as unknown as Publication["data"][]}
          onSelect={setSelectedPublication}
        />
        <PublicationSection
          title="Insumos y Donaciones Físicas"
          kind="supply"
          items={supplies as unknown as Publication["data"][]}
          onSelect={setSelectedPublication}
        />
        {!hasAnyPublication && (
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
    if (matches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
          <Users className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No tienes conexiones aún</p>
          <p className="mx-auto max-w-xs text-sm text-muted-foreground">
            Cuando tomes una solicitud o alguien tome la tuya, aparecerá aquí.
          </p>
        </div>
      )
    }

    const currentUserId = user?.id as string | undefined

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => {
          const counterpartId = match.user_id === currentUserId ? match.travel_requests?.user_id : match.user_id
          const counterpart = counterpartId ? matchProfiles[counterpartId] : undefined

          return (
            <Card key={match.id} className="flex flex-col transition-shadow hover:shadow-md">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
                      {counterpart?.name ? getInitials(counterpart.name) : "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{counterpart?.name || "Usuario"}</p>
                      <p className="text-xs text-muted-foreground">
                        {match.created_at ? new Date(match.created_at).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={match.status} className="mt-0.5" />
                </div>

                {match.travel_requests && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {match.travel_requests.origin_city || match.travel_requests.origin_state}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0" />
                    <span className="truncate">{match.travel_requests.destination_city || "Sin destino"}</span>
                  </div>
                )}

                <div className="mt-auto flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => {
                      setLocalTab("mensajes")
                      router.replace(`/${locale}/perfil?tab=mensajes`, { scroll: false })
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Mensaje
                  </Button>
                  {counterpart?.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      nativeButton={false}
                      render={<a href={`tel:${counterpart.phone}`} aria-label={`Llamar a ${counterpart.name}`} />}
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
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
