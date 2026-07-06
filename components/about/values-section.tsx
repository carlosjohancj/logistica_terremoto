"use client"

import { useTranslations } from "next-intl"
import { Heart, Users, Target, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const TONES = ["bg-primary/10 text-primary", "bg-accent/10 text-accent", "bg-chart-3/10 text-chart-3", "bg-chart-4/10 text-chart-4"]

export function ValuesSection() {
  const t = useTranslations("about")

  const values = [
    { icon: Heart, title: t("solidarity"), desc: t("solidarityDesc") },
    { icon: Users, title: t("community"), desc: t("communityDesc") },
    { icon: Target, title: t("mission"), desc: t("missionDesc") },
    { icon: Globe, title: t("reach"), desc: t("reachDesc") },
  ]

  return (
    <section className="mb-20">
      <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{t("ourValues")}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {values.map((v, index) => (
          <Card key={v.title} className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", TONES[index % TONES.length])}>
                  <v.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{v.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">{v.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
