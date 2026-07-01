import { useTranslations } from "next-intl"
import { TravelRequestForm } from "@/components/forms/travel-request/form"

export default function SolicitarViajePage() {
  return <SolicitarViajeContent />
}

function SolicitarViajeContent() {
  const t = useTranslations("travelRequest")

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
      <TravelRequestForm />
    </div>
  )
}
