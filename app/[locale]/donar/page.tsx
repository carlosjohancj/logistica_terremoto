"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, ExternalLink, Users, HandHeart, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getSupabase, TABLES } from "@/lib/supabase"
import { HELP_TYPES } from "@/lib/forms/constants"

type Provider = {
  id: string
  name: string
  description: string
  website: string
  donation_link: string
  contact_email: string
  contact_phone: string
  services: string[]
  logo_url: string
}

type AidRequest = {
  id: string
  title: string
  description: string
  story: string
  amount_needed: number
  help_type: string
  location_state: string
  location_city: string
  status: string
  created_at: string
}

export default function DonarPage() {
  const t = useTranslations("donate")
  const f = useTranslations("familyAid")
  const ht = useTranslations("helpTypes")
  const tc = useTranslations("common")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  const [providers, setProviders] = useState<Provider[]>([])
  const [requests, setRequests] = useState<AidRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("")
  const [filterState, setFilterState] = useState("")
  const [filterStatus, setFilterStatus] = useState("open")

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabase()
        const [provRes, reqRes] = await Promise.all([
          supabase.from(TABLES.SERVICE_PROVIDERS).select("*").eq("status", "active").order("name"),
          supabase.from(TABLES.FAMILY_AID_REQUESTS).select("*").order("created_at", { ascending: false }),
        ])
        setProviders((provRes.data ?? []) as Provider[])
        setRequests((reqRes.data ?? []) as AidRequest[])
      } catch {
        /* ignore */
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = requests.filter((r) => {
    if (filterType && r.help_type !== filterType) return false
    if (filterState && r.location_state !== filterState) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <Heart className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t("desc")}</p>
      </div>

      <Card className="mb-12">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">{t("plataformaTitle")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("plataformaDesc")}</p>
          <Link href="https://paypal.me/desdecero" target="_blank">
            <Button size="lg" className="rounded-full px-10 gap-2">
              <Heart className="h-4 w-4" /> {t("heroCta")}
            </Button>
          </Link>
        </CardContent>
      </Card>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <HandHeart className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">{t("organizacionesTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("organizacionesDesc")}</p>
          </div>
        </div>

        {providers.length === 0 && !loading && (
          <p className="text-muted-foreground text-center py-8">{f("sinProviders")}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {p.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo_url} alt={p.name} className="h-12 w-auto mb-3 object-contain" />
                )}
                <h3 className="font-semibold mb-1">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{p.description}</p>
                )}
                {p.services && p.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.services.map((s) => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {ht(s as keyof typeof ht)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {p.donation_link && (
                    <Link href={p.donation_link} target="_blank">
                      <Button size="sm" variant="default" className="rounded-full gap-1">
                        {t("heroCta")} <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                  {p.website && (
                    <Link href={p.website} target="_blank">
                      <Button size="sm" variant="outline" className="rounded-full gap-1">
                        {tc("view")} <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">{f("title")}</h2>
            <p className="text-sm text-muted-foreground">{f("subtitle")}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{f("filters")}:</span>
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v || "")}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder={f("all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={""}>{f("all")}</SelectItem>
              {HELP_TYPES.map((htype) => (
                <SelectItem key={htype} value={htype}>{ht(htype)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v || "")}>
            <SelectTrigger className="w-36 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">{f("open")}</SelectItem>
              <SelectItem value="fulfilled">{f("fulfilled")}</SelectItem>
              <SelectItem value="closed">{f("closed")}</SelectItem>
            </SelectContent>
          </Select>
          <Link href={`/${locale}/donar/solicitar`}>
            <Button size="sm" variant="default" className="rounded-full whitespace-nowrap">
              {f("formTitle")}
            </Button>
          </Link>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">{f("sinResultados")}</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{req.title}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {ht(req.help_type as keyof typeof ht)}
                      </span>
                    </div>
                    {req.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{req.description}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {req.amount_needed && (
                        <span>{f("cantidad")}: ${req.amount_needed}</span>
                      )}
                      {(req.location_state || req.location_city) && (
                        <span>{req.location_city}{req.location_city && req.location_state ? ", " : ""}{req.location_state}</span>
                      )}
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    {req.story && (
                      <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2 border-l-2 border-primary/20 pl-3">
                        {req.story}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/contacto`}
                    className="rounded-full shrink-0"
                  >
                    <Button size="sm" variant="outline">{f("contactar")}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
