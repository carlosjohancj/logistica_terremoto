import { CommunityStat } from "@/lib/community-stats"
import { cn } from "@/lib/utils"

interface StatsBarProps {
  stats: CommunityStat[]
  className?: string
}

export function StatsBar({ stats, className }: StatsBarProps) {
  return (
    <div className="container mx-auto px-4">
      <div
        className={cn(
          "-mt-14 grid grid-cols-2 gap-4 rounded-2xl bg-card p-6 shadow-lg ring-1 ring-foreground/10 sm:grid-cols-4 sm:gap-6",
          className
        )}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <stat.icon className="size-5" />
            </span>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
