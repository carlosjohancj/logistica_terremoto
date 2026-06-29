import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DonarPage() {
  return <DonarContent />
}

function DonarContent() {
  const t = useTranslations("donate")

  const targets = [
    { key: "generalFund", desc: "Ayuda a cubrir gastos operativos de la plataforma." },
    { key: "gasolina", desc: "Destinado a transportistas que llevan damnificados." },
    { key: "hospedaje", desc: "Apoya a anfitriones que alojan familias." },
    { key: "familia", desc: "Ayuda directa a una familia damnificada específica." },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t("desc")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {targets.map((target) => (
          <Card key={target.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t(target.key)}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{target.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("bankInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p><strong>Banco:</strong> Banco de Venezuela</p>
            <p><strong>Cuenta:</strong> 0102-XXXX-XXXX-XXXX</p>
            <p><strong>Titular:</strong> Fundación Desde Cero</p>
            <p><strong>RIF:</strong> J-XXXXXXXX-X</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("paypalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>donaciones@desdecero.org</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("zelleInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>donaciones@desdecero.org</p>
            <p>Fundación Desde Cero</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground mb-4">{t("contactUs")}</p>
        <Link href="mailto:donaciones@desdecero.org">
          <Button>donaciones@desdecero.org</Button>
        </Link>
      </div>
    </div>
  )
}
