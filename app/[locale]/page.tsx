"use client";

import { useState, useEffect } from "react";
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
import { getSupabase, TABLES } from "@/lib/supabase";
import { usePathname } from "next/navigation";

const LOGO_URL =
  "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/desde-cero.webp";

export default function HomePage() {
  const t = useTranslations("home");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "es";

  const [counts, setCounts] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = getSupabase();
        const [travelCount, transportCount, volCount, orgCount] =
          await Promise.all([
            supabase
              .from(TABLES.TRAVEL_REQUESTS)
              .select("*", { count: "exact", head: true })
              .eq("status", "open"),
            supabase
              .from(TABLES.TRANSPORT_OFFERS)
              .select("*", { count: "exact", head: true })
              .eq("status", "open"),
            supabase
              .from(TABLES.PROFILES)
              .select("*", { count: "exact", head: true })
              .eq("role", "voluntario"),
            supabase
              .from(TABLES.PROFILES)
              .select("*", { count: "exact", head: true })
              .eq("role", "organizacion"),
          ]);
        setCounts({
          viajes: String(travelCount.count),
          transportistas: String(transportCount.count),
          voluntarios: String(volCount.count),
          organizaciones: String(orgCount.count),
        });
      } catch {
        setCounts({ viajes: "0", transportistas: "0", voluntarios: "0", organizaciones: "0" });
      }
    }
    fetchStats();
  }, []);

  const steps = [
    { icon: "📝", title: t("paso1"), desc: t("paso1Desc") },
    { icon: "📢", title: t("paso2"), desc: t("paso2Desc") },
    { icon: "🤝", title: t("paso3"), desc: t("paso3Desc") },
  ];

  const stats = [
    { value: counts.viajes ?? "-", label: t("statsViajes") },
    { value: counts.transportistas ?? "-", label: t("statsTransportistas") },
    { value: counts.voluntarios ?? "-", label: t("statsVoluntarios") },
    { value: counts.organizaciones ?? "-", label: t("statsOrganizaciones") },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-stone-50 overflow-hidden px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL}
          alt="Desde Cero"
          className="w-full max-w-3xl h-auto"
        />

        <p className="mt-8 text-base md:text-lg text-muted-foreground text-center max-w-2xl">
          {t("heroDesc")}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href={`/${locale}/empiezo-desde-cero`}>
            <Button size="lg" className="rounded-full px-10">
              {t("ctaEmpiezo")}
            </Button>
          </Link>
          <Link href={`/${locale}/solicitar-viaje`}>
            <Button size="lg" variant="outline" className="rounded-full px-10">
              {t("ctaSolicitar")}
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            {t("comoFunciona")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
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
