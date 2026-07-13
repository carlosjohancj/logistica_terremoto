"use client"

import { useCountUp } from "@/hooks/use-count-up"

type StatCardProps = {
  label: string
  value: string
  desc?: string
  showPlus?: boolean
}

export function StatCard({ label, value, desc, showPlus = true }: StatCardProps) {
  const isNumeric = Number.isFinite(Number(value))
  const animatedValue = useCountUp(value)

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between min-h-70">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div>
        <p className="text-4xl font-extrabold text-foreground">
          {isNumeric ? animatedValue : value}
          {showPlus && isNumeric && <span className="text-primary">+</span>}
        </p>
        {desc && (
          <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        )}
      </div>
    </div>
  )
}
