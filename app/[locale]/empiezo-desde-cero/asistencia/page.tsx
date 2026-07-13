"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, ArrowLeft, Send, Sparkles } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { FormField } from "@/components/shared/form-field"

const TOTAL_STEPS = 4

export default function AsistenciaPage() {
  const tc = useTranslations("common")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  const [step, setStep] = useState(0)
  const [sending, setSending] = useState(false)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const helpGroupId = useId()
  const housingGroupId = useId()

  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    origin: "",
    familyMembers: "",
    deceasedRelatives: false,
    deceasedDetail: "",
    helpNeeded: [] as string[],
    housingStatus: "",
    additionalInfo: "",
  })

  useEffect(() => {
    stepHeadingRef.current?.focus()
  }, [step])

  const helpOptions = [
    { value: "trabajo", label: "Trabajo" },
    { value: "economica", label: "Ayuda económica" },
    { value: "medica", label: "Atención médica" },
    { value: "psicologica", label: "Atención psicológica" },
    { value: "alimentacion", label: "Alimentación" },
    { value: "vivienda", label: "Vivienda" },
    { value: "transporte", label: "Transporte" },
    { value: "legal", label: "Asesoría legal" },
  ]

  const housingOptions = [
    { value: "destruida", label: "Destruida totalmente" },
    { value: "daniada", label: "Dañada parcialmente" },
    { value: "habitable", label: "Habilitable con reparaciones" },
    { value: "intacta", label: "Intacta / sin daños" },
    { value: "desconocido", label: "No sabe / no aplica" },
  ]

  function toggleHelp(value: string) {
    setForm((prev) => ({
      ...prev,
      helpNeeded: prev.helpNeeded.includes(value)
        ? prev.helpNeeded.filter((v) => v !== value)
        : [...prev.helpNeeded, value],
    }))
  }

  async function handleSubmit() {
    setSending(true)
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "asistencia",
          data: form,
        }),
      })
      if (!res.ok) throw new Error("Error al enviar")
      toast.success("Información enviada. Un voluntario se pondrá en contacto contigo.")
      setStep(999)
    } catch {
      toast.error(tc("error"))
    } finally {
      setSending(false)
    }
  }

  if (step === 999) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-xl text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-bold mb-4">¡Información recibida!</h1>
        <p className="text-muted-foreground mb-6">
          Hemos registrado tus datos. Un voluntario de gestión revisará tu caso y te contactará pronto. Mientras tanto, puedes explorar los recursos disponibles.
        </p>
        <Link href={`/${locale}/empiezo-desde-cero`}>
          <Button variant="outline" className="rounded-full">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href={`/${locale}/empiezo-desde-cero`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Empiezo Desde Cero
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Bot className="h-8 w-8 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold">Asistencia con IA</h1>
          <p className="text-sm text-muted-foreground">Cuéntanos tu situación para conectarte con la ayuda adecuada</p>
        </div>
      </div>

      <p className="text-xs font-medium text-muted-foreground mb-6" aria-live="polite">
        Paso {step + 1} de {TOTAL_STEPS}
      </p>

      <Card>
        <CardContent className="p-6 space-y-6">
          {step === 0 && (
            <>
              <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
                Datos personales
              </h2>
              <div className="space-y-4">
                <FormField label="Nombre completo" required>
                  {(field) => (
                    <Input
                      {...field}
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    />
                  )}
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Edad">
                    {(field) => (
                      <Input
                        {...field}
                        type="number"
                        value={form.age}
                        onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                      />
                    )}
                  </FormField>
                  <FormField label="Teléfono">
                    {(field) => (
                      <Input
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      />
                    )}
                  </FormField>
                </div>
                <FormField label="Lugar de origen (estado / ciudad)">
                  {(field) => (
                    <Input
                      {...field}
                      value={form.origin}
                      onChange={(e) => setForm((p) => ({ ...p, origin: e.target.value }))}
                    />
                  )}
                </FormField>
              </div>
              <Button type="button" onClick={() => setStep(1)} className="w-full rounded-full">Siguiente</Button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 ref={stepHeadingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
                Familiares y situación
              </h2>
              <div className="space-y-4">
                <FormField label="Integrantes de la familia (nombres y edades)">
                  {(field) => (
                    <Textarea
                      {...field}
                      rows={4}
                      value={form.familyMembers}
                      onChange={(e) => setForm((p) => ({ ...p, familyMembers: e.target.value }))}
                      placeholder="Ej: María López (45), Juan López (12)..."
                    />
                  )}
                </FormField>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.deceasedRelatives}
                      onChange={(e) => setForm((p) => ({ ...p, deceasedRelatives: e.target.checked }))}
                      className="accent-primary"
                    />
                    ¿Tiene familiares fallecidos?
                  </Label>
                  {form.deceasedRelatives && (
                    <FormField label="Detalle de familiares fallecidos" hideLabel>
                      {(field) => (
                        <Textarea
                          {...field}
                          rows={3}
                          value={form.deceasedDetail}
                          onChange={(e) => setForm((p) => ({ ...p, deceasedDetail: e.target.value }))}
                          placeholder="Indica nombres y relación si deseas..."
                        />
                      )}
                    </FormField>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(0)} className="rounded-full">Atrás</Button>
                <Button type="button" onClick={() => setStep(2)} className="w-full rounded-full">Siguiente</Button>
              </div>
            </>
          )}

          {step === 2 && (
            <div role="group" aria-labelledby={helpGroupId}>
              <h2 ref={stepHeadingRef} tabIndex={-1} id={helpGroupId} className="text-lg font-semibold outline-none">
                Tipo de ayuda necesaria
              </h2>
              <p className="text-sm text-muted-foreground mb-4">Selecciona todas las que apliquen</p>
              <div className="grid grid-cols-2 gap-3">
                {helpOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="checkbox"
                    aria-checked={form.helpNeeded.includes(opt.value)}
                    onClick={() => toggleHelp(opt.value)}
                    className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                      form.helpNeeded.includes(opt.value)
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full">Atrás</Button>
                <Button type="button" onClick={() => setStep(3)} className="w-full rounded-full">Siguiente</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div role="radiogroup" aria-labelledby={housingGroupId}>
                <h2 ref={stepHeadingRef} tabIndex={-1} id={housingGroupId} className="text-lg font-semibold outline-none mb-3">
                  Estado de la vivienda
                </h2>
                <div className="space-y-3">
                  {housingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={form.housingStatus === opt.value}
                      onClick={() => setForm((p) => ({ ...p, housingStatus: opt.value }))}
                      className={`w-full p-3 rounded-lg border text-sm text-left transition-colors ${
                        form.housingStatus === opt.value
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <FormField label="Información adicional">
                {(field) => (
                  <Textarea
                    {...field}
                    rows={4}
                    value={form.additionalInfo}
                    onChange={(e) => setForm((p) => ({ ...p, additionalInfo: e.target.value }))}
                    placeholder="Cualquier otra información que consideres relevante..."
                  />
                )}
              </FormField>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="rounded-full">Atrás</Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sending}
                  aria-busy={sending}
                  className="w-full rounded-full gap-2"
                >
                  {sending ? "Enviando..." : "Enviar información"}
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
