"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { Plus, Building2, MapPin, Briefcase, EyeOff } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { JobForm } from "@/components/forms/job/form"

type Company = {
  id: string
  name: string
  verified: boolean
}

type Job = {
  id: string
  title: string
  location_state: string
  location_city: string
  modality: string
  salary_range: string
  status: string
  created: string
}

export default function DashboardPage() {
  const t = useTranslations("companies")
  const tj = useTranslations("jobs")
  const tc = useTranslations("common")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function loadCompanies() {
    const supabase = getSupabase()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const res = await supabase
        .from(TABLES.COMPANIES)
        .select("*")
        .eq("user_id", user!.id)
      const items = (res.data || []) as unknown as Company[]
      setCompanies(items)
      if (items.length > 0) {
        setSelectedCompany(items[0].id)
        loadJobs(items[0].id)
      } else {
        setLoading(false)
      }
    } catch {
      toast.error(tc("error"))
      setLoading(false)
    }
  }

  useEffect(() => {
    async function init() {
      const supabase = getSupabase()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = `/${window.location.pathname.split("/")[1]}/auth/login`
        return
      }
      loadCompanies()
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadJobs(companyId: string) {
    const supabase = getSupabase()
    try {
      const res = await supabase
        .from(TABLES.JOBS)
        .select("*")
        .eq("company_id", companyId)
        .order("created", { ascending: false })
      setJobs((res.data || []) as unknown as Job[])
    } catch {
      toast.error(tc("error"))
    } finally {
      setLoading(false)
    }
  }

  async function closeJob(jobId: string) {
    try {
      const supabase = getSupabase()
      await supabase.from(TABLES.JOBS).update({ status: "closed" }).eq("id", jobId)
      toast.success("Empleo cerrado")
      loadJobs(selectedCompany)
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    }
  }

  if (!loading && companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">{t("register")}</h2>
        <p className="text-muted-foreground mb-6">{t("registerDesc")}</p>
        <Link href={`/${locale}/empresas/registro`}>
          <Button>{t("submit")}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{tj("title")} - Panel</h1>
          <p className="text-muted-foreground">{tj("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          {companies.length > 0 && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> {tj("newJob") || "Nuevo empleo"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <JobForm
                  companyId={selectedCompany}
                  onSuccess={() => {
                    setDialogOpen(false)
                    loadJobs(selectedCompany)
                  }}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {companies.length > 1 && (
        <div className="flex gap-2 mb-6">
          {companies.map((c) => (
            <Button
              key={c.id}
              variant={selectedCompany === c.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCompany(c.id)
                setLoading(true)
                loadJobs(c.id)
              }}
            >
              {c.name}
            </Button>
          ))}
        </div>
      )}

      {loading && <SkeletonGrid cols={1} count={5} />}
      {!loading && jobs.length === 0 && (
        <p className="text-center text-muted-foreground">{tj("noResults")}</p>
      )}

      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{job.title}</h3>
                  <Badge
                    variant={job.status === "open" ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location_city}, {job.location_state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {job.modality}
                  </span>
                  {job.salary_range && <span>{job.salary_range}</span>}
                </div>
              </div>
              {job.status === "open" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => closeJob(job.id)}
                  className="shrink-0 ml-4"
                >
                  <EyeOff className="h-4 w-4 mr-1" /> Cerrar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
