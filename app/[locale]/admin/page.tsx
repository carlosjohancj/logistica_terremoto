"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { SkeletonDetail } from "@/components/ui/skeleton"
import { Shield, Users, Building2, Briefcase, Package } from "lucide-react"

type Post = {
  id: string
  status: string
  created_at?: string
  created?: string
  [key: string]: unknown
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
      const [travel, transport, housing, comps, supps, jbs] = await Promise.all([
        supabase.from(TABLES.TRAVEL_REQUESTS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.TRANSPORT_OFFERS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.HOUSING_OFFERS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.COMPANIES).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.SUPPLIES).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.JOBS).select("*").order("created_at", { ascending: false }),
      ])
      setTravelReqs((travel.data || []) as Post[])
      setTransportOffers((transport.data || []) as Post[])
      setHousingOffers((housing.data || []) as Post[])
      setCompanies((comps.data || []) as Post[])
      setSupplies((supps.data || []) as Post[])
      setJobs((jbs.data || []) as Post[])
    } catch {
      toast.error(tc("error"))
    }
  }

  async function updateStatus(collection: string, id: string, status: string) {
    try {
      const supabase = getSupabase()
      await supabase.from(collection).update({ status }).eq("id", id)
      toast.success(`Estado actualizado a: ${status}`)
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

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Viajes", count: travelReqs.length, icon: Users },
          { label: "Transporte", count: transportOffers.length, icon: Building2 },
          { label: "Hospedaje", count: housingOffers.length, icon: Building2 },
          { label: "Empresas", count: companies.length, icon: Building2 },
          { label: "Insumos", count: supplies.length, icon: Package },
          { label: "Empleos", count: jobs.length, icon: Briefcase },
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
        </TabsList>
        <TabsContent value="travel">{renderPosts(travelReqs, TABLES.TRAVEL_REQUESTS, travelActions)}</TabsContent>
        <TabsContent value="transport">{renderPosts(transportOffers, TABLES.TRANSPORT_OFFERS, travelActions)}</TabsContent>
        <TabsContent value="housing">{renderPosts(housingOffers, TABLES.HOUSING_OFFERS, travelActions)}</TabsContent>
        <TabsContent value="companies">{renderPosts(companies, TABLES.COMPANIES, companyActions)}</TabsContent>
        <TabsContent value="supplies">{renderPosts(supplies, TABLES.SUPPLIES)}</TabsContent>
        <TabsContent value="jobs">{renderPosts(jobs, TABLES.JOBS)}</TabsContent>
      </Tabs>
    </div>
  )
}
