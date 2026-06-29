import { useTranslations } from "next-intl"
import { TransportOfferForm } from "@/components/forms/transport-offer-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function OfrecerTransportePage() {
  return <OfrecerTransporteContent />
}

function OfrecerTransporteContent() {
  const t = useTranslations("transportOffer")

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            Publica tu oferta de transporte para ayudar a damnificados a
            movilizarse dentro de Venezuela.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransportOfferForm />
        </CardContent>
      </Card>
    </div>
  )
}
