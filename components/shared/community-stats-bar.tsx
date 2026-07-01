"use client"

import { useCommunityStats } from "@/lib/community-stats"
import { StatsBar } from "@/components/shared/stats-bar"

export function CommunityStatsBar({ className }: { className?: string }) {
  const { stats } = useCommunityStats()
  return <StatsBar stats={stats} className={className} />
}
