"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { toast } from "sonner"

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
    const pb = getPB()
    if (!pb.authStore.model) {
      router.push("/auth/login")
      return
    }

    async function loadMatches() {
      setLoading(true)
      try {
        const pb = getPB()
        const res = await pb.collection(COLLECTIONS.MATCHES).getList(1, 50, {
          sort: "-created",
        })
        setMatches(res.items as unknown as Match[])
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    loadMatches()
  }, [])

  const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    pending: "outline",
    confirmed: "default",
    in_progress: "secondary",
    completed: "default",
    cancelled: "destructive",
  }

  if (loading) return <div className="container mx-auto px-4 py-12 text-center">{tc("loading")}</div>

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
