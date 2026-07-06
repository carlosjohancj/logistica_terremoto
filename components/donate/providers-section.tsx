"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { HandHeart } from "lucide-react"
import { getSupabase, TABLES } from "@/lib/supabase"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { NumberedPagination } from "@/components/shared/numbered-pagination"
import { ProviderCard, type Provider } from "./provider-card"
import { SectionHeader } from "./section-header"

const PAGE_SIZE = 6

export function ProvidersSection() {
  const t = useTranslations("donate")
  const f = useTranslations("familyAid")

  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase()
        const { data } = await supabase
          .from(TABLES.SERVICE_PROVIDERS)
          .select("*")
          .eq("status", "active")
          .order("name")
          .range(0, 99)
        setProviders((data ?? []) as Provider[])
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalPages = Math.max(1, Math.ceil(providers.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = providers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <section className="mb-12">
      <SectionHeader
        icon={HandHeart}
        title={t("organizacionesTitle")}
        description={t("organizacionesDesc")}
      />

      {loading && <SkeletonGrid cols={3} count={6} />}
      {!loading && providers.length === 0 && (
        <p className="text-muted-foreground text-center py-8">{f("sinProviders")}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
        {paginated.map((p) => (
          <ProviderCard key={p.id} provider={p} />
        ))}
      </div>

      {!loading && (
        <NumberedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      )}
    </section>
  )
}
