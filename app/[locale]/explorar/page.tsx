"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import { getSupabase, TABLES } from "@/types/supabase"
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
import { Card, CardContent } from "@/components/ui/card"
import { MapIcon, ListIcon, Search, Route, Truck, Home, type LucideIcon } from "lucide-react"
import { SkeletonGrid } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { ListItem } from "@/components/maps/map-view"
import { getEstados, getCoords, getCityCoord } from "@/lib/estados"
import { fetchRoutesBatch } from "@/lib/maps/fetch-route"
import { NumberedPagination } from "@/components/shared/numbered-pagination"
import { FIELD_CLASS, SELECT_TRIGGER_CLASS, BUTTON_HEIGHT_CLASS } from "@/components/shared/field-styles"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

const TYPE_META: Record<ListItem["type"], { icon: LucideIcon; badgeClass: string; iconBgClass: string }> = {
  travel: { icon: Route, badgeClass: "border-primary text-primary", iconBgClass: "bg-primary/10 text-primary" },
  transport: { icon: Truck, badgeClass: "border-accent text-accent", iconBgClass: "bg-accent/10 text-accent" },
  housing: { icon: Home, badgeClass: "border-green-600 text-green-600", iconBgClass: "bg-green-600/10 text-green-600" },
}

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
  const [listPage, setListPage] = useState(1)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  function selectOnMap(id: string) {
    setSelectedItemId(id)
    setViewMode("map")
  }

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
          const dest = req.has_destination && req.destination_state ? await destCoord(req.destination_state, req.destination_city ?? undefined) : null
          const item: ListItem = {
            id: `travel-${req.id}`,
            type: "travel",
            title: tr("title"),
            lat: origin.lat + jitter(),
            lng: origin.lng + jitter(),
            description: `${req.origin_city || req.origin_state} → ${req.destination_city || req.destination_state || "?"} (${req.people_to_move} pers.)`,
            notes: req.notes || undefined,
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
            notes: offer.vehicle_type
              ? `Vehículo: ${offer.vehicle_type}${offer.notes ? ` — ${offer.notes}` : ""}`
              : offer.notes || undefined,
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
              notes: offer.notes || undefined,
            })
          }
        }
      } catch {
        toast.error(tc("error"), { description: "No se pudieron cargar las ofertas de hospedaje" })
      }

      setItems(allItems)

      const routePairs = allItems
        .filter((item) => item.destLat !== undefined && item.destLng !== undefined)
        .map((item) => ({
          id: item.id,
          fromLng: item.lng,
          fromLat: item.lat,
          toLng: item.destLng!,
          toLat: item.destLat!,
        }))

      if (routePairs.length > 0) {
        const routes = await fetchRoutesBatch(routePairs, 5)
        if (routes.size > 0) {
          setItems((prev) =>
            prev.map((item) => {
              const route = routes.get(item.id)
              if (!route) {
                if (item.destLat !== undefined) {
                  return { ...item, routeApproximate: true }
                }
                return item
              }
              return {
                ...item,
                routeGeometry: route.geometry,
                routeDistance: route.distanceKm,
                routeApproximate: false,
              }
            }),
          )
        } else {
          setItems((prev) =>
            prev.map((item) =>
              item.destLat !== undefined
                ? { ...item, routeApproximate: true }
                : item,
            ),
          )
        }
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    setListPage(1)
  }, [filterType, filterState, search])

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

  const listTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const listCurrentPage = Math.min(listPage, listTotalPages)
  const paginated = filtered.slice(
    (listCurrentPage - 1) * PAGE_SIZE,
    listCurrentPage * PAGE_SIZE
  )

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Filters bar */}
      <div className="border-b bg-muted/50 p-4 flex flex-wrap items-center gap-2.5">
        <div role="group" aria-label={t("filterType")} className="hidden sm:flex gap-1.5">
          <Button
            className={BUTTON_HEIGHT_CLASS}
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            aria-pressed={filterType === "all"}
          >
            {t("all")}
          </Button>
          <Button
            className={BUTTON_HEIGHT_CLASS}
            variant={filterType === "travel" ? "default" : "outline"}
            onClick={() => setFilterType("travel")}
            aria-pressed={filterType === "travel"}
          >
            {t("travelRequests")}
          </Button>
          <Button
            className={BUTTON_HEIGHT_CLASS}
            variant={filterType === "transport" ? "default" : "outline"}
            onClick={() => setFilterType("transport")}
            aria-pressed={filterType === "transport"}
          >
            {t("transportOffers")}
          </Button>
          <Button
            className={BUTTON_HEIGHT_CLASS}
            variant={filterType === "housing" ? "default" : "outline"}
            onClick={() => setFilterType("housing")}
            aria-pressed={filterType === "housing"}
          >
            {t("housingOffers")}
          </Button>
        </div>

        <div className="sm:hidden w-full">
          <Select value={filterType} onValueChange={(v) => setFilterType((v ?? "all") as FilterType)}>
            <SelectTrigger aria-label={t("filterType")} className={cn(SELECT_TRIGGER_CLASS, "w-full")}>
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
            <SelectTrigger aria-label={t("filterOrigin")} className={cn(SELECT_TRIGGER_CLASS, "w-full")}>
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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(FIELD_CLASS, "pl-10")}
          />
        </div>

        <div className="flex gap-1.5 ml-auto">
          <Button
            size="icon"
            className="h-10 w-10"
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
            aria-pressed={viewMode === "map"}
            aria-label={tc("mapView")}
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10"
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
      <div className="flex-1 flex min-h-0">
        {viewMode === "map" ? (
          <div className="flex-1 p-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                {tc("loading")}
              </div>
            ) : (
              <MapView items={filtered} selectedId={selectedItemId} onSelectedIdChange={setSelectedItemId} />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {loading && <SkeletonGrid cols={4} count={8} />}
            {!loading && filtered.length === 0 && (
              <p className="text-muted-foreground">{t("noResults")}</p>
            )}
            {!loading && filtered.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginated.map((item) => {
                    const meta = TYPE_META[item.type]
                    const Icon = meta.icon
                    const typeLabel =
                      item.type === "travel" ? t("travelRequests") :
                      item.type === "transport" ? t("transportOffers") :
                      t("housingOffers")
                    return (
                      <Card
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => selectOnMap(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            selectOnMap(item.id)
                          }
                        }}
                        className="h-full cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <CardContent className="flex h-full flex-col gap-3 p-5">
                          <div className="flex items-center gap-2.5">
                            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", meta.iconBgClass)}>
                              <Icon className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <Badge variant="outline" className={meta.badgeClass}>
                              {typeLabel}
                            </Badge>
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold leading-snug text-foreground">
                              {item.description}
                            </p>
                            {item.notes && (
                              <p className="line-clamp-2 text-xs text-muted-foreground">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-1 pt-1 text-xs font-medium text-primary">
                            <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
                            {t("viewOnMap")}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                <NumberedPagination
                  currentPage={listCurrentPage}
                  totalPages={listTotalPages}
                  onPageChange={setListPage}
                  className="mt-6"
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
