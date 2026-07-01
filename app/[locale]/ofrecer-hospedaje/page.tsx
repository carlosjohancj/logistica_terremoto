import { useTranslations } from "next-intl"
import { Home } from "lucide-react"
import { HousingOfferForm } from "@/components/forms/housing-offer/form"
import { PageHero } from "@/components/shared/page-hero"
import { CommunityStatsBar } from "@/components/shared/community-stats-bar"

export default function OfrecerHospedajePage() {
  return <OfrecerHospedajeContent />
}

function OfrecerHospedajeContent() {
  const t = useTranslations("housingOffer")

  return (
    <div className="flex flex-col">
      <PageHero
        title={t("title")}
        description={t("description")}
        cta={{ label: t("heroCta"), href: "#form", icon: Home }}
        className="bg-chart-6 text-white"
      />
      <CommunityStatsBar />
      <div id="form" className="container mx-auto px-4 py-16 max-w-3xl scroll-mt-20">
        <HousingOfferForm />
      </div>
    </div>
  )
}
