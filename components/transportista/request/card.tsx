"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Phone, AlertTriangle, Package } from "lucide-react"
import {
  getCapacityInfo,
  getCargoTypes,
  type TransportistaOffer,
  type TransportRequest,
} from "@/lib/transportista/request-helpers"

type Profile = { name: string; phone: string }

type Props = {
  request: TransportRequest
  profile?: Profile
  transportistaOffers?: TransportistaOffer[]
  onTake: (request: TransportRequest) => void
}

export function RequestCard({ request, profile, transportistaOffers, onTake }: Props) {
  const t = useTranslations("requestManager")

  const capacityInfo = getCapacityInfo(request, transportistaOffers)
  const cargoTypes = getCargoTypes(request)
  const cargoLabel = cargoTypes
    .map((type) => (type === "cargo" ? t("cargoType") : t("passengersType")))
    .join(" + ")

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <span className="truncate">{request.origin_city || request.origin_state}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{request.destination_city || request.destination_state}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="w-fit gap-1 font-normal">
            <Users className="h-3 w-3" />
            {request.people_to_move} {t("peopleUnit")}
          </Badge>

          {cargoLabel && (
            <Badge variant="secondary" className="w-fit gap-1 font-normal">
              <Package className="h-3 w-3" />
              {cargoLabel}
            </Badge>
          )}

          {capacityInfo && capacityInfo.exceeded && (
            <Badge variant="destructive" className="w-fit gap-1 font-normal text-xs">
              <AlertTriangle className="h-3 w-3" />
              {t("capacityLabel")}: {capacityInfo.capacity}
            </Badge>
          )}
          {capacityInfo && !capacityInfo.exceeded && (
            <Badge variant="outline" className="w-fit gap-1 font-normal text-xs text-muted-foreground">
              {t("capacityLabel")} {capacityInfo.capacity} {t("peopleUnit")}
            </Badge>
          )}
        </div>

        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {request.notes || t("noNotes")}
        </p>

        {profile && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary">
              {profile.name?.charAt(0) || "?"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{profile.name}</p>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" />
                {profile.phone || t("noPhone")}
              </p>
            </div>
          </div>
        )}

        <Button className="mt-1 w-full" onClick={() => onTake(request)}>
          {t("takeRoute")}
        </Button>
      </CardContent>
    </Card>
  )
}
