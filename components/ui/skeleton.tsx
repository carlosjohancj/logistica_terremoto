import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="h-5 w-14 bg-muted rounded-full shrink-0" />
      </div>
      <div className="flex gap-2">
        <div className="h-3 bg-muted rounded w-20" />
        <div className="h-3 bg-muted rounded w-16" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ cols = 3, count = 6 }: { cols?: number; count?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(cols, 4)} lg:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-5 w-20 bg-muted rounded" />
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="h-7 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
        <div className="flex gap-3">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-20" />
          <div className="h-10 bg-muted rounded w-40" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="h-20 w-20 rounded-full bg-muted" />
        <div className="space-y-3 flex-1">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-32" />
          <div className="flex gap-4">
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
      <div className="h-px bg-border" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
      <SkeletonGrid cols={1} count={3} />
    </div>
  )
}
