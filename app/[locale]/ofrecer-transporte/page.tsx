import { useTranslations } from "next-intl"
import { Truck } from "lucide-react"
import { TransportOfferForm } from "@/components/forms/transport-offer/form"
import { PageHero } from "@/components/shared/page-hero"
import { CommunityStatsBar } from "@/components/shared/community-stats-bar"

export default function OfrecerTransportePage() {
  return <OfrecerTransporteContent />
}

function OfrecerTransporteContent() {
  const t = useTranslations("transportOffer")

  return (
    <div className="flex flex-col">
      <PageHero
        title={t("title")}
        description={t("description")}
        cta={{ label: t("heroCta"), href: "#form", icon: Truck }}
        className="bg-chart-5 text-white"
      />
      <CommunityStatsBar />
      <div id="form" className="container mx-auto px-4 py-16 max-w-3xl scroll-mt-20">
        <TransportOfferForm />
      </div>
    </div>
  )
}
