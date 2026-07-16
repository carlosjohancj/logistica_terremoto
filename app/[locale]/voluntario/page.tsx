"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getSupabase, TABLES } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Users, Home, Truck, ClipboardCheck, UserPlus, Search,
  Building2, MapPin, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle, Loader2, Eye,
  UserCog, Package, Briefcase, type LucideIcon,
} from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import { getCitiesByState } from "@/lib/estados"

type TabDef = {
  id: string
  label: string
  icon: LucideIcon
}

const TABS: TabDef[] = [
  { id: "resumen", label: "Resumen", icon: Users },
  { id: "registrar", label: "Registrar", icon: UserPlus },
  { id: "verificar", label: "Verificar", icon: ClipboardCheck },
  { id: "logistica", label: "Logística", icon: Truck },
  { id: "conexiones", label: "Conexiones", icon: Search },
  { id: "organizacion", label: "Mi Organización", icon: Building2 },
]

type DashboardStats = {
  total_families: number
  pending_verification: number
  verified: number
  active_trips: number
  total_transportistas: number
}

type Family = Record<string, unknown> & {
  id: string
  user_id: string
  origin_city: string
  origin_state: string
  destination_city: string | null
  destination_state: string | null
  people_to_move: number
  verification_status: string
  status: string
  created_at: string
  building_info: Record<string, unknown> | null
  verification_notes: string | null
  profiles?: { name: string; phone: string } | null
}

type TransportOffer = {
  id: string
  user_id: string
  vehicle_type: string
  capacity: number
  origin_state: string
  origin_city: string
  destination_state: string
  destination_city: string
  status: string
  profiles?: { name: string; phone: string } | null
}

