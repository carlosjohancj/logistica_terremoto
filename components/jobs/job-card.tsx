"use client"

import { Building2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export type Job = {
  id: string
  title: string
  company?: { name: string } | null
  location_state: string
  location_city: string
  modality: string
  salary_range: string
  created_at: string
}

const MODALITY_PALETTE: Record<string, {
  border: string
  surface: string
  badge: string
  glow: string
}> = {
  presencial: {
    border: "border-sky-200 dark:border-sky-900/60",
    surface: "bg-linear-to-br from-sky-50/90 to-card dark:from-sky-950/25 dark:to-card",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    glow: "hover:shadow-sky-200/70 dark:hover:shadow-sky-950/50",
  },
  hibrido: {
    border: "border-emerald-200 dark:border-emerald-900/60",
    surface: "bg-linear-to-br from-emerald-50/90 to-card dark:from-emerald-950/25 dark:to-card",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    glow: "hover:shadow-emerald-200/70 dark:hover:shadow-emerald-950/50",
  },
  remoto: {
    border: "border-violet-200 dark:border-violet-900/60",
    surface: "bg-linear-to-br from-violet-50/90 to-card dark:from-violet-950/25 dark:to-card",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    glow: "hover:shadow-violet-200/70 dark:hover:shadow-violet-950/50",
  },
}

const DEFAULT_PALETTE = MODALITY_PALETTE.presencial

function timeAgo(dateStr?: string) {
  if (!dateStr) return null
  const diffMs = Date.now() - new Date(dateStr).getTime()
  if (Number.isNaN(diffMs)) return null
  const days = Math.floor(diffMs / 86_400_000)
  if (days <= 0) return "Publicado hoy"
  if (days === 1) return "Publicado ayer"
  if (days < 30) return `Publicado hace ${days} días`
  const months = Math.floor(days / 30)
  return `Publicado hace ${months} ${months === 1 ? "mes" : "meses"}`
}

export function JobCard({ job, index, onSelect }: { job: Job; index: number; onSelect: (id: string) => void }) {
  const palette = MODALITY_PALETTE[job.modality] ?? DEFAULT_PALETTE
  const companyName = job.company?.name || "Empresa"
  const rotate = index % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1"
  const posted = timeAgo(job.created_at)

  return (
    <button type="button" onClick={() => onSelect(job.id)} className="block h-full text-left w-full">
      <div
        className={cn(
          "group relative flex h-full flex-col gap-3 rounded-2xl border-2 p-5 shadow-sm transition-all duration-300 cursor-pointer",
          "hover:-translate-y-1.5 hover:shadow-xl hover:z-10",
          palette.border,
          palette.surface,
          palette.glow,
          rotate
        )}
      >
        <div className="flex items-start justify-end gap-2">
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              palette.badge
            )}
          >
            {job.modality}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-lg leading-snug text-foreground">{job.title}</h3>
          {job.salary_range && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">{job.salary_range}</p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {companyName}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {job.location_city}, {job.location_state}
          </span>
        </div>

        {posted && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            {posted}
          </p>
        )}
      </div>
    </button>
  )
}
