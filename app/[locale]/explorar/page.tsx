"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { getSupabase, TABLES } from "@/lib/supabase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapIcon, ListIcon } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { ListItem } from "@/components/maps/map-view"
import { getEstados, getCoords, getCityCoord } from "@/lib/estados"
import type { Estado } from "@/lib/estados"

const MapView = dynamic(
  () => import("@/components/maps/map-view").then((m) => ({ default: m.MapView })),
  { ssr: false }
)

type FilterType = "all" | "travel" | "transport" | "housing"

export default function ExplorarPage() {
  const t = useTranslations("explore")
  const tc = useTranslations("common")
  const tr = useTranslations("travelRequest")
  const tt = useTranslations("transportOffer")
  const th = useTranslations("housingOffer")

  const [items, setItems] = useState<ListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [filterState, setFilterState] = useState("")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [estados, setEstados] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = getSupabase()
      const allItems: ListItem[] = []

      const estadosData = await getEstados()
      const estados = await getCoords()
      setEstados(estadosData.map((e) => e.name))

      async function resolveCoord(state: string, city?: string) {
        if (city) {
          const c = await getCityCoord(state, city)
          if (c) return c
        }
        const stateC = estados[state]
        return stateC ? { lat: stateC[0], lng: stateC[1] } : null
      }

      function jitter() { return (Math.random() - 0.5) * 0.3 }

      async function destCoord(state: string, city?: string) {
        const c = await resolveCoord(state, city)
        if (!c) return null
        return { lat: c.lat + jitter(), lng: c.lng + jitter() }
      }

      try {
        const { data: travelReqs } = await supabase.from(TABLES.TRAVEL_REQUESTS).select("*").eq("status", "open").range(0, 49)
        for (const req of (travelReqs ?? [])) {
          const origin = await resolveCoord(req.origin_state, req.origin_city)
          if (!origin) continue
          const dest = req.has_destination && req.destination_state ? await destCoord(req.destination_state, req.destination_city) : null
          const item: ListItem = {
            id: `travel-${req.id}`,
            type: "travel",
            title: tr("title"),
            lat: origin.lat + jitter(),
            lng: origin.lng + jitter(),
            description: `${req.origin_city || req.origin_state} → ${req.destination_city || req.destination_state || "?"} (${req.people_to_move} pers.)`,
          }
          if (dest) {
            item.destLat = dest.lat
            item.destLng = dest.lng
          }
          allItems.push(item)
        }
      } catch {
        toast.error(tc("error"), { description: "No se pudieron cargar las solicitudes de viaje" })
      }

      try {
        const { data: transportOffers } = await supabase.from(TABLES.TRANSPORT_OFFERS).select("*").eq("status", "open").range(0, 49)
        for (const offer of (transportOffers ?? [])) {
          const origin = await resolveCoord(offer.origin_state, offer.origin_city)
          if (!origin) continue
          const dest = offer.destination_state ? await destCoord(offer.destination_state, offer.destination_city) : null
          const item: ListItem = {
            id: `transport-${offer.id}`,
            type: "transport",
            title: tt("title"),
            lat: origin.lat + jitter(),
            lng: origin.lng + jitter(),
            description: `${offer.origin_city || offer.origin_state} → ${offer.destination_city || offer.destination_state || "?"}`,
          }
          if (dest) {
            item.destLat = dest.lat
            item.destLng = dest.lng
          }
          allItems.push(item)
        }
      } catch {
        toast.error(tc("error"), { description: "No se pudieron cargar las ofertas de transporte" })
      }

      try {
        const { data: housingOffers } = await supabase.from(TABLES.HOUSING_OFFERS).select("*").eq("status", "open").range(0, 49)
        for (const offer of (housingOffers ?? [])) {
          const stateCoords = estados[offer.state]
          if (stateCoords) {
            allItems.push({
              id: `housing-${offer.id}`,
              type: "housing",
              title: th("title"),
              lat: stateCoords[0] + (Math.random() - 0.5) * 0.3,
              lng: stateCoords[1] + (Math.random() - 0.5) * 0.3,
              description: `${offer.city}, ${offer.state} (${offer.capacity} pers., ${offer.max_stay_days} días)`,
            })
          }
        }
      } catch {
        toast.error(tc("error"), { description: "No se pudieron cargar las ofertas de hospedaje" })
      }

      setItems(allItems)
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = items.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false
    if (filterState && filterState !== "all") {
      const matches = item.description.includes(filterState)
      if (!matches) return false
    }
    if (search) {
      const q = search.toLowerCase()
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q)
      )
        return false
    }
    return true
  })

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Filters bar */}
      <div className="border-b bg-card p-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label={t("filterType")} className="hidden sm:flex gap-1">
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            aria-pressed={filterType === "all"}
          >
            {t("all")}
          </Button>
          <Button
            size="sm"
            variant={filterType === "travel" ? "default" : "outline"}
            onClick={() => setFilterType("travel")}
            aria-pressed={filterType === "travel"}
          >
            {t("travelRequests")}
          </Button>
          <Button
            size="sm"
            variant={filterType === "transport" ? "default" : "outline"}
            onClick={() => setFilterType("transport")}
            aria-pressed={filterType === "transport"}
          >
            {t("transportOffers")}
          </Button>
          <Button
            size="sm"
            variant={filterType === "housing" ? "default" : "outline"}
            onClick={() => setFilterType("housing")}
            aria-pressed={filterType === "housing"}
          >
            {t("housingOffers")}
          </Button>
        </div>

        <div className="sm:hidden w-full">
          <Select value={filterType} onValueChange={(v) => setFilterType((v ?? "all") as FilterType)}>
            <SelectTrigger aria-label={t("filterType")}>
              <SelectValue placeholder={t("filterType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="travel">{t("travelRequests")}</SelectItem>
              <SelectItem value="transport">{t("transportOffers")}</SelectItem>
              <SelectItem value="housing">{t("housingOffers")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select value={filterState} onValueChange={(v) => setFilterState(v ?? "")}>
            <SelectTrigger aria-label={t("filterOrigin")}>
              <SelectValue placeholder={t("filterOrigin")} />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all")}</SelectItem>
                {estados.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 min-w-0 w-full sm:w-auto">
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1 ml-auto">
          <Button
            size="sm"
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
            aria-pressed={viewMode === "map"}
            aria-label={tc("mapView")}
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            aria-label={tc("listView")}
          >
            <ListIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {viewMode === "map" ? (
          <div className="flex-1 p-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {tc("loading")}
              </div>
            ) : (
              <MapView items={filtered} />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {loading && <SkeletonGrid cols={3} count={6} />}
            {!loading && filtered.length === 0 && (
              <p className="text-muted-foreground">{t("noResults")}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={
                      item.type === "travel" ? "border-primary text-primary" :
                      item.type === "transport" ? "border-accent text-accent" :
                      "border-green-600 text-green-600"
                    }>
                      {item.type === "travel" ? t("travelRequests") :
                       item.type === "transport" ? t("transportOffers") :
                       t("housingOffers")}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
