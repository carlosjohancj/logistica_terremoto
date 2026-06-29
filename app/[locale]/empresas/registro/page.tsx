"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"
import { getPB, COLLECTIONS } from "@/lib/pocketbase"
import estados from "@/data/venezuela.json"

export default function RegistroEmpresaPage() {
  const t = useTranslations("companies")
  const tc = useTranslations("common")

  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    rif: "",
    sector: "",
    state: "",
    municipality: "",
    city: "",
    address: "",
    description: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    website: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const selectedEstado = estados.find((e) => e.estado === form.state)

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const pb = getPB()
      const data: Record<string, unknown> = {
        ...form,
        verified: false,
      }
      if (pb.authStore.model) {
        data.user = pb.authStore.model.id
      }
      await pb.collection(COLLECTIONS.COMPANIES).create(data)
      toast.success(t("success"))
      router.push("/empleos")
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("register")}</CardTitle>
          <CardDescription>{t("registerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">{t("companyInfo")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("name")}</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>RIF</Label>
                  <Input value={form.rif} onChange={(e) => update("rif", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("sector")}</Label>
                <Select value={form.sector} onValueChange={(v) => update("sector", v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("sector")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnología</SelectItem>
                    <SelectItem value="salud">Salud</SelectItem>
                    <SelectItem value="educacion">Educación</SelectItem>
                    <SelectItem value="construccion">Construcción</SelectItem>
                    <SelectItem value="comercio">Comercio</SelectItem>
                    <SelectItem value="transporte">Transporte</SelectItem>
                    <SelectItem value="alimentacion">Alimentación</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("description")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("location")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("state")}</Label>
                  <Select value={form.state} onValueChange={(v) => {
                    update("state", v ?? "")
                    update("municipality", "")
                    update("city", "")
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("state")} />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((e) => (
                        <SelectItem key={e.estado} value={e.estado}>{e.estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("municipality")}</Label>
                  <Select
                    value={form.municipality}
                    onValueChange={(v) => {
                      update("municipality", v ?? "")
                      update("city", "")
                    }}
                    disabled={!selectedEstado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("municipality")} />
                    </SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue placeholder={t("city")} />
                    </SelectTrigger>
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
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t("contact")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("contactName")}</Label>
                  <Input value={form.contact_name} onChange={(e) => update("contact_name", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("contactPhone")}</Label>
                  <Input value={form.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("contactEmail")}</Label>
                  <Input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("website")}</Label>
                  <Input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? tc("loading") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
