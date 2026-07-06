import { useTranslations } from "next-intl"
import { Gift } from "lucide-react"
import { SupplyForm } from "@/components/forms/supply/form"
import { PageHero } from "@/components/shared/page-hero"
import { CommunityStatsBar } from "@/components/shared/community-stats-bar"

export default function OfrecerInsumosPage() {
  return <OfrecerInsumosContent />
}

function OfrecerInsumosContent() {
  const t = useTranslations("supplies")

  return (
    <div className="flex flex-col">
      <PageHero
        title={t("title")}
        description={t("subtitle")}
        cta={{ label: t("heroCta"), href: "#form", icon: Gift }}
        className="bg-chart-2 text-white"
      />
      <CommunityStatsBar />
      <div id="form" className="container mx-auto px-4 py-16 max-w-3xl scroll-mt-20">
        <SupplyForm />
      </div>
    </div>
  )
}
