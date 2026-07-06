"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight } from "lucide-react"

export function JoinCta() {
  const t = useTranslations("about")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground">
      <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-14 size-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        <h2 className="mb-4 text-3xl font-bold">{t("joinUs")}</h2>
        <p className="mx-auto mb-8 max-w-lg opacity-90">{t("joinUsDesc")}</p>
        <Link
          href={`/${locale}/auth/login`}
          className="group mx-auto flex w-full max-w-xl items-center justify-between gap-4 rounded-full bg-gradient-to-r from-sky-100 via-violet-100 to-rose-100 py-3 pl-10 pr-3 shadow-lg transition-transform hover:scale-[1.02]"
        >
          <span className="text-xl font-bold text-neutral-900">{t("ctaButton")}</span>
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition-transform group-hover:translate-x-1">
            <ArrowRight className="h-7 w-7" />
          </span>
        </Link>
      </div>
    </section>
  )
}
