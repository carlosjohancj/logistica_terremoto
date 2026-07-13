"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, ArrowRight, Users, Phone, AlertTriangle } from "lucide-react"
import type { CapacityInfo, TransportRequest } from "@/lib/transportista/request-helpers"

type Profile = { name: string; phone: string }

type Props = {
  request: TransportRequest | null
  profile?: Profile
  capacityInfo: CapacityInfo | null
  onCancel: () => void
  onConfirm: () => void
}

export function RequestConfirmDialog({ request, profile, capacityInfo, onCancel, onConfirm }: Props) {
  const t = useTranslations("requestManager")
  const tc = useTranslations("common")

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        {request && (
          <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{request.origin_city || request.origin_state}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{request.destination_city || request.destination_state}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              {request.people_to_move} {request.people_to_move === 1 ? t("personSingular") : t("personPlural")} ·{" "}
              {request.notes || t("noNotes")}
            </div>
            {capacityInfo && capacityInfo.exceeded && (
              <div className="flex items-center gap-1.5 text-destructive text-xs">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {t("vehicleCapacityWarning")}: {capacityInfo.capacity} {t("peopleUnit")} — {t("requestAsks")}{" "}
                {request.people_to_move}
              </div>
            )}
            {profile && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {profile.name} — {profile.phone || t("noPhone")}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {tc("cancel")}
          </Button>
          <Button onClick={onConfirm}>{t("confirmTake")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
