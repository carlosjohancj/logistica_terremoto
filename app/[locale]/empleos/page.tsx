"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { useEstados } from "@/lib/estados"
import { JobCard, type Job } from "@/components/jobs/job-card"
import { FIELD_CLASS, SELECT_TRIGGER_CLASS } from "@/components/shared/field-styles"
import { NumberedPagination } from "@/components/shared/numbered-pagination"

const PAGE_SIZE = 15

export default function EmpleosPage() {
  const t = useTranslations("jobs")
  const tc = useTranslations("common")

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterModality, setFilterModality] = useState("")
  const [page, setPage] = useState(1)
  const { estados, loading: estadosLoading } = useEstados()

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { data } = await supabase.from(TABLES.JOBS).select("*, company:companies(name)").eq("status", "open").order("created_at", { ascending: false }).range(0, 99)
        setJobs((data ?? []) as unknown as Job[])
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filtered = jobs.filter((job) => {
    if (search) {
      const q = search.toLowerCase()
      if (
        !job.title.toLowerCase().includes(q) &&
        !(job.company?.name || "").toLowerCase().includes(q)
      )
        return false
    }
    if (filterState && job.location_state !== filterState) return false
    if (filterModality && job.modality !== filterModality) return false
    return true
  })

  useEffect(() => {
    setPage(1)
  }, [search, filterState, filterModality])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/empresas/registro">
          <Button>{t("registerCompany")}</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            aria-label={t("search")}
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${FIELD_CLASS} pl-9`}
          />
        </div>
        <Select value={filterState} onValueChange={(v) => setFilterState(v ?? "")}>
          <SelectTrigger aria-label={t("filterState")} className={`${SELECT_TRIGGER_CLASS} sm:w-44`}>
            <SelectValue placeholder={t("filterState")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("all")}</SelectItem>
            {estadosLoading ? (
              <SelectItem value="" disabled>{tc("loading")}</SelectItem>
            ) : (
              estados.map((e) => (
                <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <Select value={filterModality} onValueChange={(v) => setFilterModality(v ?? "")}>
          <SelectTrigger aria-label={t("filterModality")} className={`${SELECT_TRIGGER_CLASS} sm:w-40`}>
            <SelectValue placeholder={t("filterModality")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("all")}</SelectItem>
            <SelectItem value="presencial">{t("presencial")}</SelectItem>
            <SelectItem value="remoto">{t("remoto")}</SelectItem>
            <SelectItem value="hibrido">{t("hibrido")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <SkeletonGrid cols={3} count={6} />}
      {!loading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground">{t("noResults")}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((job, index) => (
          <JobCard key={job.id} job={job} index={index} />
        ))}
      </div>

      {!loading && (
        <NumberedPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} className="mt-10" />
      )}
    </div>
  )
}
