import { useTranslations } from "next-intl"
import { HousingOfferForm } from "@/components/forms/housing-offer/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function OfrecerHospedajePage() {
  return <OfrecerHospedajeContent />
}

function OfrecerHospedajeContent() {
  const t = useTranslations("housingOffer")

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            Ofrece un espacio temporal para damnificados que necesitan un lugar
            donde quedarse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HousingOfferForm />
        </CardContent>
      </Card>
    </div>
  )
}
