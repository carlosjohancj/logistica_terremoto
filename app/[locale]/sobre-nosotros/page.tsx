import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Heart, Users, Target, Globe } from "lucide-react"

export default function SobreNosotrosPage() {
  return <SobreNosotrosContent />
}

function SobreNosotrosContent() {
  const t = useTranslations("about")

  const values = [
    { icon: Heart, title: t("solidarity"), desc: t("solidarityDesc") },
    { icon: Users, title: t("community"), desc: t("communityDesc") },
    { icon: Target, title: t("mission"), desc: t("missionDesc") },
    { icon: Globe, title: t("reach"), desc: t("reachDesc") },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </section>

      {/* Mission */}
      <section className="mb-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">{t("ourMission")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {t("missionText")}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">{t("ourValues")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((v) => (
            <Card key={v.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{v.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{v.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center bg-secondary rounded-xl py-12 px-6">
        <h2 className="text-2xl font-bold mb-4">{t("joinUs")}</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          {t("joinUsDesc")}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/solicitar-viaje">
            <Button size="lg">{t("requestTrip")}</Button>
          </Link>
          <Link href="/ofrecer-transporte">
            <Button size="lg" variant="outline">{t("offerTransport")}</Button>
          </Link>
          <Link href="/ofrecer-hospedaje">
            <Button size="lg" variant="outline">{t("offerHousing")}</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
