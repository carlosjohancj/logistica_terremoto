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
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { toast } from "sonner"

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
    const pb = getPB()
    const role = (pb.authStore.model as Record<string, unknown> | null)?.role
    if (role !== "admin") {
      router.push("/auth/login")
      return
    }
    setIsAdmin(true)
    setAuthChecked(true)
    loadAll()
  }, [])

  async function loadAll() {
    const pb = getPB()
    try {
      const [travel, transport, housing] = await Promise.all([
        pb.collection(COLLECTIONS.TRAVEL_REQUESTS).getList(1, 100, { sort: "-created" }),
        pb.collection(COLLECTIONS.TRANSPORT_OFFERS).getList(1, 100, { sort: "-created" }),
        pb.collection(COLLECTIONS.HOUSING_OFFERS).getList(1, 100, { sort: "-created" }),
      ])
      setTravelReqs(travel.items as unknown as Post[])
      setTransportOffers(transport.items as unknown as Post[])
      setHousingOffers(housing.items as unknown as Post[])
    } catch {
      toast.error(tc("error"))
    }
  }

  async function updateStatus(collection: string, id: string, status: string) {
    try {
      const pb = getPB()
      await pb.collection(collection).update(id, { status })
      toast.success(`Estado actualizado a: ${status}`)
      loadAll()
    } catch {
      toast.error(tc("error"))
    }
  }

  if (!authChecked) return <div className="container mx-auto px-4 py-12 text-center">{tc("loading")}</div>
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
        <TabsContent value="travel">{renderPosts(travelReqs, COLLECTIONS.TRAVEL_REQUESTS)}</TabsContent>
        <TabsContent value="transport">{renderPosts(transportOffers, COLLECTIONS.TRANSPORT_OFFERS)}</TabsContent>
        <TabsContent value="housing">{renderPosts(housingOffers, COLLECTIONS.HOUSING_OFFERS)}</TabsContent>
      </Tabs>
    </div>
  )
}
