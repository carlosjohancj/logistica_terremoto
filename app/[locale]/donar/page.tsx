"use client"

import { useTranslations } from "next-intl"
import { Heart } from "lucide-react"
import { SupportPlatformCard } from "@/components/donate/support-platform-card"
import { ProvidersSection } from "@/components/donate/providers-section"
import { FamilyAidSection } from "@/components/donate/family-aid-section"

export default function DonarPage() {
  const t = useTranslations("donate")

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <Heart className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t("desc")}</p>
      </div>

      <SupportPlatformCard />
      <ProvidersSection />
      <FamilyAidSection />
    </div>
  )
}
