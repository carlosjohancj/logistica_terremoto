"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getSupabase, TABLES } from "@/types/supabase"
import { toast } from "sonner"
import { SkeletonDetail } from "@/components/ui/skeleton"
import { Shield, Users, Building2, Briefcase, Package, HandHeart } from "lucide-react"

type Post = {
  id: string
  status: string
  created_at?: string
  created?: string
  [key: string]: unknown
}

type Provider = {
  id: string
  name: string
  description: string
  website: string
  donation_link: string
  contact_email: string
  contact_phone: string
  services: string[]
  logo_url: string
  status: string
  created_at: string
}

export default function AdminPage() {
  const tc = useTranslations("common")
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [travelReqs, setTravelReqs] = useState<Post[]>([])
  const [transportOffers, setTransportOffers] = useState<Post[]>([])
  const [housingOffers, setHousingOffers] = useState<Post[]>([])
  const [companies, setCompanies] = useState<Post[]>([])
  const [supplies, setSupplies] = useState<Post[]>([])
  const [jobs, setJobs] = useState<Post[]>([])
  const [providers, setProviders] = useState<Provider[]>([])

  const [editProvider, setEditProvider] = useState<Provider | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [formName, setFormName] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formWebsite, setFormWebsite] = useState("")
  const [formDonationLink, setFormDonationLink] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formServices, setFormServices] = useState("")
  const [formLogo, setFormLogo] = useState("")
  const [formStatus, setFormStatus] = useState("active")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function init() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      const { data: profile } = await supabase.from(TABLES.PROFILES).select("role").eq("id", user.id).single()
      if (profile?.role !== "admin") {
        router.push("/auth/login")
        return
      }
      setIsAdmin(true)
      setAuthChecked(true)
      loadAll()
    }
    init()
  }, [])

  async function loadAll() {
    const supabase = getSupabase()
    try {
      const [travel, transport, housing, comps, supps, jbs, provs] = await Promise.all([
        supabase.from(TABLES.TRAVEL_REQUESTS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.TRANSPORT_OFFERS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.HOUSING_OFFERS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.COMPANIES).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.SUPPLIES).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.JOBS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.SERVICE_PROVIDERS).select("*").order("name"),
      ])
      setTravelReqs((travel.data || []) as unknown as Post[])
      setTransportOffers((transport.data || []) as unknown as Post[])
      setHousingOffers((housing.data || []) as unknown as Post[])
      setCompanies((comps.data || []) as unknown as Post[])
      setSupplies((supps.data || []) as unknown as Post[])
      setJobs((jbs.data || []) as unknown as Post[])
      setProviders((provs.data || []) as unknown as Provider[])
    } catch {
      toast.error(tc("error"))
    }
  }

  async function updateStatus(collection: string, id: string, status: string) {
    try {
      const supabase = getSupabase()
      await supabase.from(collection).update({ status } as never).eq("id", id)
      toast.success(`Estado actualizado a: ${status}`)
      loadAll()
    } catch {
      toast.error(tc("error"))
    }
  }

  function openCreate() {
    setEditProvider(null)
    setFormName("")
    setFormDesc("")
    setFormWebsite("")
    setFormDonationLink("")
    setFormEmail("")
    setFormPhone("")
    setFormServices("")
    setFormLogo("")
    setFormStatus("active")
    setShowDialog(true)
  }

  function openEdit(p: Provider) {
    setEditProvider(p)
    setFormName(p.name)
    setFormDesc(p.description || "")
    setFormWebsite(p.website || "")
    setFormDonationLink(p.donation_link || "")
    setFormEmail(p.contact_email || "")
    setFormPhone(p.contact_phone || "")
    setFormServices((p.services || []).join(", "))
    setFormLogo(p.logo_url || "")
    setFormStatus(p.status)
    setShowDialog(true)
  }

  async function saveProvider() {
    if (!formName.trim()) return
    setSaving(true)
    try {
      const body = {
        name: formName.trim(),
        description: formDesc.trim() || null,
        website: formWebsite.trim() || null,
        donation_link: formDonationLink.trim() || null,
        contact_email: formEmail.trim() || null,
        contact_phone: formPhone.trim() || null,
        services: formServices.split(",").map((s) => s.trim()).filter(Boolean),
        logo_url: formLogo.trim() || null,
        status: formStatus,
      }

      if (editProvider) {
        const res = await fetch(`/api/service-providers/${editProvider.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(await res.text())
        toast.success("Prestador actualizado")
      } else {
        const res = await fetch("/api/service-providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(await res.text())
        toast.success("Prestador creado")
      }
      setShowDialog(false)
      loadAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"))
    } finally {
      setSaving(false)
    }
  }

  async function deleteProvider(id: string) {
    if (!confirm("¿Eliminar este prestador?")) return
    try {
      const res = await fetch(`/api/service-providers/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Prestador eliminado")
      loadAll()
    } catch {
      toast.error(tc("error"))
    }
  }

  if (!authChecked) return <SkeletonDetail />
  if (!isAdmin) return null

  const statusColors: Record<string, string> = {
    open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    matched: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    closed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  }

  function getDate(post: Post): string {
    const d = post.created_at || post.created
    if (!d) return ""
    return new Date(d as string).toLocaleDateString()
  }

  function renderPosts(posts: Post[], collection: string, statusActions?: Record<string, { label: string; status: string; variant?: "outline" | "destructive" }[]>) {
    return posts.length === 0 ? (
      <p className="text-muted-foreground">Sin registros</p>
    ) : (
      <div className="space-y-2">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{getDate(post)}</span>
                <Badge variant="outline" className={statusColors[post.status as string] || ""}>
                  {post.status as string}
                </Badge>
                {((post.name as string) || (post.title as string)) && (
                  <span className="text-xs font-medium">{(post.name || post.title) as string}</span>
                )}
                <span className="text-xs text-muted-foreground">ID: {(post.id as string).slice(0, 8)}...</span>
              </div>
              <div className="flex gap-1">
                {(statusActions?.[post.status as string] ?? []).map((action) => (
                  <Button
                    key={action.status}
                    size="sm"
                    variant={action.variant || "outline"}
                    onClick={() => updateStatus(collection, post.id as string, action.status)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const travelActions = {
    open: [
      { label: "Aprobar", status: "matched" },
      { label: "Rechazar", status: "cancelled", variant: "destructive" as const },
    ],
    matched: [
      { label: "Completar", status: "completed" },
    ],
  }

  const companyActions = {
    pending: [
      { label: "Aprobar", status: "active" },
      { label: "Rechazar", status: "inactive", variant: "destructive" as const },
    ],
    active: [
      { label: "Desactivar", status: "inactive", variant: "destructive" as const },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-8">
        {[
          { label: "Viajes", count: travelReqs.length, icon: Users },
          { label: "Transporte", count: transportOffers.length, icon: Building2 },
          { label: "Hospedaje", count: housingOffers.length, icon: Building2 },
          { label: "Empresas", count: companies.length, icon: Building2 },
          { label: "Insumos", count: supplies.length, icon: Package },
          { label: "Empleos", count: jobs.length, icon: Briefcase },
          { label: "Prestadores", count: providers.length, icon: HandHeart },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted rounded-lg p-3 text-center">
            <stat.icon className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="travel">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="travel">Viajes ({travelReqs.length})</TabsTrigger>
          <TabsTrigger value="transport">Transporte ({transportOffers.length})</TabsTrigger>
          <TabsTrigger value="housing">Hospedaje ({housingOffers.length})</TabsTrigger>
          <TabsTrigger value="companies">Empresas ({companies.length})</TabsTrigger>
          <TabsTrigger value="supplies">Insumos ({supplies.length})</TabsTrigger>
          <TabsTrigger value="jobs">Empleos ({jobs.length})</TabsTrigger>
          <TabsTrigger value="providers">Prestadores ({providers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="travel">{renderPosts(travelReqs, TABLES.TRAVEL_REQUESTS, travelActions)}</TabsContent>
        <TabsContent value="transport">{renderPosts(transportOffers, TABLES.TRANSPORT_OFFERS, travelActions)}</TabsContent>
        <TabsContent value="housing">{renderPosts(housingOffers, TABLES.HOUSING_OFFERS, travelActions)}</TabsContent>
        <TabsContent value="companies">{renderPosts(companies, TABLES.COMPANIES, companyActions)}</TabsContent>
        <TabsContent value="supplies">{renderPosts(supplies, TABLES.SUPPLIES)}</TabsContent>
        <TabsContent value="jobs">{renderPosts(jobs, TABLES.JOBS)}</TabsContent>

        <TabsContent value="providers">
          <div className="mb-4">
            <Button onClick={openCreate} size="sm" className="rounded-full">+ Nuevo Prestador</Button>
          </div>
          {providers.length === 0 ? (
            <p className="text-muted-foreground">Sin registros</p>
          ) : (
            <div className="space-y-2">
              {providers.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                      <Badge variant="outline" className={statusColors[p.status] || ""}>{p.status}</Badge>
                      <span className="text-xs font-medium">{p.name}</span>
                      {p.services && p.services.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.services.map((s) => (
                            <span key={s} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">ID: {p.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                        {tc("edit")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProvider(p.id)}>
                        {tc("delete")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProvider ? "Editar Prestador" : "Nuevo Prestador"}</DialogTitle>
            <DialogDescription>
              {editProvider ? "Actualiza los datos del prestador de servicios." : "Agrega un nuevo prestador de servicios."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Nombre</Label>
              <Input id="p-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nombre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Descripción</Label>
              <Textarea id="p-desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Descripción" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-web">Sitio web</Label>
                <Input id="p-web" value={formWebsite} onChange={(e) => setFormWebsite(e.target.value)} placeholder="https://" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-don">Link de donación</Label>
                <Input id="p-don" value={formDonationLink} onChange={(e) => setFormDonationLink(e.target.value)} placeholder="https://" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p-email">Email</Label>
                <Input id="p-email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-phone">Teléfono</Label>
                <Input id="p-phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+58..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-serv">Servicios (separados por coma)</Label>
              <Input id="p-serv" value={formServices} onChange={(e) => setFormServices(e.target.value)} placeholder="vivienda, salud, educacion" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-logo">URL del logo</Label>
              <Input id="p-logo" value={formLogo} onChange={(e) => setFormLogo(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-status">Estado</Label>
              <select
                id="p-status"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>{tc("cancel")}</Button>
              <Button onClick={saveProvider} disabled={saving} aria-busy={saving}>
                {saving ? "Guardando..." : tc("save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
