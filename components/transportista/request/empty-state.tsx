"use client"

import { useTranslations } from "next-intl"
import { PackageSearch } from "lucide-react"

export function RequestEmptyState() {
  const t = useTranslations("requestManager")

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
      <PackageSearch className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{t("emptyTitle")}</p>
      <p className="text-sm text-muted-foreground max-w-xs">{t("emptyDescription")}</p>
    </div>
  )
}
