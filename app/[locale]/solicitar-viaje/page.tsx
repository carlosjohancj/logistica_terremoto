import { useTranslations } from "next-intl"
import { Send } from "lucide-react"
import { TravelRequestForm } from "@/components/forms/travel-request/form"
import { PageHero } from "@/components/shared/page-hero"
import { CommunityStatsBar } from "@/components/shared/community-stats-bar"

export default function SolicitarViajePage() {
  return <SolicitarViajeContent />
}

function SolicitarViajeContent() {
  const t = useTranslations("travelRequest")

  return (
    <div className="flex flex-col">
      <PageHero
        title={t("title")}
        description={t("description")}
        cta={{ label: t("heroCta"), href: "#form", icon: Send }}
        className="bg-chart-3 text-white"
      />
      <CommunityStatsBar />
      <div id="form" className="container mx-auto px-4 py-16 max-w-3xl scroll-mt-20">
        <TravelRequestForm />
      </div>
    </div>
  )
}
