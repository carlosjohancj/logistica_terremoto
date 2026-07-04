import { ArrowUpRight } from "lucide-react"

type StepCardProps = {
  icon: string
  tag?: string
  title: string
  description: string
}

export function StepCard({ icon, tag, title, description }: StepCardProps) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-xl">
          {icon}
        </div>
        {tag && (
          <span className="text-xs font-bold text-muted-foreground/60">{tag}</span>
        )}
      </div>
      <h3 className="font-bold text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <div className="flex justify-end">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  )
}
