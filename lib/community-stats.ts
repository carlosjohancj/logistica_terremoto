"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Heart, Truck, Home as HomeIcon, Route, type LucideIcon } from "lucide-react"
import { getSupabase, TABLES } from "@/lib/supabase"

export type CommunityStat = {
  icon: LucideIcon
  value: string
  label: string
}

export function useCommunityStats(): { stats: CommunityStat[]; loading: boolean } {
  const th = useTranslations("home")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CommunityStat[]>([
    { icon: Heart, value: "-", label: th("statsDonaciones") },
    { icon: Truck, value: "-", label: th("statsTransportistas") },
    { icon: HomeIcon, value: "-", label: th("statsAnfitriones") },
    { icon: Route, value: "-", label: th("statsViajes") },
  ])

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = getSupabase()
        const [donations, transport, housing, travel] = await Promise.all([
          supabase.from(TABLES.DONATIONS).select("*", { count: "exact", head: true }),
          supabase
            .from(TABLES.TRANSPORT_OFFERS)
            .select("*", { count: "exact", head: true })
            .eq("status", "open"),
          supabase
            .from(TABLES.HOUSING_OFFERS)
            .select("*", { count: "exact", head: true })
            .eq("status", "open"),
          supabase
            .from(TABLES.TRAVEL_REQUESTS)
            .select("*", { count: "exact", head: true })
            .eq("status", "open"),
        ])
        setStats([
          { icon: Heart, value: String(donations.count ?? 0), label: th("statsDonaciones") },
          { icon: Truck, value: String(transport.count ?? 0), label: th("statsTransportistas") },
          { icon: HomeIcon, value: String(housing.count ?? 0), label: th("statsAnfitriones") },
          { icon: Route, value: String(travel.count ?? 0), label: th("statsViajes") },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { stats, loading }
}
