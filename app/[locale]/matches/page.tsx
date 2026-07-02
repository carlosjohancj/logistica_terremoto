"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { ArrowRight } from "lucide-react"

type Match = {
  id: string
  travel_request_id: string
  user_id: string
  status: string
  notes?: string
  created_at: string
  travel_requests?: {
    origin_city: string
    origin_state: string
    destination_city: string
    people_to_move: number
  }
}

export default function MatchesPage() {
  const tc = useTranslations("common")
  const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      setLoading(true)
      try {
        const { data } = await (supabase
          .from(TABLES.MATCHES)
          .select("*, travel_requests:travel_request_id(*)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }) as never as { data: Match[] | null })
        setMatches(data ?? [])
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    pending: "outline",
    confirmed: "default",
    in_progress: "secondary",
    completed: "default",
    cancelled: "destructive",
  }

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    in_progress: "En progreso",
    completed: "Completado",
    cancelled: "Cancelado",
  }

  if (loading) return <SkeletonGrid cols={1} count={5} />

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Mis Conexiones</h1>

      {matches.length === 0 && (
        <p className="text-muted-foreground">No tienes conexiones aún.</p>
      )}

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
                  {match.notes && (
                    <p className="text-sm mt-1">{match.notes}</p>
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
    </div>
  )
}
