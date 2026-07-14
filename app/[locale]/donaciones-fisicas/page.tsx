"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { getSupabase, TABLES } from "@/types/supabase"
import { toast } from "sonner"
import { Search, Package, MapPin, Truck, ArrowDownUp } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { useEstados } from "@/lib/estados"
import { SELECT_TRIGGER_CLASS, BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles"
import { cn } from "@/lib/utils"
import { PageHero } from "@/components/shared/page-hero"
import { CommunityStatsBar } from "@/components/shared/community-stats-bar"

type Supply = {
  id: string
  type: "offer" | "request"
  category: string
  title: string
  description: string
  quantity: number
  condition: string
  state: string
  municipality: string
  city: string
  needs_transport: boolean
  status: string
  created: string
}

export default function DonacionesFisicasPage() {
  const t = useTranslations("supplies")
  const tc = useTranslations("common")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  const [items, setItems] = useState<Supply[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "offer" | "request">("all")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterState, setFilterState] = useState("")
  const [search, setSearch] = useState("")
  const { estados, loading: estadosLoading } = useEstados()

  const categories: { value: string; label: string }[] = [
    { value: "camas", label: t("camas") },
    { value: "comida", label: t("comida") },
    { value: "ropa", label: t("ropa") },
    { value: "medicinas", label: t("medicinas") },
    { value: "agua", label: t("agua") },
    { value: "higiene", label: t("higiene") },
    { value: "electronico", label: t("electronico") },
    { value: "materiales", label: t("materiales") },
    { value: "muebles", label: t("muebles") },
    { value: "otros", label: t("otros") },
  ]

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const supabase = getSupabase()
        const { data } = await supabase.from(TABLES.SUPPLIES).select("*").eq("status", "open").order("created_at", { ascending: false }).range(0, 99)
        setItems((data ?? []) as unknown as Supply[])
      } catch {
        toast.error(tc("error"))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = items.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false
    if (filterCategory && item.category !== filterCategory) return false
    if (filterState && item.state !== filterState) return false
    if (search) {
      const q = search.toLowerCase()
      if (!item.title.toLowerCase().includes(q) && !(item.description || "").toLowerCase().includes(q))
        return false
    }
    return true
  })

  return (
    <div className="flex flex-col">
      <PageHero
        title={t("listTitle")}
        description={t("listSubtitle")}
        cta={{ label: t("addButton"), href: `/${locale}/ofrecer-insumos`, icon: Package }}
        className="bg-accent text-accent-foreground"
      />
      <CommunityStatsBar />

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label={t("search")}
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 pr-4"
            />
          </div>
          <div role="group" aria-label={t("all")} className="flex flex-wrap gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              className={cn(BUTTON_HEIGHT_CLASS, "px-4")}
              onClick={() => setFilterType("all")}
              aria-pressed={filterType === "all"}
            >
              <ArrowDownUp className="h-3 w-3 mr-1" aria-hidden="true" /> {t("all")}
            </Button>
            <Button
              variant={filterType === "offer" ? "default" : "outline"}
              className={cn(BUTTON_HEIGHT_CLASS, "px-4")}
              onClick={() => setFilterType("offer")}
              aria-pressed={filterType === "offer"}
            >
              {t("iOffer")}
            </Button>
            <Button
              variant={filterType === "request" ? "default" : "outline"}
              className={cn(BUTTON_HEIGHT_CLASS, "px-4")}
              onClick={() => setFilterType("request")}
              aria-pressed={filterType === "request"}
            >
              {t("iNeed")}
            </Button>
          </div>
          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "")}>
            <SelectTrigger aria-label={t("category")} className={cn(SELECT_TRIGGER_CLASS, "sm:w-36")}>
              <SelectValue placeholder={t("category")}>
                {(value: string | null) => (value ? categories.find((c) => c.value === value)?.label ?? value : t("allCategories"))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("allCategories")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterState} onValueChange={(v) => setFilterState(v ?? "")}>
            <SelectTrigger aria-label={t("state")} className={cn(SELECT_TRIGGER_CLASS, "sm:w-40")}>
              <SelectValue placeholder={t("state")} />
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
        </div>

        {loading && <SkeletonGrid cols={3} count={6} />}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground">{t("noResults")}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Link key={item.id} href={`/donaciones-fisicas/${item.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {t(item.category)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={item.type === "offer" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {item.type === "offer" ? t("iOffer") : t("iNeed")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.city && `${item.city}, `}{item.state}
                    </span>
                    {item.quantity > 0 && <span>{t("qty")}: {item.quantity}</span>}
                    {item.needs_transport && (
                      <span className="flex items-center gap-1 text-primary">
                        <Truck className="h-3 w-3" />
                        {t("needsTransport")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
