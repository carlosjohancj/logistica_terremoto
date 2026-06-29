"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { SkeletonDetail } from "@/components/ui/skeleton"

type DonationSetting = {
  id: string
  method: string
  label: string
  details: Record<string, string>
}

export default function DonarPage() {
  const t = useTranslations("donate")
  const [settings, setSettings] = useState<DonationSetting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const pb = getPB()
        const res = await pb.collection(COLLECTIONS.DONATION_SETTINGS).getFullList<DonationSetting>({ sort: "sort_order" })
        setSettings(res)
      } catch {
        setSettings([])
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const targets = [
    { key: "generalFund", desc: t("generalFundDesc") },
    { key: "gasolina", desc: t("gasolinaDesc") },
    { key: "hospedaje", desc: t("hospedajeDesc") },
    { key: "familia", desc: t("familiaDesc") },
  ]

  if (loading) return <SkeletonDetail />

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t("desc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {targets.map((target) => (
          <Card key={target.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t(target.key)}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{target.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {settings.map((s) => (
          <Card key={s.id}>
            <CardHeader>
              <CardTitle className="text-lg">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              {Object.entries(s.details).map(([key, val]) => (
                <p key={key}><strong>{key}:</strong> {val}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-muted-foreground mb-4">{t("contactUs")}</p>
        <Link href="mailto:donaciones@desdecero.org">
          <Button>donaciones@desdecero.org</Button>
        </Link>
      </div>
    </div>
  )
}
