"use client"

import { useTranslations } from "next-intl"
import { Heart, HandHeart, Globe2 } from "lucide-react"

export function VisionHero() {
  const t = useTranslations("about")

  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-accent/10 px-6 py-12 ring-1 ring-primary/10 sm:px-12 sm:py-16 mb-20">
      <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative grid grid-cols-1 items-center gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("ourMission")}</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{t("missionText")}</p>
        </div>

        <div className="relative flex items-center justify-center gap-4 py-4">
          <div className="flex h-28 w-28 -rotate-6 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl">
            <Heart className="h-11 w-11" />
          </div>
          <div className="-ml-6 mt-10 flex h-36 w-36 rotate-3 items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-xl">
            <HandHeart className="h-14 w-14" />
          </div>
          <div className="-ml-6 -mt-12 hidden h-24 w-24 -rotate-3 items-center justify-center rounded-3xl bg-chart-6 text-white shadow-xl sm:flex">
            <Globe2 className="h-9 w-9" />
          </div>
        </div>
      </div>
    </section>
  )
}
