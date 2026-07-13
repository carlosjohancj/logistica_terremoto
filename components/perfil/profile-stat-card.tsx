"use client"

import type { LucideIcon } from "lucide-react"
import { useCountUp } from "@/hooks/use-count-up"

type ProfileStatCardProps = {
  icon: LucideIcon
  label: string
  value: string
  desc?: string
}

export function ProfileStatCard({ icon: Icon, label, value, desc }: ProfileStatCardProps) {
  const isNumeric = Number.isFinite(Number(value))
  const animatedValue = useCountUp(value)

  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight text-foreground">
          {isNumeric ? animatedValue : value}
        </p>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      </div>
    </div>
  )
}
