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
import { getSupabase, TABLES } from "@/lib/supabase"
import { toast } from "sonner"
import { useEstados } from "@/lib/estados"

type FormData = {
  state: string
  municipality: string
  city: string
  address: string
  capacity: string
  max_stay_days: string
  accepts_children: boolean
  accepts_adults: boolean
  accepts_families: boolean
  has_furniture: boolean
  has_kitchen: boolean
  has_bathroom: boolean
  notes: string
}

export function HousingOfferForm() {
  const t = useTranslations("housingOffer")
  const tc = useTranslations("common")

  const [form, setForm] = useState<FormData>({
    state: "",
    municipality: "",
    city: "",
    address: "",
    capacity: "",
    max_stay_days: "",
    accepts_children: false,
    accepts_adults: false,
    accepts_families: false,
    has_furniture: false,
    has_kitchen: false,
    has_bathroom: false,
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const { estados, loading: estadosLoading } = useEstados()

  const selectedEstado = estados.find((e) => e.name === form.state)

  const update = (field: keyof FormData, value: string | boolean | null) =>
    setForm((prev) => ({ ...prev, [field]: value ?? "" }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = getSupabase()

    if (!form.capacity || !form.max_stay_days) {
      toast.error(tc("error"), { description: tc("errorRequired") })
      return
    }

    setSubmitting(true)
    try {
      const data: Record<string, unknown> = {
        state: form.state,
        municipality: form.municipality,
        city: form.city,
        capacity: Number(form.capacity),
        max_stay_days: Number(form.max_stay_days),
        status: "open",
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) data.user = user.id

      if (form.address) data.address = form.address
      data.accepts_children = form.accepts_children
      data.accepts_adults = form.accepts_adults
      data.accepts_families = form.accepts_families
      data.has_furniture = form.has_furniture
      data.has_kitchen = form.has_kitchen
      data.has_bathroom = form.has_bathroom
      if (form.notes) data.notes = form.notes

      if (user) {
        const { error } = await supabase.from("housing_offers").insert(data).select().single()
        if (error) throw error
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "housing_offer", data }),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || tc("error"))
        }
      }

      toast.success(t("success"))
      setForm({
        state: "",
        municipality: "",
        city: "",
        address: "",
        capacity: "",
        max_stay_days: "",
        accepts_children: false,
        accepts_adults: false,
        accepts_families: false,
        has_furniture: false,
        has_kitchen: false,
        has_bathroom: false,
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
  const amenities = [
    { key: "accepts_children", label: "Acepta niños" },
    { key: "accepts_adults", label: "Acepta adultos" },
    { key: "accepts_families", label: "Acepta familias" },
    { key: "has_furniture", label: "Tiene muebles" },
    { key: "has_kitchen", label: "Tiene cocina" },
    { key: "has_bathroom", label: "Tiene baño" },
  ] as const

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Location */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t("state")}</Label>
            <Select
              value={form.state}
              onValueChange={(v) => {
                update("state", v)
                update("municipality", "")
                update("city", "")
              }}
            >
              <SelectTrigger><SelectValue placeholder={t("state")} /></SelectTrigger>
              <SelectContent>
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
          <div className="space-y-2">
            <Label>{t("municipality")}</Label>
            <Select
              value={form.municipality}
              onValueChange={(v) => {
                update("municipality", v)
                update("city", "")
              }}
              disabled={!selectedEstado}
            >
              <SelectTrigger><SelectValue placeholder={t("municipality")} /></SelectTrigger>
              <SelectContent>
                {selectedEstado?.municipios.map((m) => (
                  <SelectItem key={m.municipio} value={m.municipio}>{m.municipio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("city")}</Label>
            <Select
              value={form.city}
              onValueChange={(v) => update("city", v)}
              disabled={!selectedEstado}
            >
              <SelectTrigger><SelectValue placeholder={t("city")} /></SelectTrigger>
              <SelectContent>
                {selectedEstado?.municipios
                  .find((m) => m.municipio === form.municipality)
                  ?.ciudades.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>{t("address")}</Label>
          <Input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder={t("address")}
            className={inputClass}
          />
        </div>
      </div>

      {/* Capacity & stay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-2">
          <Label>{t("maxStayDays")}</Label>
          <Input
            type="number"
            min={1}
            value={form.max_stay_days}
            onChange={(e) => update("max_stay_days", e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Accepts */}
      <div className="space-y-3">
        <Label>¿A quién aceptas?</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={form.accepts_children ? "default" : "outline"}
            onClick={() => update("accepts_children", !form.accepts_children)}
          >
            {t("acceptsChildren")}
          </Button>
          <Button
            type="button"
            variant={form.accepts_adults ? "default" : "outline"}
            onClick={() => update("accepts_adults", !form.accepts_adults)}
          >
            {t("acceptsAdults")}
          </Button>
          <Button
            type="button"
            variant={form.accepts_families ? "default" : "outline"}
            onClick={() => update("accepts_families", !form.accepts_families)}
          >
            {t("acceptsFamilies")}
          </Button>
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>Servicios del lugar</Label>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <Button
              key={a.key}
              type="button"
              variant={form[a.key] ? "default" : "outline"}
              onClick={() => update(a.key, !form[a.key])}
            >
              {a.label}
            </Button>
          ))}
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
