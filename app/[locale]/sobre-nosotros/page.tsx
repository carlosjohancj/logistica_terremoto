import { useTranslations } from "next-intl"
import { VisionHero } from "@/components/about/vision-hero"
import { ValuesSection } from "@/components/about/values-section"
import { TeamSection } from "@/components/about/team-section"
import { JoinCta } from "@/components/about/join-cta"

export default function SobreNosotrosPage() {
  return <SobreNosotrosContent />
}

function SobreNosotrosContent() {
  const t = useTranslations("about")

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </section>

      <VisionHero />
      <ValuesSection />
      <TeamSection />
      <JoinCta />
    </div>
  )
}
