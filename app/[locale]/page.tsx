"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPB, COLLECTIONS } from "@/lib/pocketbase";

export default function HomePage() {
  const t = useTranslations("home");

  const [stats, setStats] = useState([
    { value: "-", label: t("statsViajes") },
    { value: "-", label: t("statsTransportistas") },
    { value: "-", label: t("statsAnfitriones") },
    { value: "-", label: t("statsDonaciones") },
  ]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const pb = getPB()
        const [travelCount, transportCount, housingCount, donations] = await Promise.all([
          pb.collection(COLLECTIONS.TRAVEL_REQUESTS).getList(1, 1, { filter: 'status = "open"' }),
          pb.collection(COLLECTIONS.TRANSPORT_OFFERS).getList(1, 1, { filter: 'status = "open"' }),
          pb.collection(COLLECTIONS.HOUSING_OFFERS).getList(1, 1, { filter: 'status = "open"' }),
          pb.collection(COLLECTIONS.DONATIONS).getList(1, 1),
        ])
        setStats([
          { value: String(travelCount.totalItems), label: t("statsViajes") },
          { value: String(transportCount.totalItems), label: t("statsTransportistas") },
          { value: String(housingCount.totalItems), label: t("statsAnfitriones") },
          { value: `${donations.totalItems}`, label: t("statsDonaciones") },
        ])
      } catch {
        setStats([
          { value: "0", label: t("statsViajes") },
          { value: "0", label: t("statsTransportistas") },
          { value: "0", label: t("statsAnfitriones") },
          { value: "0", label: t("statsDonaciones") },
        ])
      }
    }
    fetchStats()
  }, [])

  const steps = [
    { icon: "📝", title: t("paso1"), desc: t("paso1Desc") },
    { icon: "📢", title: t("paso2"), desc: t("paso2Desc") },
    { icon: "🤝", title: t("paso3"), desc: t("paso3Desc") },
  ];

  const ctaItems = [
    { href: "solicitar-viaje", label: t("ctaSolicitar"), desc: t("ctaSolicitarDesc"), variant: "default" as const },
    { href: "ofrecer-transporte", label: t("ctaTransporte"), desc: t("ctaTransporteDesc"), variant: "outline" as const },
    { href: "ofrecer-hospedaje", label: t("ctaHospedaje"), desc: t("ctaHospedajeDesc"), variant: "outline" as const },
    { href: "donar", label: t("ctaDonar"), desc: t("ctaDonarDesc"), variant: "secondary" as const },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-primary">{t("title")}</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <p className="text-base text-muted-foreground mb-10 max-w-xl mx-auto">
            {t("heroDesc")}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {ctaItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant={item.variant} size="lg" className="min-w-[180px]">
                  <div className="flex flex-col items-center py-1">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-[10px] opacity-70">{item.desc}</span>
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">{t("comoFunciona")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <Card key={step.title} className="text-center">
                <CardHeader>
                  <div className="text-4xl mb-2">{step.icon}</div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{step.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
