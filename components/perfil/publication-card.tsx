"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Home, Package, ChevronRight } from "lucide-react"
import { StatusBadge } from "./status-badge"
import { SUPPLY_CATEGORY_ICONS, SUPPLY_CATEGORY_LABELS } from "./supply-meta"
import type { Publication } from "./publication-types"

function TravelRequestSummary({ data }: { data: Publication["data"] }) {
  return (
    <>
      <p className="text-base font-bold leading-snug">
        {(data.origin_city as string) || (data.origin_state as string)}{" "}
        <ArrowRight className="inline h-4 w-4 text-muted-foreground" />{" "}
        {(data.destination_city as string) || "Sin destino"}
      </p>
      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        {data.people_to_move as number} pers.
      </span>
      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {(data.notes as string) || "Sin notas adicionales"}
      </p>
    </>
  )
}

function TransportOfferSummary({ data }: { data: Publication["data"] }) {
  return (
    <>
      <p className="text-base font-bold capitalize leading-snug">{data.vehicle_type as string}</p>
      <p className="text-sm leading-snug text-muted-foreground">
        {(data.origin_city as string) || (data.origin_state as string)}{" "}
        <ArrowRight className="inline h-3.5 w-3.5" />{" "}
        {(data.destination_city as string) || (data.destination_state as string)}
      </p>
      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        {data.capacity as number} plazas
      </span>
      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {(data.notes as string) || "Sin notas adicionales"}
      </p>
    </>
  )
}

function HousingOfferSummary({ data }: { data: Publication["data"] }) {
  const perks = [
    data.accepts_children && "niños",
    data.accepts_adults && "adultos",
    data.accepts_families && "familias",
  ].filter(Boolean)

  return (
    <>
      <p className="flex items-start gap-1.5 text-base font-bold leading-snug">
        <Home className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        {(data.city as string) || "Ciudad"}, {data.state as string}
      </p>
      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
        <Users className="h-3 w-3" />
        {data.capacity as number} pers. · {data.max_stay_days as number} días
      </span>
      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {(data.notes as string) || (perks.length > 0 ? `Acepta ${perks.join(", ")}.` : "Sin notas adicionales")}
      </p>
    </>
  )
}

function SupplySummary({ data }: { data: Publication["data"] }) {
  const category = data.category as string
  const CategoryIcon = SUPPLY_CATEGORY_ICONS[category] ?? Package
  const isOffer = data.type === "offer"

  return (
    <>
      <p className="text-base font-bold leading-snug">{data.title as string}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={
            "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium " +
            (isOffer ? "border-blue-200 bg-blue-50 text-blue-700" : "border-orange-200 bg-orange-50 text-orange-700")
          }
        >
          {isOffer ? "Ofrezco" : "Necesito"}
        </span>
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          <CategoryIcon className="h-3 w-3" />
          {SUPPLY_CATEGORY_LABELS[category] ?? category}
        </span>
      </div>
      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {(data.description as string) || "Sin descripción"}
      </p>
    </>
  )
}

export function PublicationCard({
  publication,
  onClick,
}: {
  publication: Publication
  onClick: () => void
}) {
  const { kind, data } = publication

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className="flex cursor-pointer flex-col transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {kind === "travel_request" && <TravelRequestSummary data={data} />}
            {kind === "transport_offer" && <TransportOfferSummary data={data} />}
            {kind === "housing_offer" && <HousingOfferSummary data={data} />}
            {kind === "supply" && <SupplySummary data={data} />}
          </div>
          <StatusBadge status={data.status} className="mt-0.5" />
        </div>

        <div className="mt-auto flex items-center justify-end gap-0.5 pt-1 text-xs font-medium text-primary">
          Ver detalles
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </CardContent>
    </Card>
  )
}
