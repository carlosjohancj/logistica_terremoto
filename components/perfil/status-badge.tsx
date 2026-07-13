import { cn } from "@/lib/utils"

type StatusMeta = { label: string; dot: string; badge: string }

const STATUS_META: Record<string, StatusMeta> = {
  open: { label: "Abierto", dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  pending: { label: "Pendiente", dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmado", dot: "bg-blue-500", badge: "border-blue-200 bg-blue-50 text-blue-700" },
  matched: { label: "Emparejado", dot: "bg-blue-500", badge: "border-blue-200 bg-blue-50 text-blue-700" },
  in_progress: { label: "En progreso", dot: "bg-sky-500", badge: "border-sky-200 bg-sky-50 text-sky-700" },
  fulfilled: { label: "Completado", dot: "bg-sky-500", badge: "border-sky-200 bg-sky-50 text-sky-700" },
  completed: { label: "Completado", dot: "bg-sky-500", badge: "border-sky-200 bg-sky-50 text-sky-700" },
  occupied: { label: "Ocupado", dot: "bg-amber-500", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  closed: { label: "Cerrado", dot: "bg-gray-400", badge: "border-gray-200 bg-gray-50 text-gray-600" },
  cancelled: { label: "Cancelado", dot: "bg-gray-400", badge: "border-gray-200 bg-gray-50 text-gray-600" },
}

const FALLBACK_META: StatusMeta = { label: "", dot: "bg-gray-400", badge: "border-gray-200 bg-gray-50 text-gray-600" }

export function getStatusMeta(status?: string): StatusMeta {
  if (!status) return FALLBACK_META
  return STATUS_META[status] ?? { ...FALLBACK_META, label: status.charAt(0).toUpperCase() + status.slice(1) }
}

export function StatusBadge({ status, className }: { status?: string; className?: string }) {
  if (!status) return null
  const meta = getStatusMeta(status)

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        meta.badge,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}
