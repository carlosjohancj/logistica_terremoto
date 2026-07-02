"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DonarPage() {
  const t = useTranslations("donate")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-10">
        <Heart className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground">
          Tu apoyo nos ayuda a mantener esta plataforma activa y seguir conectando a quienes más lo necesitan.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-8 text-center">
          <p className="text-lg font-medium mb-4">
            Colabora con el mantenimiento de la plataforma
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Todas las donaciones se destinan exclusivamente a costos de infraestructura, servidores y desarrollo.
          </p>
          <Link href="https://paypal.me/desdecero" target="_blank">
            <Button size="lg" className="rounded-full px-10">
              Donar vía PayPal
            </Button>
          </Link>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>¿Prefieres otro método?</p>
        <p>Contáctanos: donaciones@desdecero.org</p>
      </div>
    </div>
  )
}
