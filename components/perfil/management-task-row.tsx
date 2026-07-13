import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type ManagementTaskRowProps = {
  icon: LucideIcon
  title: string
  desc: string
  action: ReactNode
}

export function ManagementTaskRow({ icon: Icon, title, desc, action }: ManagementTaskRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      {action}
    </div>
  )
}
