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
  travel_request?: string
  transport_offer?: string
  housing_offer?: string
  status: string
  notes?: string
  expand?: Record<string, unknown>
  created: string
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
        const { data } = await supabase.from(TABLES.MATCHES).select("*").order("created_at", { ascending: false })
        setMatches((data || []) as unknown as Match[])
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
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(match.created).toLocaleDateString()}
                  </p>
                  {match.notes && (
                    <p className="text-sm mt-1">{match.notes}</p>
                  )}
                </div>
                <Badge variant={statusVariant[match.status] ?? "outline"}>
                  {match.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
