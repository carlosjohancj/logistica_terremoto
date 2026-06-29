"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { toast } from "sonner"
import { Plus, Building2, MapPin, Briefcase, EyeOff } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import estados from "@/data/venezuela.json"

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

  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    requirements: "",
    location_state: "",
    location_city: "",
    modality: "",
    salary_range: "",
    contact_email: "",
  })

  useEffect(() => {
    const pb = getPB()
    if (!pb.authStore.model) {
      window.location.href = `/${window.location.pathname.split("/")[1]}/auth/login`
      return
    }
    loadCompanies()
  }, [])

  async function loadCompanies() {
    const pb = getPB()
    try {
      const res = await pb.collection(COLLECTIONS.COMPANIES).getList(1, 50, {
        filter: `user = "${pb.authStore.model!.id}"`,
      })
      const items = res.items as unknown as Company[]
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

  async function loadJobs(companyId: string) {
    const pb = getPB()
    try {
      const res = await pb.collection(COLLECTIONS.JOBS).getList(1, 100, {
        filter: `company = "${companyId}"`,
        sort: "-created",
      })
      setJobs(res.items as unknown as Job[])
    } catch {
      toast.error(tc("error"))
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault()
    if (!jobForm.title || !jobForm.modality || !jobForm.location_state) {
      toast.error(tc("error"), { description: tc("errorRequired") })
      return
    }

    try {
      const pb = getPB()
      await pb.collection(COLLECTIONS.JOBS).create({
        ...jobForm,
        company: selectedCompany,
        status: "open",
      })
      toast.success(tj("success") || "Empleo creado")
      setDialogOpen(false)
      setJobForm({
        title: "",
        description: "",
        requirements: "",
        location_state: "",
        location_city: "",
        modality: "",
        salary_range: "",
        contact_email: "",
      })
      loadJobs(selectedCompany)
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    }
  }

  async function closeJob(jobId: string) {
    try {
      const pb = getPB()
      await pb.collection(COLLECTIONS.JOBS).update(jobId, { status: "closed" })
      toast.success("Empleo cerrado")
      loadJobs(selectedCompany)
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    }
  }

  const selectedEstado = estados.find((e) => e.estado === jobForm.location_state)

  if (!loading && companies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">{t("register")}</h2>
        <p className="text-muted-foreground mb-6">{t("registerDesc")}</p>
        <a href="/empresas/registro"><Button>{t("submit")}</Button></a>
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
                <form onSubmit={handleCreateJob}>
                  <DialogHeader>
                    <DialogTitle>{tj("newJob") || "Crear empleo"}</DialogTitle>
                    <DialogDescription>{tj("subtitle")}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>{tj("title")}</Label>
                      <Input
                        value={jobForm.title}
                        onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tj("description") || "Descripción"}</Label>
                      <Textarea
                        value={jobForm.description}
                        onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tj("requirements")}</Label>
                      <Textarea
                        value={jobForm.requirements}
                        onChange={(e) => setJobForm((p) => ({ ...p, requirements: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{tj("filterState")}</Label>
                        <Select
                          value={jobForm.location_state}
                          onValueChange={(v) => setJobForm((p) => ({ ...p, location_state: v ?? "", location_city: "" }))}
                        >
                          <SelectTrigger><SelectValue placeholder={tj("filterState")} /></SelectTrigger>
                          <SelectContent>
                            {estados.map((e) => (
                              <SelectItem key={e.estado} value={e.estado}>{e.estado}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{tj("location")}</Label>
                        <Select
                          value={jobForm.location_city}
                          onValueChange={(v) => setJobForm((p) => ({ ...p, location_city: v ?? "" }))}
                          disabled={!selectedEstado}
                        >
                          <SelectTrigger><SelectValue placeholder={tj("location")} /></SelectTrigger>
                          <SelectContent>
                            {selectedEstado?.municipios.map((m) => (
                              <SelectItem key={m.municipio} value={m.municipio}>{m.municipio}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{tj("modality")}</Label>
                        <Select
                          value={jobForm.modality}
                          onValueChange={(v) => setJobForm((p) => ({ ...p, modality: v ?? "" }))}
                        >
                          <SelectTrigger><SelectValue placeholder={tj("modality")} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="presencial">{tj("presencial")}</SelectItem>
                            <SelectItem value="remoto">{tj("remoto")}</SelectItem>
                            <SelectItem value="hibrido">{tj("hibrido")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{tj("salary")}</Label>
                        <Input
                          value={jobForm.salary_range}
                          onChange={(e) => setJobForm((p) => ({ ...p, salary_range: e.target.value }))}
                          placeholder="$"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{tj("contact")}</Label>
                      <Input
                        type="email"
                        value={jobForm.contact_email}
                        onChange={(e) => setJobForm((p) => ({ ...p, contact_email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{tc("save")}</Button>
                  </DialogFooter>
                </form>
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
