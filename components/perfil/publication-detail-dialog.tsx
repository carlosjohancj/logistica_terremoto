"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ArrowRight, Home, Package, Truck, MapPin, Calendar, Phone, Fuel, Users } from "lucide-react"
import { StatusBadge } from "./status-badge"
import {
  SUPPLY_CATEGORY_ICONS,
  SUPPLY_CATEGORY_LABELS,
  SUPPLY_CONDITION_LABELS,
  HOUSING_DESTRUCTION_LABELS,
  VEHICLE_TYPE_LABELS,
} from "./supply-meta"
import type { Publication } from "./publication-types"

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base">{value}</p>
    </div>
  )
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return null
  return new Date(value).toLocaleDateString()
}

function TravelRequestDetail({ data }: { data: Publication["data"] }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 shrink-0 text-primary" />
          <DialogTitle className="text-xl font-bold">
            {(data.origin_city as string) || (data.origin_state as string)}
            {" "}
            <ArrowRight className="inline h-4 w-4 text-muted-foreground" />
            {" "}
            {(data.destination_city as string) || "Sin destino"}
          </DialogTitle>
        </div>
        <DialogDescription className="flex items-center gap-2">
          <StatusBadge status={data.status} />
          {formatDate(data.created_at) && (
            <span className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" /> Publicado el {formatDate(data.created_at)}
            </span>
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Personas a movilizar" value={data.people_to_move as number} />
        <Field label="Personas a hospedar" value={data.people_to_house as number} />
        <Field label="Adultos" value={data.adults_count as number} />
        <Field label="Niños" value={data.children_count as number} />
        <Field
          label="Estado de la vivienda"
          value={HOUSING_DESTRUCTION_LABELS[data.housing_destruction as string] ?? (data.housing_destruction as string)}
        />
        <Field label="Tipo de registro" value={data.registrant_type === "damnificado" ? "Soy parte del grupo" : "Registrando a otros"} />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Notas</p>
        <p className="text-base text-muted-foreground whitespace-pre-line">{(data.notes as string) || "Sin notas adicionales."}</p>
      </div>
    </>
  )
}

function TransportOfferDetail({ data }: { data: Publication["data"] }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 shrink-0 text-primary" />
          <DialogTitle className="text-xl font-bold capitalize">
            {VEHICLE_TYPE_LABELS[data.vehicle_type as string] ?? (data.vehicle_type as string)}
          </DialogTitle>
        </div>
        <DialogDescription className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          <span className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            {(data.origin_city as string) || (data.origin_state as string)}
            <ArrowRight className="h-3 w-3" />
            {(data.destination_city as string) || (data.destination_state as string) || "Sin destino"}
          </span>
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Capacidad" value={`${data.capacity as number} personas`} />
        <Field label="Fecha flexible" value={data.flexible_date ? "Sí" : "No"} />
        <Field label="Disponible desde" value={formatDate(data.available_from)} />
        <Field label="Disponible hasta" value={formatDate(data.available_until)} />
        <Field label="Acepta pasajeros" value={data.accepts_passengers ? "Sí" : "No"} />
        <Field label="Acepta carga" value={data.accepts_cargo ? "Sí" : "No"} />
        {Boolean(data.needs_gas_donation) && (
          <Field
            label="Donación de gasolina"
            value={
              <span className="flex items-center gap-1">
                <Fuel className="h-3.5 w-3.5" />
                {data.gas_donation_amount ? `~$${data.gas_donation_amount}` : "Solicitada"}
              </span>
            }
          />
        )}
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Notas</p>
        <p className="text-base text-muted-foreground whitespace-pre-line">{(data.notes as string) || "Sin notas adicionales."}</p>
      </div>
    </>
  )
}

function HousingOfferDetail({ data }: { data: Publication["data"] }) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 shrink-0 text-primary" />
          <DialogTitle className="text-xl font-bold">
            {(data.city as string) || "Ciudad"}, {data.state as string}
          </DialogTitle>
        </div>
        <DialogDescription className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          {(data.address as string) && (
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" /> {data.address as string}
            </span>
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Capacidad" value={`${data.capacity as number} personas`} />
        <Field label="Máximo de días" value={data.max_stay_days as number} />
        <Field label="Acepta niños" value={data.accepts_children ? "Sí" : "No"} />
        <Field label="Acepta adultos" value={data.accepts_adults ? "Sí" : "No"} />
        <Field label="Acepta familias" value={data.accepts_families ? "Sí" : "No"} />
        <Field label="Tiene muebles" value={data.has_furniture ? "Sí" : "No"} />
        <Field label="Tiene cocina" value={data.has_kitchen ? "Sí" : "No"} />
        <Field label="Tiene baño" value={data.has_bathroom ? "Sí" : "No"} />
      </div>

      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Notas</p>
        <p className="text-base text-muted-foreground whitespace-pre-line">{(data.notes as string) || "Sin notas adicionales."}</p>
      </div>
    </>
  )
}

function SupplyDetail({ data }: { data: Publication["data"] }) {
  const category = data.category as string
  const CategoryIcon = SUPPLY_CATEGORY_ICONS[category] ?? Package
  const isOffer = data.type === "offer"

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <CategoryIcon className="h-5 w-5 shrink-0 text-primary" />
          <DialogTitle className="text-xl font-bold">{data.title as string}</DialogTitle>
        </div>
        <DialogDescription className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          <span
            className={
              "rounded-full border px-2 py-0.5 text-xs font-medium " +
              (isOffer ? "border-blue-200 bg-blue-50 text-blue-700" : "border-orange-200 bg-orange-50 text-orange-700")
            }
          >
            {isOffer ? "Ofrezco" : "Necesito"}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs">
            {SUPPLY_CATEGORY_LABELS[category] ?? category}
          </span>
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cantidad" value={data.quantity as number} />
        <Field label="Condición" value={SUPPLY_CONDITION_LABELS[data.condition as string] ?? (data.condition as string)} />
        <Field
          label="Ubicación"
          value={[data.city, data.municipality, data.state].filter(Boolean).join(", ") || undefined}
        />
        <Field label="Dirección" value={data.address as string} />
        <Field label="Necesita transporte" value={data.needs_transport ? "Sí" : "No"} />
      </div>

      {((data.contact_name as string) || (data.contact_phone as string)) && (
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Contacto</p>
          <p className="flex items-center gap-1.5 text-base">
            <Users className="h-3.5 w-3.5" />
            {(data.contact_name as string) || "Sin nombre"}
          </p>
          {(data.contact_phone as string) && (
            <p className="flex items-center gap-1.5 text-base text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              {data.contact_phone as string}
            </p>
          )}
        </div>
      )}

      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-1">Descripción</p>
        <p className="text-base text-muted-foreground whitespace-pre-line">{(data.description as string) || "Sin descripción."}</p>
      </div>
    </>
  )
}

export function PublicationDetailDialog({
  publication,
  onOpenChange,
}: {
  publication: Publication | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={!!publication} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto space-y-5">
        {publication?.kind === "travel_request" && <TravelRequestDetail data={publication.data} />}
        {publication?.kind === "transport_offer" && <TransportOfferDetail data={publication.data} />}
        {publication?.kind === "housing_offer" && <HousingOfferDetail data={publication.data} />}
        {publication?.kind === "supply" && <SupplyDetail data={publication.data} />}
      </DialogContent>
    </Dialog>
  )
}
