"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"

const SECTION_KEYS = [
  "sectionService",
  "sectionLiability",
  "sectionUser",
  "sectionDonations",
  "sectionPrivacy",
  "sectionChanges",
] as const

export default function TerminosDeUsoPage() {
  return <TerminosDeUsoContent />
}

function TerminosDeUsoContent() {
  const t = useTranslations("terms")

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">{t("intro")}</p>

      <div className="mt-10 space-y-8">
        {SECTION_KEYS.map((key) => (
          <section key={key}>
            <h2 className="text-lg font-semibold">{t(`${key}Title`)}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {t(`${key}Body`)}
            </p>
          </section>
        ))}

        <ContactSection />
      </div>
    </div>
  )
}

function ContactSection() {
  const t = useTranslations("terms")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  return (
    <section>
      <h2 className="text-lg font-semibold">{t("sectionContactTitle")}</h2>
      <p className="mt-2 leading-relaxed text-muted-foreground">
        {t("sectionContactBody")}
      </p>
      <Link
        href={`/${locale}/contacto`}
        className="mt-2 inline-block text-primary hover:underline"
      >
        {t("contactLinkLabel")} →
      </Link>
    </section>
  )
}
