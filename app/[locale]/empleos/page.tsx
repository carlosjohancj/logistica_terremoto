"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { toast } from "sonner"
import { Search, Building2, MapPin, Briefcase } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { useEstados } from "@/lib/estados"

type Job = {
  id: string
  title: string
  company?: string
  expand?: { company?: { name: string } }
  description: string
  requirements: string
  location_state: string
  location_city: string
  modality: string
  salary_range: string
  contact_email: string
  status: string
  created: string
}

export default function EmpleosPage() {
  const t = useTranslations("jobs")
  const tc = useTranslations("common")

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterModality, setFilterModality] = useState("")
  const { estados, loading: estadosLoading } = useEstados()

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const pb = getPB()
        const res = await pb.collection(COLLECTIONS.JOBS).getList(1, 100, {
          filter: 'status = "open"',
          sort: "-created",
          expand: "company",
        })
        setJobs(res.items as unknown as Job[])
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
        !(job.expand?.company?.name || "").toLowerCase().includes(q)
      )
        return false
    }
    if (filterState && job.location_state !== filterState) return false
    if (filterModality && job.modality !== filterModality) return false
    return true
  })

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterState} onValueChange={(v) => setFilterState(v ?? "")}>
          <SelectTrigger className="w-full sm:w-44">
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
          <SelectTrigger className="w-full sm:w-40">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((job) => (
          <Link key={job.id} href={`/empleos/${job.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{job.title}</CardTitle>
                  <Badge variant="outline" className="shrink-0">
                    {job.modality}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3" />
                  {job.expand?.company?.name || "Empresa"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location_city}, {job.location_state}
                  </span>
                  {job.salary_range && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {job.salary_range}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
