import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface OptionCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  selected: boolean
  onClick: () => void
  className?: string
}

export function OptionCard({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
  className,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors",
        Icon ? "flex-col p-4 text-center" : "h-10 px-4",
        selected
          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
          : "border-input hover:bg-muted/50",
        className
      )}
    >
      {Icon && (
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            selected ? "bg-primary/15" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-5" />
        </span>
      )}
      <span>{title}</span>
      {description && (
        <span className="text-xs font-normal text-muted-foreground">
          {description}
        </span>
      )}
    </button>
  )
}
