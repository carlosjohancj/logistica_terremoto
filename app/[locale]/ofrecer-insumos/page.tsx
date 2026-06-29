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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import { toast } from "sonner"
import { useEstados } from "@/lib/estados"

const CATEGORIES = ["camas", "comida", "ropa", "medicinas", "agua", "higiene", "electronico", "materiales", "muebles", "otros"] as const
const CONDITIONS = ["nuevo", "usado_bueno", "usado_regular", "no_aplica"] as const

export default function OfrecerInsumosPage() {
  const t = useTranslations("supplies")
  const tc = useTranslations("common")

  const [supplyType, setSupplyType] = useState<"offer" | "request" | null>(null)
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    condition: "",
    state: "",
    municipality: "",
    city: "",
    address: "",
    contact_name: "",
    contact_phone: "",
    needs_transport: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const { estados } = useEstados()

  const selectedEstado = estados.find((e) => e.name === form.state)
  const update = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supplyType || !form.title || !form.category || !form.state) {
      toast.error(tc("error"), { description: tc("errorRequired") })
      return
    }
    setSubmitting(true)
    try {
      const pb = getPB()
      const data: Record<string, unknown> = {
        type: supplyType,
        title: form.title,
        category: form.category,
        state: form.state,
        contact_name: form.contact_name,
        status: "open",
      }
      if (pb.authStore.model) data.user = pb.authStore.model.id
      if (form.description) data.description = form.description
      if (form.quantity) data.quantity = Number(form.quantity)
      if (form.condition) data.condition = form.condition
      if (form.municipality) data.municipality = form.municipality
      if (form.city) data.city = form.city
      if (form.address) data.address = form.address
      if (form.contact_phone) data.contact_phone = form.contact_phone
      data.needs_transport = form.needs_transport

      if (pb.authStore.model) {
        await pb.collection(COLLECTIONS.SUPPLIES).create(data)
      } else {
        const res = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formType: "supply", data }),
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || tc("error"))
        }
      }

      toast.success(t("success"))
      setSupplyType(null)
      setForm({
        title: "", description: "", category: "", quantity: "",
        condition: "", state: "", municipality: "", city: "",
        address: "", contact_name: "", contact_phone: "", needs_transport: false,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!supplyType) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => setSupplyType("offer")}
            >
              {t("iOffer")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setSupplyType("request")}
            >
              {t("iNeed")}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {supplyType === "offer" ? t("iOffer") : t("iNeed")}
          </CardTitle>
          <CardDescription>{t("fillForm")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>{t("title")}</Label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder={t("titlePlaceholder")}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("category")}</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder={t("category")} /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("quantity")}</Label>
                <Input
                  type="number" min={0}
                  value={form.quantity}
                  onChange={(e) => update("quantity", e.target.value)}
                />
              </div>
            </div>

            {supplyType === "offer" && (
              <div className="space-y-2">
                <Label>{t("condition")}</Label>
                <Select value={form.condition} onValueChange={(v) => update("condition", v ?? "")}>
                  <SelectTrigger><SelectValue placeholder={t("condition")} /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>{t(c)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("location")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("state")}</Label>
                  <Select
                    value={form.state}
                    onValueChange={(v) => {
                      update("state", v ?? "")
                      update("municipality", "")
                      update("city", "")
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder={t("state")} /></SelectTrigger>
                    <SelectContent>
                      {estados.map((e) => (
                        <SelectItem key={e.name} value={e.name}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("municipality")}</Label>
                  <Select
                    value={form.municipality}
                    onValueChange={(v) => { update("municipality", v ?? ""); update("city", "") }}
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
                    onValueChange={(v) => update("city", v ?? "")}
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
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("contact")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("contactName")}</Label>
                  <Input
                    value={form.contact_name}
                    onChange={(e) => update("contact_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("contactPhone")}</Label>
                  <Input
                    value={form.contact_phone}
                    onChange={(e) => update("contact_phone", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {supplyType === "offer" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needs_transport"
                  checked={form.needs_transport}
                  onChange={(e) => update("needs_transport", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="needs_transport">{t("needsTransport")}</Label>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={submitting}>
              {submitting ? tc("loading") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
