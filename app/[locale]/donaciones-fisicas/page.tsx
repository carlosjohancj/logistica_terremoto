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
import { Search, Package, MapPin, Truck, ArrowDownUp } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import estados from "@/data/venezuela.json"

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

  const [items, setItems] = useState<Supply[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "offer" | "request">("all")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterState, setFilterState] = useState("")
  const [search, setSearch] = useState("")

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
        const pb = getPB()
        const res = await pb.collection(COLLECTIONS.SUPPLIES).getList(1, 100, {
          filter: 'status = "open"',
          sort: "-created",
        })
        setItems(res.items as unknown as Supply[])
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t("listTitle")}</h1>
          <p className="text-muted-foreground">{t("listSubtitle")}</p>
        </div>
        <Link href="/ofrecer-insumos">
          <Button>{t("addButton")}</Button>
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
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            <ArrowDownUp className="h-3 w-3 mr-1" /> {t("all")}
          </Button>
          <Button
            variant={filterType === "offer" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("offer")}
          >
            {t("iOffer")}
          </Button>
          <Button
            variant={filterType === "request" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("request")}
          >
            {t("iNeed")}
          </Button>
        </div>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "")}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder={t("category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterState} onValueChange={(v) => setFilterState(v ?? "")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t("state")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("all")}</SelectItem>
            {estados.map((e) => (
              <SelectItem key={e.estado} value={e.estado}>{e.estado}</SelectItem>
            ))}
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
  )
}
