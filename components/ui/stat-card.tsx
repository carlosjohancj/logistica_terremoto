"use client"

import { useEffect, useState } from "react"

type StatCardProps = {
  label: string
  value: string
  desc?: string
  showPlus?: boolean
}

function useCountUp(target: string, duration = 1200) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const num = Number(target)
    if (!Number.isFinite(num)) return

    let raf = 0
    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * num))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
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
