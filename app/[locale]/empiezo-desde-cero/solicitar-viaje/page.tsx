"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Truck, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { getSupabase, TABLES } from "@/lib/supabase"
import { useEstados } from "@/lib/estados"
import { FormField } from "@/components/forms/shared/form-field"

export default function SolicitarViajeAvanzadoPage() {
  const tc = useTranslations("common")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const { estados, loading: estadosLoading } = useEstados()

  const [sending, setSending] = useState(false)

  const [form, setForm] = useState({
    name: "",
    phone: "",
    originState: "",
    originCity: "",
    destState: "",
    destCity: "",
    peopleCount: "1",
    hasChildren: false,
    hasElderly: false,
    hasDisabled: false,
    healthNeeds: "",
    notes: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Debes iniciar sesión para solicitar un viaje")
        return
      }

      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "travel_request",
          data: {
            origin_state: form.originState,
            origin_city: form.originCity,
            destination_state: form.destState,
            destination_city: form.destCity,
            has_destination: !!form.destState,
            people_to_move: Number(form.peopleCount),
            notes: [form.notes, form.healthNeeds ? `Salud: ${form.healthNeeds}` : ""]
              .filter(Boolean).join(" | "),
          },
        }),
      })

      if (!res.ok) throw new Error("Error al enviar")
      toast.success("Solicitud enviada. Recibirás notificaciones cuando un transportista la tome.")
      setForm({
        name: "", phone: "", originState: "", originCity: "",
        destState: "", destCity: "", peopleCount: "1",
        hasChildren: false, hasElderly: false, hasDisabled: false,
        healthNeeds: "", notes: "",
      })
    } catch {
      toast.error(tc("error"))
    } finally {
      setSending(false)
    }
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  const origenCities = form.originState
    ? estados.find((e) => e.name === form.originState)?.municipios
        .flatMap((m) => m.ciudades)
        .filter(Boolean)
        .sort() ?? []
    : []
  const destCities = form.destState
    ? estados.find((e) => e.name === form.destState)?.municipios
        .flatMap((m) => m.ciudades)
        .filter(Boolean)
        .sort() ?? []
    : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href={`/${locale}/empiezo-desde-cero`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Empiezo Desde Cero
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Truck className="h-8 w-8 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold">Solicitar Viaje</h1>
          <p className="text-sm text-muted-foreground">Cuéntanos tu ruta y necesidades para que un transportista pueda ayudarte</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nombre (opcional)">
                {(field) => (
                  <Input {...field} autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Tu nombre" />
                )}
              </FormField>
              <FormField label="Teléfono (opcional)">
                {(field) => (
                  <Input {...field} type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+58..." />
                )}
              </FormField>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-sm mb-3">Origen del viaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Estado de origen" required>
                  {(field) => (
                    <Select value={form.originState} onValueChange={(v) => { update("originState", v ?? ""); update("originCity", "") }}>
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((e) => (
                          <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
                <FormField label="Ciudad de origen">
                  {(field) => (
                    <Select value={form.originCity} onValueChange={(v) => update("originCity", v ?? "")}>
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder={form.originState ? "Selecciona una ciudad" : "Primero elige estado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {origenCities.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-sm mb-3">Destino</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Estado de destino">
                  {(field) => (
                    <Select value={form.destState} onValueChange={(v) => { update("destState", v ?? ""); update("destCity", "") }}>
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((e) => (
                          <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
                <FormField label="Ciudad de destino">
                  {(field) => (
                    <Select value={form.destCity} onValueChange={(v) => update("destCity", v ?? "")}>
                      <SelectTrigger id={field.id}>
                        <SelectValue placeholder={form.destState ? "Selecciona una ciudad" : "Primero elige estado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {destCities.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </FormField>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-sm mb-3">Pasajeros</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <FormField label="Cantidad" required>
                  {(field) => (
                    <Input {...field} type="number" min={1} value={form.peopleCount} onChange={(e) => update("peopleCount", e.target.value)} />
                  )}
                </FormField>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.hasChildren} onChange={(e) => update("hasChildren", e.target.checked)} className="accent-primary" />
                  Incluye niños
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.hasElderly} onChange={(e) => update("hasElderly", e.target.checked)} className="accent-primary" />
                  Adultos mayores
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.hasDisabled} onChange={(e) => update("hasDisabled", e.target.checked)} className="accent-primary" />
                  Personas con discapacidad
                </label>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <FormField label="Necesidades de salud">
                {(field) => (
                  <Textarea
                    {...field}
                    rows={2}
                    value={form.healthNeeds}
                    onChange={(e) => update("healthNeeds", e.target.value)}
                    placeholder="¿Alguien necesita atención médica durante el viaje?"
                  />
                )}
              </FormField>
              <FormField label="Notas adicionales">
                {(field) => (
                  <Textarea
                    {...field}
                    rows={2}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Cualquier información relevante para el transportista..."
                  />
                )}
              </FormField>
            </div>

            <Button type="submit" className="w-full rounded-full gap-2" disabled={sending} aria-busy={sending}>
              {sending ? "Enviando..." : "Solicitar Viaje"}
              <Send className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
