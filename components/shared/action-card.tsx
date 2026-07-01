import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ActionCardProps {
  title: string
  description?: string
  href?: string
  className?: string
}

export function ActionCard({ title, description, href, className }: ActionCardProps) {
  const card = (
    <Card className={cn("min-h-32 justify-center", href && "transition-colors hover:border-primary/40", className)}>
      <CardHeader className="gap-1.5">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {href && (
          <CardAction>
            <span className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
              <ArrowUpRight className="size-4" />
            </span>
          </CardAction>
        )}
      </CardHeader>
    </Card>
  )

  if (!href) return card

  return (
    <Link href={href} className="group block">
      {card}
    </Link>
  )
}
