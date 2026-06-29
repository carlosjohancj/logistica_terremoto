import { useTranslations } from "next-intl"
import { TravelRequestForm } from "@/components/forms/travel-request-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SolicitarViajePage() {
  return <SolicitarViajeContent />
}

function SolicitarViajeContent() {
  const t = useTranslations("travelRequest")

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            Completa el formulario para publicar tu solicitud de viaje. Un
            transportista te contactará si tiene disponibilidad en tu ruta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TravelRequestForm />
        </CardContent>
      </Card>
    </div>
  )
}
