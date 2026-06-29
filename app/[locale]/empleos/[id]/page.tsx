"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, notFound } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { SkeletonDetail } from "@/components/ui/skeleton"
import {
  Building2,
  MapPin,
  Briefcase,
  Mail,
  Calendar,
  ChevronLeft,
} from "lucide-react"

type Job = {
  id: string
  title: string
  company?: { name: string; description: string; website: string } | null
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

export default function JobDetailPage() {
  const t = useTranslations("jobs")
  const tc = useTranslations("common")
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJob() {
      try {
        const supabase = getSupabase()
        const { data: res } = await supabase
          .from(TABLES.JOBS)
          .select("*, company:companies(*)")
          .eq("id", id)
          .single()
        setJob(res as unknown as Job)
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id])

  if (loading) return <SkeletonDetail />
  if (!job) notFound()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> {tc("back")}
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl mb-1">{job.title}</CardTitle>
              </div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {job.company?.name || "Empresa"}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 text-sm px-3 py-1">
              {job.modality}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location_city}, {job.location_state}
            </span>
            {job.salary_range && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.salary_range}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {t("postedDate")}: {new Date(job.created).toLocaleDateString()}
            </span>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t("description")}</h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {job.description || t("noDescription")}
            </p>
          </div>

          {job.requirements && (
            <div>
              <h3 className="font-semibold mb-2">{t("requirements")}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {job.requirements}
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">{t("contact")}</p>
            <a
              href={`mailto:${job.contact_email}`}
              className="inline-flex items-center gap-2"
            >
              <Button size="lg" className="w-full sm:w-auto">
                <Mail className="h-4 w-4 mr-1" />
                {t("applyEmail")}
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
