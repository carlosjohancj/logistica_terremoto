"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { StepCard } from "@/components/ui/step-card";
import { ImageTextCarousel, type ImageTextCarouselItem } from "@/components/shared/image-text-carousel";
import { BrandBannerStack, BannerHighlight, type BrandBannerItem } from "@/components/shared/brand-banner-stack";
import { FaqSection } from "@/components/shared/faq-section";
import { getSupabase, TABLES } from "@/types/supabase";
import { usePathname } from "next/navigation";

const LOGO_URL =
  "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/desde-cero.webp";

const impactSlides: ImageTextCarouselItem[] = [
  {
    image: "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/backgrounds/logistic.webp",
    label: "Logística civil",
  },
  {
    image: "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/backgrounds/effective-help.webp",
    label: "Ayuda efectiva",
  },
  {
    image: "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/backgrounds/rebuild.webp",
    label: "Reconstrucción",
  },
];

const brandBanners: BrandBannerItem[] = [
  {
    image: "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/backgrounds/volunteer.webp",
    title: "Conecta voluntarios",
    subtitle: (
      <>
        Únete a una red de personas que quiere <BannerHighlight>hacer la diferencia.</BannerHighlight>
      </>
    ),
  },
  {
    image: "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/backgrounds/volunteer2.webp",
    title: "Coordina ayuda efectiva",
    subtitle: (
      <>
        Organizaciones y voluntarios trabajando juntos para que la ayuda llegue{" "}
        <BannerHighlight>donde más se necesita.</BannerHighlight>
      </>
    ),
  },
  {
    image: "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/backgrounds/desde-0.webp",
    title: "Apoya a quienes lo necesitan",
    subtitle: (
      <>
        Si necesitas <BannerHighlight>ayuda o quieres</BannerHighlight> donar, aquí comienza el cambio{" "}
        <BannerHighlight>en Venezuela.</BannerHighlight>
      </>
    ),
  },
];

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
    { icon: "📝", tag: "01", title: t("paso1"), desc: t("paso1Desc") },
    { icon: "📢", tag: "02", title: t("paso2"), desc: t("paso2Desc") },
    { icon: "🤝", tag: "03", title: t("paso3"), desc: t("paso3Desc") },
  ];

  const stats = [
    { value: counts.viajes ?? "-", label: t("statsViajes"), desc: t("statsViajesDesc") },
    { value: counts.transportistas ?? "-", label: t("statsTransportistas"), desc: t("statsTransportistasDesc") },
    { value: counts.voluntarios ?? "-", label: t("statsVoluntarios"), desc: t("statsVoluntariosDesc") },
    { value: counts.organizaciones ?? "-", label: t("statsOrganizaciones"), desc: t("statsOrganizacionesDesc") },
  ];

  const faqItems = Array.from({ length: 9 }, (_, i) => ({
    question: t(`faq${i + 1}Q`),
    answer: t(`faq${i + 1}A`),
  }));

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
            <Button size="lg" className="rounded-full px-10 h-14 text-base">
              {t("ctaEmpiezo")}
            </Button>
          </Link>
          <Link href={`/${locale}/solicitar-viaje`}>
            <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base">
              {t("ctaSolicitar")}
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            {t("comoFunciona")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <StepCard
                key={step.title}
                icon={step.icon}
                tag={step.tag}
                title={step.title}
                description={step.desc}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight">
              {t("impactTitleStart")}{" "}
              <span className="text-primary">{t("impactTitleHighlight")}</span>{" "}
              {t("impactTitleEnd")}
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
              {t("impactSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                desc={stat.desc}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <ImageTextCarousel items={impactSlides} className="rounded-none" />
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <BrandBannerStack items={brandBanners} />
        </div>
      </section>

      <FaqSection
        title={t("faqTitle")}
        subtitle={t("faqSubtitle")}
        items={faqItems}
      />

    </div>
  );
}
