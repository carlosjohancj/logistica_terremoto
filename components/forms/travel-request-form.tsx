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
import type RecordModel from "pocketbase"

type FormData = {
  has_destination: boolean | null
  origin_state: string
  origin_municipality: string
  origin_city: string
  destination_state: string
  destination_municipality: string
  destination_city: string
  people_to_move: string
  people_to_house: string
  children_count: string
  adults_count: string
  housing_destruction: string
  registrant_type: string
  registrant_relation: string
  notes: string
}

export function TravelRequestForm() {
  const t = useTranslations("travelRequest")
  const tc = useTranslations("common")

  const [form, setForm] = useState<FormData>({
    has_destination: null,
    origin_state: "",
    origin_municipality: "",
    origin_city: "",
    destination_state: "",
    destination_municipality: "",
    destination_city: "",
    people_to_move: "",
    people_to_house: "",
    children_count: "",
    adults_count: "",
    housing_destruction: "",
    registrant_type: "",
    registrant_relation: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const selectedOrigin = estados.find((e) => e.estado === form.origin_state)
  const selectedDest = estados.find((e) => e.estado === form.destination_state)

  const update = (field: keyof FormData, value: string | boolean | null) =>
    setForm((prev) => ({ ...prev, [field]: value ?? "" }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pb = getPB()

    if (!form.housing_destruction || !form.registrant_type) {
      toast.error(tc("error"), { description: tc("errorRequired") })
      return
    }

    setSubmitting(true)
    try {
      const data: Record<string, unknown> = {
        origin_state: form.origin_state,
        origin_municipality: form.origin_municipality,
        origin_city: form.origin_city,
        people_to_move: Number(form.people_to_move),
        housing_destruction: form.housing_destruction,
        registrant_type: form.registrant_type,
        status: "open",
      }

      if (pb.authStore.model) {
        data.user = pb.authStore.model.id
      }

      if (form.has_destination) {
        data.has_destination = true
        data.destination_state = form.destination_state
        data.destination_municipality = form.destination_municipality
        data.destination_city = form.destination_city
      }

      if (form.people_to_house) data.people_to_house = Number(form.people_to_house)
      if (form.children_count) data.children_count = Number(form.children_count)
      if (form.adults_count) data.adults_count = Number(form.adults_count)
      if (form.registrant_relation) data.registrant_relation = form.registrant_relation
      if (form.notes) data.notes = form.notes

      if (pb.authStore.model) {
        await pb.collection(COLLECTIONS.TRAVEL_REQUESTS).create(data)
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "travel_request", data }),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || tc("error"))
        }
      }

      toast.success(t("success"))
      setForm({
        has_destination: null,
        origin_state: "",
        origin_municipality: "",
        origin_city: "",
        destination_state: "",
        destination_municipality: "",
        destination_city: "",
        people_to_move: "",
        people_to_house: "",
        children_count: "",
        adults_count: "",
        housing_destruction: "",
        registrant_type: "",
        registrant_relation: "",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Registrant type */}
      <div className="space-y-3">
        <Label>{t("registrantType")}</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={form.registrant_type === "damnificado" ? "default" : "outline"}
            onClick={() => update("registrant_type", "damnificado")}
          >
            {t("registrantDamnificado")}
          </Button>
          <Button
            type="button"
            variant={form.registrant_type === "colaborador" ? "default" : "outline"}
            onClick={() => update("registrant_type", "colaborador")}
          >
            {t("registrantColaborador")}
          </Button>
        </div>
      </div>

      {form.registrant_type === "colaborador" && (
        <div className="space-y-2">
          <Label>{t("registrantRelation")}</Label>
          <Input
            value={form.registrant_relation}
            onChange={(e) => update("registrant_relation", e.target.value)}
            placeholder={t("registrantRelation")}
            className={inputClass}
          />
        </div>
      )}

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
              disabled={!selectedOrigin}
            >
              <SelectTrigger><SelectValue placeholder={t("originMunicipality")} /></SelectTrigger>
              <SelectContent>
                {selectedOrigin?.municipios.map((m) => (
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
              disabled={!selectedOrigin}
            >
              <SelectTrigger><SelectValue placeholder={t("originCity")} /></SelectTrigger>
              <SelectContent>
                {selectedOrigin?.municipios
                  .find((m) => m.municipio === form.origin_municipality)
                  ?.ciudades.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Has destination */}
      <div className="space-y-3">
        <Label>{t("hasDestination")}</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={form.has_destination === true ? "default" : "outline"}
            onClick={() => update("has_destination", true)}
          >
            {t("yes")}
          </Button>
          <Button
            type="button"
            variant={form.has_destination === false ? "default" : "outline"}
            onClick={() => update("has_destination", false)}
          >
            {t("no")}
          </Button>
        </div>
      </div>

      {form.has_destination === true && (
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
                disabled={!selectedDest}
              >
                <SelectTrigger><SelectValue placeholder={t("destinationMunicipality")} /></SelectTrigger>
                <SelectContent>
                  {selectedDest?.municipios.map((m) => (
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
                disabled={!selectedDest}
              >
                <SelectTrigger><SelectValue placeholder={t("destinationCity")} /></SelectTrigger>
                <SelectContent>
                  {selectedDest?.municipios
                    .find((m) => m.municipio === form.destination_municipality)
                    ?.ciudades.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* People */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("peopleToMove")}</Label>
            <Input
              type="number"
              min={1}
              value={form.people_to_move}
              onChange={(e) => update("people_to_move", e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("peopleToHouse")}</Label>
            <Input
              type="number"
              min={0}
              value={form.people_to_house}
              onChange={(e) => update("people_to_house", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("childrenCount")}</Label>
            <Input
              type="number"
              min={0}
              value={form.children_count}
              onChange={(e) => update("children_count", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("adultsCount")}</Label>
            <Input
              type="number"
              min={0}
              value={form.adults_count}
              onChange={(e) => update("adults_count", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Housing destruction */}
      <div className="space-y-2">
        <Label>{t("housingDestruction")}</Label>
        <Select value={form.housing_destruction} onValueChange={(v) => update("housing_destruction", v)}>
          <SelectTrigger><SelectValue placeholder={t("housingDestruction")} /></SelectTrigger>
          <SelectContent>
            {["total", "grave", "se_puede_reparar", "prestada_emergencia"].map((opt) => (
              <SelectItem key={opt} value={opt}>{t(opt)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
