import { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeroProps {
  eyebrow?: ReactNode
  title: string
  description?: string
  cta?: { label: string; href: string; icon?: LucideIcon }
  className?: string
  ctaClassName?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  cta,
  className,
  ctaClassName,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-primary pt-20 pb-28 text-primary-foreground",
        className
      )}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-white/5 blur-2xl" />
      <div className="container relative mx-auto flex flex-col items-center px-4 text-center">
        {eyebrow && (
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            {eyebrow}
          </span>
        )}
        <h1 className="max-w-2xl text-3xl font-bold sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-xl opacity-80">{description}</p>
        )}
        {cta && (
          <a
            href={cta.href}
            className={cn(
              "mt-8 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold tracking-wide uppercase backdrop-blur-sm transition-colors hover:bg-white/20",
              ctaClassName
            )}
          >
            {cta.icon && <cta.icon className="size-4" />}
            {cta.label}
          </a>
        )}
      </div>
    </section>
  )
}
