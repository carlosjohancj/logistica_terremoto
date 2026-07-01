"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart } from "lucide-react"
import { getSupabase, TABLES } from "@/lib/supabase"
import { SkeletonDetail } from "@/components/ui/skeleton"
import { ActionCard } from "@/components/shared/action-card"
import { PageHero } from "@/components/shared/page-hero"
import { CommunityStatsBar } from "@/components/shared/community-stats-bar"

type DonationSetting = {
  id: string
  method: string
  label: string
  details: Record<string, string>
}

export default function DonarPage() {
  const t = useTranslations("donate")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const [settings, setSettings] = useState<DonationSetting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const supabase = getSupabase()
        const res = await supabase.from(TABLES.DONATION_SETTINGS).select("*").order("sort_order")
        setSettings((res.data || []) as DonationSetting[])
      } catch {
        setSettings([])
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const targets = [
    { key: "generalFund", desc: t("generalFundDesc"), href: "mailto:donaciones@desdecero.org" },
    { key: "gasolina", desc: t("gasolinaDesc"), href: `/${locale}/ofrecer-transporte` },
    { key: "hospedaje", desc: t("hospedajeDesc"), href: `/${locale}/ofrecer-hospedaje` },
    { key: "familia", desc: t("familiaDesc"), href: `/${locale}/explorar` },
  ]

  if (loading) return <SkeletonDetail />

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={
          <>
            <Heart className="size-3.5" />
            {t("title")}
          </>
        }
        title={t("heroTitle")}
        description={t("desc")}
        cta={{ label: t("heroCta"), href: "#funds", icon: Heart }}
      />

      <CommunityStatsBar />

      {/* Funds */}
      <section id="funds" className="container mx-auto px-4 py-16 scroll-mt-20">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
          {t("fundsSectionTitle")}
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {targets.map((target) => (
            <ActionCard
              key={target.key}
              title={t(target.key)}
              description={target.desc}
              href={target.href}
            />
          ))}
        </div>
      </section>

      {/* Payment methods */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
            {t("paymentSectionTitle")}
          </h2>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
            {settings.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{s.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {Object.entries(s.details).map(([key, val]) => (
                    <p key={key}><strong>{key}:</strong> {val}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-secondary/50 px-4 pb-16">
        <div className="container mx-auto">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl bg-foreground px-6 py-10 text-center text-background">
            <p className="text-lg font-medium">{t("contactUs")}</p>
            <Link href="mailto:donaciones@desdecero.org">
              <Button
                size="lg"
                className="rounded-full bg-background px-8 text-foreground hover:bg-background/90"
              >
                donaciones@desdecero.org
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