export default function VoluntarioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [activeTab, setActiveTab] = useState("resumen")

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Register family form
  const [familyName, setFamilyName] = useState("")
  const [adultsCount, setAdultsCount] = useState(1)
  const [childrenCount, setChildrenCount] = useState(0)
  const [originState, setOriginState] = useState<string | null>(null)
  const [originCity, setOriginCity] = useState<string | null>(null)
  const [hasDestination, setHasDestination] = useState(false)
  const [destState, setDestState] = useState<string | null>(null)
  const [destCity, setDestCity] = useState<string | null>(null)
  const [housingDestruction, setHousingDestruction] = useState<string | null>("se_puede_reparar")
  const [buildingDestroyed, setBuildingDestroyed] = useState(false)
  const [totalLoss, setTotalLoss] = useState(false)
  const [noDestination, setNoDestination] = useState(false)
  const [buildingAddress, setBuildingAddress] = useState("")
  const [familyNotes, setFamilyNotes] = useState("")
  const [registering, setRegistering] = useState(false)
  const [credentials, setCredentials] = useState<Record<string, string> | null>(null)

  // Register transportista form
  const [tpName, setTpName] = useState("")
  const [tpPhone, setTpPhone] = useState("")
  const [tpVehicle, setTpVehicle] = useState<string | null>("carro")
  const [tpCapacity, setTpCapacity] = useState(1)
  const [tpOriginState, setTpOriginState] = useState<string | null>(null)
  const [tpOriginCity, setTpOriginCity] = useState<string | null>(null)
  const [tpDestState, setTpDestState] = useState<string | null>(null)
  const [tpDestCity, setTpDestCity] = useState<string | null>(null)
  const [registeringTp, setRegisteringTp] = useState(false)
  const [tpCredentials, setTpCredentials] = useState<Record<string, string> | null>(null)

  // Families list
  const [families, setFamilies] = useState<Family[]>([])
  const [familiesLoading, setFamiliesLoading] = useState(false)
  const [familyFilter, setFamilyFilter] = useState("unverified")

  // Verify dialog
  const [verifyTarget, setVerifyTarget] = useState<Family | null>(null)
  const [verifyNotes, setVerifyNotes] = useState("")
  const [verifyBuildingDestroyed, setVerifyBuildingDestroyed] = useState(false)
  const [verifyTotalLoss, setVerifyTotalLoss] = useState(false)
  const [verifyNoDest, setVerifyNoDest] = useState(false)
  const [verifyAddress, setVerifyAddress] = useState("")
  const [verifyContact, setVerifyContact] = useState("")
  const [verifyTestimonial, setVerifyTestimonial] = useState("")
  const [submittingVerify, setSubmittingVerify] = useState(false)

  // Transportistas list
  const [transportistas, setTransportistas] = useState<TransportOffer[]>([])
  const [transportistasLoading, setTransportistasLoading] = useState(false)

  // Assign transport dialog
  const [assignTarget, setAssignTarget] = useState<Family | null>(null)
  const [selectedTp, setSelectedTp] = useState<string | null>(null)
  const [assignDate, setAssignDate] = useState("")
  const [assigning, setAssigning] = useState(false)

  // Origin/destination cities
  const [originCities, setOriginCities] = useState<string[]>([])
  const [destCities, setDestCities] = useState<string[]>([])
  const [tpOriginCities, setTpOriginCities] = useState<string[]>([])
  const [tpDestCities, setTpDestCities] = useState<string[]>([])

  const [activeTrips, setActiveTrips] = useState<Family[]>([])
  const [loadingTrips, setLoadingTrips] = useState(true)

  const [org, setOrg] = useState<Record<string, unknown> | null>(null)
  const [members, setMembers] = useState<Record<string, unknown>[]>([])
  const [loadingOrg, setLoadingOrg] = useState(true)

  useEffect(() => {
    async function loadOrg() {
      try {
        const res = await fetch("/api/organizations")
        const json = await res.json()
        if (json.organization) {
          setOrg(json.organization)
          setMembers(json.members || [])
        }
      } catch { /* ignore */ }
      setLoadingOrg(false)
    }
    loadOrg()
  }, [])

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/volunteer/families?status=verified")
        const json = await res.json()
        if (res.ok) setActiveTrips((json.families ?? []).filter((f: Family) => f.status !== "completed"))
      } catch { /* ignore */ }
      setLoadingTrips(false)
    }
    loadTrips()
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      const role = (user.user_metadata as Record<string, unknown>)?.role as string
      if (role !== "voluntario" && role !== "admin") { router.push("/perfil"); return }
      setUser(user as unknown as Record<string, unknown>)
      setLoading(false)
      loadStats()
      loadFamilies("unverified")
    }
    init()
  }, [router])

  useEffect(() => {
    if (originState) getCitiesByState(originState).then(setOriginCities)
  }, [originState])

  useEffect(() => {
    if (destState) getCitiesByState(destState).then(setDestCities)
  }, [destState])

  useEffect(() => {
    if (tpOriginState) getCitiesByState(tpOriginState).then(setTpOriginCities)
  }, [tpOriginState])

  useEffect(() => {
    if (tpDestState) getCitiesByState(tpDestState).then(setTpDestCities)
  }, [tpDestState])

  async function loadStats() {
    setStatsLoading(true)
    try {
      const res = await fetch("/api/volunteer/dashboard")
      const json = await res.json()
      if (res.ok) setStats(json.stats)
    } catch { /* ignore */ }
    setStatsLoading(false)
  }

  async function loadFamilies(status?: string) {
    setFamiliesLoading(true)
    try {
      const params = new URLSearchParams()
      if (status) params.set("status", status)
      params.set("org", "true")
      const res = await fetch(`/api/volunteer/families?${params}`)
      const json = await res.json()
      if (res.ok) setFamilies(json.families ?? [])
    } catch { /* ignore */ }
    setFamiliesLoading(false)
  }

  async function loadTransportistas() {
    setTransportistasLoading(true)
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from(TABLES.TRANSPORT_OFFERS)
        .select("*, profiles:user_id(name, phone)")
        .eq("status", "open") as never as { data: TransportOffer[] | null }
      setTransportistas(data ?? [])
    } catch { /* ignore */ }
    setTransportistasLoading(false)
  }

  async function handleRegisterFamily() {
    if (!familyName.trim()) { toast.error("Nombre de la familia requerido"); return }
    setRegistering(true)
    try {
      const res = await fetch("/api/volunteer/register-family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyName,
          adultsCount,
          childrenCount,
          originState,
          originCity,
          hasDestination,
          destinationState: hasDestination ? destState : null,
          destinationCity: hasDestination ? destCity : null,
          housingDestruction,
          buildingInfo: { destroyed: buildingDestroyed, total_loss: totalLoss, no_destination: noDestination, address: buildingAddress },
          notes: familyNotes,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setCredentials(json.credentials)
      toast.success("Familia registrada exitosamente")
      loadStats()
      loadFamilies(familyFilter)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar")
    }
    setRegistering(false)
  }

  async function handleRegisterTransportista() {
    if (!tpName.trim()) { toast.error("Nombre requerido"); return }
    setRegisteringTp(true)
    try {
      const res = await fetch("/api/volunteer/register-transportista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tpName,
          phone: tpPhone,
          vehicleType: tpVehicle,
          capacity: tpCapacity,
          originState: tpOriginState,
          originCity: tpOriginCity,
          destinationState: tpDestState,
          destinationCity: tpDestCity,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setTpCredentials(json.credentials)
      toast.success("Transportista registrado exitosamente")
      loadStats()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al registrar")
    }
    setRegisteringTp(false)
  }

  async function handleVerify() {
    if (!verifyTarget) return
    setSubmittingVerify(true)
    try {
      const res = await fetch("/api/volunteer/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          travel_request_id: verifyTarget.id,
          building_destroyed: verifyBuildingDestroyed,
          total_loss: verifyTotalLoss,
          no_destination: verifyNoDest,
          building_address: verifyAddress,
          testimonial: verifyTestimonial,
          verification_notes: verifyNotes,
          reference_contact: verifyContact,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success("Familia verificada exitosamente")
      setVerifyTarget(null)
      setVerifyNotes("")
      setVerifyBuildingDestroyed(false)
      setVerifyTotalLoss(false)
      setVerifyNoDest(false)
      setVerifyAddress("")
      setVerifyContact("")
      setVerifyTestimonial("")
      loadStats()
      loadFamilies(familyFilter)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al verificar")
    }
    setSubmittingVerify(false)
  }

  async function handleAssignTransport() {
    if (!assignTarget || !selectedTp) { toast.error("Selecciona un transportista"); return }
    setAssigning(true)
    try {
      const res = await fetch("/api/volunteer/assign-transport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          travel_request_id: assignTarget.id,
          transportista_id: selectedTp,
          origin_city: assignTarget.origin_city,
          origin_state: assignTarget.origin_state,
          destination_city: assignTarget.destination_city || assignTarget.origin_city,
          destination_state: assignTarget.destination_state || assignTarget.origin_state,
          scheduled_date: assignDate || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success("Transportista asignado exitosamente")
      setAssignTarget(null)
      setSelectedTp("")
      setAssignDate("")
      loadStats()
      loadFamilies(familyFilter)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al asignar")
    }
    setAssigning(false)
  }

  function switchTab(tabId: string) {
    setActiveTab(tabId)
    if (tabId === "verificar") loadFamilies(familyFilter)
    if (tabId === "conexiones") loadTransportistas()
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>

  const userMetadata = user?.user_metadata as Record<string, unknown> | undefined
  const userName = userMetadata?.name as string || "Voluntario"

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold uppercase text-primary-foreground">
            {getInitials(userName)}
          </span>
          <div>
            <h1 className="text-2xl font-bold">Panel de Voluntario</h1>
            <p className="text-sm text-muted-foreground">{userName}</p>
          </div>
        </div>
        <Badge className="self-start sm:self-center text-sm px-4 py-1.5">Voluntario</Badge>
      </div>

      {credentials && (
        <Card className="mb-6 border-green-500/30 bg-green-500/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">Credenciales de la familia</h3>
                <p className="text-sm mt-2 font-mono">Email: {credentials.email}</p>
                <p className="text-sm font-mono">Contraseña: {credentials.password}</p>
                <p className="text-sm text-muted-foreground mt-1">Entrega estas credenciales a la familia para que puedan acceder a la plataforma.</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setCredentials(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tpCredentials && (
        <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-400">Credenciales del transportista</h3>
                <p className="text-sm mt-2 font-mono">Email: {tpCredentials.email}</p>
                <p className="text-sm font-mono">Contraseña: {tpCredentials.password}</p>
                <p className="text-sm text-muted-foreground mt-1">Entrega estas credenciales al transportista.</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setTpCredentials(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "resumen" && renderResumen()}
      {activeTab === "registrar" && renderRegistrar()}
      {activeTab === "verificar" && renderVerificar()}
      {activeTab === "logistica" && renderLogistica()}
      {activeTab === "conexiones" && renderConexiones()}
      {activeTab === "organizacion" && renderOrganizacion()}

      <Dialog open={!!verifyTarget} onOpenChange={(open) => !open && setVerifyTarget(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verificar Familia</DialogTitle>
            <DialogDescription>
              {verifyTarget && `${verifyTarget.profiles?.name || "Familia"} — ${verifyTarget.origin_city}, ${verifyTarget.origin_state}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2 rounded-lg border p-4">
              <p className="text-sm font-medium">Checklist de verificación</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={verifyBuildingDestroyed} onChange={(e) => setVerifyBuildingDestroyed(e.target.checked)} className="accent-primary" />
                <span className="text-sm">Edificio destruido</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={verifyTotalLoss} onChange={(e) => setVerifyTotalLoss(e.target.checked)} className="accent-primary" />
                <span className="text-sm">Pérdida total</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={verifyNoDest} onChange={(e) => setVerifyNoDest(e.target.checked)} className="accent-primary" />
                <span className="text-sm">Sin destino / no tiene a dónde ir</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Dirección del edificio donde vivía</Label>
              <Input value={verifyAddress} onChange={(e) => setVerifyAddress(e.target.value)} placeholder="Ej: Av. Principal, edificio 5, La Guaira" />
            </div>
            <div className="space-y-2">
              <Label>Testimonio / relato</Label>
              <Textarea value={verifyTestimonial} onChange={(e) => setVerifyTestimonial(e.target.value)} rows={2} placeholder="Breve relato de lo que pasó..." />
            </div>
            <div className="space-y-2">
              <Label>Contacto de referencia (opcional)</Label>
              <Input value={verifyContact} onChange={(e) => setVerifyContact(e.target.value)} placeholder="Nombre y teléfono de alguien que confirme" />
            </div>
            <div className="space-y-2">
              <Label>Notas del voluntario</Label>
              <Textarea value={verifyNotes} onChange={(e) => setVerifyNotes(e.target.value)} rows={2} placeholder="Observaciones adicionales..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyTarget(null)}>Cancelar</Button>
            <Button onClick={handleVerify} disabled={submittingVerify}>
              {submittingVerify ? "Verificando..." : "Confirmar Verificación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignTarget} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Transportista</DialogTitle>
            <DialogDescription>
              {assignTarget && `${assignTarget.origin_city} → ${assignTarget.destination_city || "Sin destino"}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Transportista</Label>
              <Select value={selectedTp ?? ""} onValueChange={(v) => setSelectedTp(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar transportista..." />
                </SelectTrigger>
                <SelectContent>
                  {transportistas.filter((t) => t.status === "open").map((t) => (
                    <SelectItem key={t.id} value={t.user_id}>
                      {t.profiles?.name || "Transportista"} — {t.origin_city} → {t.destination_city} ({t.capacity} pers.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha programada (opcional)</Label>
              <Input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancelar</Button>
            <Button onClick={handleAssignTransport} disabled={assigning || !selectedTp}>
              {assigning ? "Asignando..." : "Asignar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  function renderResumen() {
    if (statsLoading) return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>

    const items = [
      { icon: Users, label: "Familias registradas", value: String(stats?.total_families ?? 0), color: "text-blue-600" },
      { icon: AlertTriangle, label: "Pendientes de verificar", value: String(stats?.pending_verification ?? 0), color: "text-amber-600" },
      { icon: CheckCircle2, label: "Verificadas", value: String(stats?.verified ?? 0), color: "text-green-600" },
      { icon: Truck, label: "Viajes activos", value: String(stats?.active_trips ?? 0), color: "text-purple-600" },
      { icon: UserCog, label: "Transportistas disponibles", value: String(stats?.total_transportistas ?? 0), color: "text-indigo-600" },
    ]

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4 text-center">
                <item.icon className={cn("h-6 w-6 mx-auto mb-2", item.color)} />
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-2">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setActiveTab("registrar")}>
                <UserPlus className="h-3.5 w-3.5" /> Registrar familia
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveTab("verificar")}>
                <ClipboardCheck className="h-3.5 w-3.5" /> Verificar familias
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveTab("logistica")}>
                <Truck className="h-3.5 w-3.5" /> Asignar transporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderRegistrar() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Familia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la familia *</Label>
              <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="Ej: Familia Pérez" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adultos</Label>
                <Input type="number" min={1} value={adultsCount} onChange={(e) => setAdultsCount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Niños</Label>
                <Input type="number" min={0} value={childrenCount} onChange={(e) => setChildrenCount(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado de origen *</Label>
                <Select value={originState} onValueChange={(v) => setOriginState(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="La Guaira">La Guaira</SelectItem>
                    <SelectItem value="Caracas">Caracas</SelectItem>
                    <SelectItem value="Miranda">Miranda</SelectItem>
                    <SelectItem value="Zulia">Zulia</SelectItem>
                    <SelectItem value="Lara">Lara</SelectItem>
                    <SelectItem value="Carabobo">Carabobo</SelectItem>
                    <SelectItem value="Aragua">Aragua</SelectItem>
                    <SelectItem value="Anzoátegui">Anzoátegui</SelectItem>
                    <SelectItem value="Bolívar">Bolívar</SelectItem>
                    <SelectItem value="Mérida">Mérida</SelectItem>
                    <SelectItem value="Táchira">Táchira</SelectItem>
                    <SelectItem value="Monagas">Monagas</SelectItem>
                    <SelectItem value="Sucre">Sucre</SelectItem>
                    <SelectItem value="Falcón">Falcón</SelectItem>
                    <SelectItem value="Portuguesa">Portuguesa</SelectItem>
                    <SelectItem value="Barinas">Barinas</SelectItem>
                    <SelectItem value="Nueva Esparta">Nueva Esparta</SelectItem>
                    <SelectItem value="Amazonas">Amazonas</SelectItem>
                    <SelectItem value="Apure">Apure</SelectItem>
                    <SelectItem value="Cojedes">Cojedes</SelectItem>
                    <SelectItem value="Delta Amacuro">Delta Amacuro</SelectItem>
                    <SelectItem value="Guárico">Guárico</SelectItem>
                    <SelectItem value="Trujillo">Trujillo</SelectItem>
                    <SelectItem value="Vargas">Vargas</SelectItem>
                    <SelectItem value="Yaracuy">Yaracuy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad de origen *</Label>
                <Select value={originCity} onValueChange={(v) => setOriginCity(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {originCities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasDestination} onChange={(e) => setHasDestination(e.target.checked)} className="accent-primary" />
              <span className="text-sm">Tienen destino conocido</span>
            </label>
            {hasDestination && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label>Estado destino</Label>
                  <Select value={destState} onValueChange={(v) => setDestState(v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="La Guaira">La Guaira</SelectItem>
                      <SelectItem value="Caracas">Caracas</SelectItem>
                      <SelectItem value="Miranda">Miranda</SelectItem>
                      <SelectItem value="Zulia">Zulia</SelectItem>
                      <SelectItem value="Lara">Lara</SelectItem>
                      <SelectItem value="Carabobo">Carabobo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ciudad destino</Label>
                  <Select value={destCity} onValueChange={(v) => setDestCity(v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {destCities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Estado de la vivienda</Label>
              <Select value={housingDestruction} onValueChange={(v) => setHousingDestruction(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Destrucción total</SelectItem>
                  <SelectItem value="grave">Daños graves</SelectItem>
                  <SelectItem value="se_puede_reparar">Se puede reparar</SelectItem>
                  <SelectItem value="prestada_emergencia">Vivienda prestada/emergencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">Situación del edificio donde vivía</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={buildingDestroyed} onChange={(e) => setBuildingDestroyed(e.target.checked)} className="accent-primary" />
                <span className="text-sm">Edificio destruido</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={totalLoss} onChange={(e) => setTotalLoss(e.target.checked)} className="accent-primary" />
                <span className="text-sm">Perdieron todo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={noDestination} onChange={(e) => setNoDestination(e.target.checked)} className="accent-primary" />
                <span className="text-sm">No tienen a dónde ir</span>
              </label>
              <Input value={buildingAddress} onChange={(e) => setBuildingAddress(e.target.value)} placeholder="Dirección del edificio (opcional)" />
            </div>
            <div className="space-y-2">
              <Label>Notas adicionales</Label>
              <Textarea value={familyNotes} onChange={(e) => setFamilyNotes(e.target.value)} rows={2} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRegisterFamily} disabled={registering || !familyName.trim()} className="w-full">
              {registering ? "Registrando..." : "Registrar Familia"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Transportista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={tpName} onChange={(e) => setTpName(e.target.value)} placeholder="Nombre completo" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={tpPhone} onChange={(e) => setTpPhone(e.target.value)} placeholder="+58 XXX-XXX-XXXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de vehículo</Label>
                <Select value={tpVehicle} onValueChange={(v) => setTpVehicle(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="camioneta">Camioneta</SelectItem>
                    <SelectItem value="camion">Camión</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacidad (personas)</Label>
                <Input type="number" min={1} value={tpCapacity} onChange={(e) => setTpCapacity(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado de origen *</Label>
                <Select value={tpOriginState} onValueChange={(v) => setTpOriginState(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="La Guaira">La Guaira</SelectItem>
                    <SelectItem value="Caracas">Caracas</SelectItem>
                    <SelectItem value="Miranda">Miranda</SelectItem>
                    <SelectItem value="Zulia">Zulia</SelectItem>
                    <SelectItem value="Lara">Lara</SelectItem>
                    <SelectItem value="Carabobo">Carabobo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad origen</Label>
                <Select value={tpOriginCity} onValueChange={(v) => setTpOriginCity(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {tpOriginCities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado destino *</Label>
                <Select value={tpDestState} onValueChange={(v) => setTpDestState(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="La Guaira">La Guaira</SelectItem>
                    <SelectItem value="Caracas">Caracas</SelectItem>
                    <SelectItem value="Miranda">Miranda</SelectItem>
                    <SelectItem value="Zulia">Zulia</SelectItem>
                    <SelectItem value="Lara">Lara</SelectItem>
                    <SelectItem value="Carabobo">Carabobo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ciudad destino</Label>
                <Select value={tpDestCity} onValueChange={(v) => setTpDestCity(v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {tpDestCities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRegisterTransportista} disabled={registeringTp || !tpName.trim()} variant="secondary" className="w-full">
              {registeringTp ? "Registrando..." : "Registrar Transportista"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  function renderVerificar() {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">Filtrar:</span>
          {["unverified", "verified", "rejected"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setFamilyFilter(s); loadFamilies(s) }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                familyFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
              )}
            >
              {s === "unverified" ? "Sin verificar" : s === "verified" ? "Verificadas" : "Rechazadas"}
            </button>
          ))}
        </div>

        {familiesLoading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : families.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardCheck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">No hay familias {familyFilter === "unverified" ? "pendientes" : "en este estado"}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {families.map((family) => (
              <Card key={family.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{family.profiles?.name || "Familia"}</span>
                        <Badge variant={family.verification_status === "verified" ? "default" : family.verification_status === "rejected" ? "destructive" : "secondary"}>
                          {family.verification_status === "unverified" ? "Sin verificar" : family.verification_status === "verified" ? "Verificada" : "Rechazada"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {family.origin_city}, {family.origin_state}
                        {family.destination_city && <><ArrowRight className="h-3 w-3" />{family.destination_city}</>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{family.people_to_move} personas · {new Date(family.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      setVerifyTarget(family)
                      setVerifyNotes("")
                      setVerifyBuildingDestroyed(false)
                      setVerifyTotalLoss(false)
                      setVerifyNoDest(false)
                      setVerifyAddress("")
                      setVerifyContact("")
                      setVerifyTestimonial("")
                    }}>
                      <Eye className="h-3.5 w-3.5" /> Verificar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderLogistica() {
    if (loadingTrips) return <div className="space-y-3">{[1,2].map((i) => <Skeleton key={i} className="h-24" />)}</div>

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Familias verificadas — viajes activos</h3>
          <Button size="sm" variant="outline" onClick={() => { loadTransportistas(); setActiveTab("conexiones") }}>
            Ver transportistas disponibles
          </Button>
        </div>
        {activeTrips.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">No hay viajes activos</p>
              <p className="text-sm text-muted-foreground">Las familias verificadas aparecerán aquí para asignarles transporte.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeTrips.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{trip.profiles?.name || "Familia"}</span>
                        <Badge variant="outline">{trip.people_to_move} pers.</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {trip.origin_city}, {trip.origin_state}
                        <ArrowRight className="h-3 w-3" />
                        {trip.destination_city || "Sin destino"}
                      </div>
                      {trip.building_info && !!(trip.building_info as Record<string, unknown>).destroyed && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          Edificio destruido
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      loadTransportistas()
                      setAssignTarget(trip)
                      setSelectedTp(null)
                      setAssignDate("")
                    }}>
                      <Truck className="h-3.5 w-3.5" /> Asignar Transporte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderConexiones() {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transportistas Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            {transportistasLoading ? (
              <div className="space-y-3">{[1,2].map((i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : transportistas.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay transportistas disponibles.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {transportistas.filter((t) => t.status === "open").map((t) => (
                  <div key={t.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{t.profiles?.name || "Transportista"}</span>
                      <Badge variant="outline" className="text-xs">{t.vehicle_type}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {t.origin_city} → {t.destination_city}
                    </div>
                    <p className="text-xs text-muted-foreground">Capacidad: {t.capacity} pers.</p>
                    {t.profiles?.phone && (
                      <a href={`https://wa.me/${t.profiles.phone.replace(/^\+/, "")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                        WhatsApp
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas con Empleos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Próximamente: conexión con empresas para referir familias a empleos disponibles.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  function renderOrganizacion() {
    if (loadingOrg) return <Skeleton className="h-32" />

    if (!org) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">No perteneces a una organización</p>
            <p className="text-sm text-muted-foreground mt-1">Puedes operar como voluntario autónomo o solicitar unirte a una organización desde tu perfil.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg">{org.name as string}</h3>
            {!!org.description && <p className="text-sm text-muted-foreground mt-1">{org.description as string}</p>}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-primary">{members.length}</p>
                <p className="text-xs text-muted-foreground">Miembros</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-primary">{stats?.total_families ?? 0}</p>
                <p className="text-xs text-muted-foreground">Familias</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-primary">{members.filter((m) => m.role === "admin").length}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Miembros del equipo</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin miembros</p>
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
          </CardContent>
        </Card>
      </div>
    )
  }
}
