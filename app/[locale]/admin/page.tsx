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
import { Shield } from "lucide-react"

type Post = {
  id: string
  user?: string
  status: string
  created: string
  expand?: Record<string, unknown>
}

export default function AdminPage() {
  const tc = useTranslations("common")
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [travelReqs, setTravelReqs] = useState<Post[]>([])
  const [transportOffers, setTransportOffers] = useState<Post[]>([])
  const [housingOffers, setHousingOffers] = useState<Post[]>([])

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
      const [travel, transport, housing] = await Promise.all([
        supabase.from(TABLES.TRAVEL_REQUESTS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.TRANSPORT_OFFERS).select("*").order("created_at", { ascending: false }),
        supabase.from(TABLES.HOUSING_OFFERS).select("*").order("created_at", { ascending: false }),
      ])
      setTravelReqs((travel.data || []) as unknown as Post[])
      setTransportOffers((transport.data || []) as unknown as Post[])
      setHousingOffers((housing.data || []) as unknown as Post[])
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
  }

  function renderPosts(posts: Post[], collection: string) {
    return posts.length === 0 ? (
      <p className="text-muted-foreground">Sin publicaciones</p>
    ) : (
      <div className="space-y-2">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(post.created).toLocaleDateString()}
                </span>
                <Badge variant="outline" className={statusColors[post.status] || ""}>
                  {post.status}
                </Badge>
                <span className="text-xs text-muted-foreground">ID: {post.id.slice(0, 8)}...</span>
              </div>
              <div className="flex gap-1">
                {post.status === "open" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(collection, post.id, "matched")}>
                      Aprobar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateStatus(collection, post.id, "cancelled")}>
                      Rechazar
                    </Button>
                  </>
                )}
                {post.status === "matched" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(collection, post.id, "completed")}>
                    Completar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <Tabs defaultValue="travel">
        <TabsList className="mb-4">
          <TabsTrigger value="travel">Viajes ({travelReqs.length})</TabsTrigger>
          <TabsTrigger value="transport">Transporte ({transportOffers.length})</TabsTrigger>
          <TabsTrigger value="housing">Hospedaje ({housingOffers.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="travel">{renderPosts(travelReqs, TABLES.TRAVEL_REQUESTS)}</TabsContent>
        <TabsContent value="transport">{renderPosts(transportOffers, TABLES.TRANSPORT_OFFERS)}</TabsContent>
        <TabsContent value="housing">{renderPosts(housingOffers, TABLES.HOUSING_OFFERS)}</TabsContent>
      </Tabs>
    </div>
  )
}
