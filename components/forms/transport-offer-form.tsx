"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { toast } from "sonner"
import estados from "@/data/venezuela.json"

type FormData = {
  vehicle_type: string
  capacity: string
  origin_state: string
  origin_municipality: string
  origin_city: string
  destination_state: string
  destination_municipality: string
  destination_city: string
  available_from: string
  available_until: string
  flexible_date: boolean
  needs_gas_donation: boolean
  gas_donation_amount: string
  accepts_passengers: boolean
  accepts_cargo: boolean
  notes: string
}

export function TransportOfferForm() {
  const t = useTranslations("transportOffer")
  const tc = useTranslations("common")

  const [form, setForm] = useState<FormData>({
    vehicle_type: "",
    capacity: "",
    origin_state: "",
    origin_municipality: "",
    origin_city: "",
    destination_state: "",
    destination_municipality: "",
    destination_city: "",
    available_from: "",
    available_until: "",
    flexible_date: false,
    needs_gas_donation: false,
    gas_donation_amount: "",
    accepts_passengers: false,
    accepts_cargo: false,
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const originEstado = estados.find((e) => e.estado === form.origin_state)
  const destEstado = estados.find((e) => e.estado === form.destination_state)

  const update = (field: keyof FormData, value: string | boolean | null) =>
    setForm((prev) => ({ ...prev, [field]: value ?? "" }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pb = getPB()

    if (!form.vehicle_type || !form.capacity) {
      toast.error(tc("error"), { description: tc("errorRequired") })
      return
    }

    setSubmitting(true)
    try {
      const data: Record<string, unknown> = {
        vehicle_type: form.vehicle_type,
        capacity: Number(form.capacity),
        origin_state: form.origin_state,
        origin_municipality: form.origin_municipality,
        origin_city: form.origin_city,
        destination_state: form.destination_state,
        destination_municipality: form.destination_municipality,
        destination_city: form.destination_city,
        status: "open",
      }

      if (pb.authStore.model) {
        data.user = pb.authStore.model.id
      }

      if (form.available_from) data.available_from = new Date(form.available_from).toISOString()
      if (form.available_until) data.available_until = new Date(form.available_until).toISOString()
      data.flexible_date = form.flexible_date
      data.needs_gas_donation = form.needs_gas_donation
      if (form.gas_donation_amount) data.gas_donation_amount = Number(form.gas_donation_amount)
      data.accepts_passengers = form.accepts_passengers
      data.accepts_cargo = form.accepts_cargo
      if (form.notes) data.notes = form.notes

      if (pb.authStore.model) {
        await pb.collection(COLLECTIONS.TRANSPORT_OFFERS).create(data)
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "transport_offer", data }),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || tc("error"))
        }
      }

      toast.success(t("success"))
      setForm({
        vehicle_type: "",
        capacity: "",
        origin_state: "",
        origin_municipality: "",
        origin_city: "",
        destination_state: "",
        destination_municipality: "",
        destination_city: "",
        available_from: "",
        available_until: "",
        flexible_date: false,
        needs_gas_donation: false,
        gas_donation_amount: "",
        accepts_passengers: false,
        accepts_cargo: false,
        notes: "",
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full"
  const vehicleTypes = ["moto", "carro", "camioneta", "camion"] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Vehicle type */}
      <div className="space-y-2">
        <Label>{t("vehicleType")}</Label>
        <div className="flex flex-wrap gap-2">
          {vehicleTypes.map((vt) => (
            <Button
              key={vt}
              type="button"
              variant={form.vehicle_type === vt ? "default" : "outline"}
              onClick={() => update("vehicle_type", vt)}
            >
              {t(vt)}
            </Button>
          ))}
        </div>
      </div>

      {/* Capacity */}
      <div className="space-y-2">
        <Label>{t("capacity")}</Label>
        <Input
          type="number"
          min={1}
          value={form.capacity}
          onChange={(e) => update("capacity", e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* Origin */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t("originState")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("originState")}</Label>
            <Select
              value={form.origin_state}
              onValueChange={(v) => {
                update("origin_state", v)
                update("origin_municipality", "")
                update("origin_city", "")
              }}
            >
              <SelectTrigger><SelectValue placeholder={t("originState")} /></SelectTrigger>
              <SelectContent>
                {estados.map((e) => (
                  <SelectItem key={e.estado} value={e.estado}>{e.estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("originMunicipality")}</Label>
            <Select
              value={form.origin_municipality}
              onValueChange={(v) => {
                update("origin_municipality", v)
                update("origin_city", "")
              }}
              disabled={!originEstado}
            >
              <SelectTrigger><SelectValue placeholder={t("originMunicipality")} /></SelectTrigger>
              <SelectContent>
                {originEstado?.municipios.map((m) => (
                  <SelectItem key={m.municipio} value={m.municipio}>{m.municipio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("originCity")}</Label>
            <Select
              value={form.origin_city}
              onValueChange={(v) => update("origin_city", v)}
              disabled={!originEstado}
            >
              <SelectTrigger><SelectValue placeholder={t("originCity")} /></SelectTrigger>
              <SelectContent>
                {originEstado?.municipios
                  .find((m) => m.municipio === form.origin_municipality)
                  ?.ciudades.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">{t("destinationState")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("destinationState")}</Label>
            <Select
              value={form.destination_state}
              onValueChange={(v) => {
                update("destination_state", v)
                update("destination_municipality", "")
                update("destination_city", "")
              }}
            >
              <SelectTrigger><SelectValue placeholder={t("destinationState")} /></SelectTrigger>
              <SelectContent>
                {estados.map((e) => (
                  <SelectItem key={e.estado} value={e.estado}>{e.estado}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("destinationMunicipality")}</Label>
            <Select
              value={form.destination_municipality}
              onValueChange={(v) => {
                update("destination_municipality", v)
                update("destination_city", "")
              }}
              disabled={!destEstado}
            >
              <SelectTrigger><SelectValue placeholder={t("destinationMunicipality")} /></SelectTrigger>
              <SelectContent>
                {destEstado?.municipios.map((m) => (
                  <SelectItem key={m.municipio} value={m.municipio}>{m.municipio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("destinationCity")}</Label>
            <Select
              value={form.destination_city}
              onValueChange={(v) => update("destination_city", v)}
              disabled={!destEstado}
            >
              <SelectTrigger><SelectValue placeholder={t("destinationCity")} /></SelectTrigger>
              <SelectContent>
                {destEstado?.municipios
                  .find((m) => m.municipio === form.destination_municipality)
                  ?.ciudades.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="flexible_date"
            checked={form.flexible_date}
            onChange={(e) => update("flexible_date", e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="flexible_date">Fecha flexible</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Disponible desde</Label>
            <Input
              type="date"
              value={form.available_from}
              onChange={(e) => update("available_from", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label>Disponible hasta</Label>
            <Input
              type="date"
              value={form.available_until}
              onChange={(e) => update("available_until", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Gas donation */}
      <div className="space-y-3">
        <Label>{t("needsGasDonation")}</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={form.needs_gas_donation ? "default" : "outline"}
            onClick={() => update("needs_gas_donation", true)}
          >
            {t("yes")}
          </Button>
          <Button
            type="button"
            variant={!form.needs_gas_donation ? "default" : "outline"}
            onClick={() => update("needs_gas_donation", false)}
          >
            {t("no")}
          </Button>
        </div>
        {form.needs_gas_donation && (
          <div className="space-y-2">
            <Label>Monto estimado ($)</Label>
            <Input
              type="number"
              min={0}
              value={form.gas_donation_amount}
              onChange={(e) => update("gas_donation_amount", e.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </div>

      {/* Accepts */}
      <div className="space-y-3">
        <Label>¿Qué ofreces transportar?</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={form.accepts_passengers ? "default" : "outline"}
            onClick={() => update("accepts_passengers", !form.accepts_passengers)}
          >
            Pasajeros
          </Button>
          <Button
            type="button"
            variant={form.accepts_cargo ? "default" : "outline"}
            onClick={() => update("accepts_cargo", !form.accepts_cargo)}
          >
            Carga
          </Button>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>{t("notes")}</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitting}>
        {submitting ? tc("loading") : t("submit")}
      </Button>
    </form>
  )
}
