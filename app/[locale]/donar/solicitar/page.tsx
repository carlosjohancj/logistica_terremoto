"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabase } from "@/lib/supabase"
import { HELP_TYPES } from "@/lib/forms/constants"
import { useEstados } from "@/lib/estados"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"

export default function SolicitarPage() {
  const f = useTranslations("familyAid")
  const ht = useTranslations("helpTypes")
  const tc = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const { estados } = useEstados()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [story, setStory] = useState("")
  const [amount, setAmount] = useState("")
  const [helpType, setHelpType] = useState("")
  const [state, setState] = useState("")
  const [city, setCity] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !helpType) return

    setSending(true)
    try {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error(tc("authRequired"))
        return
      }

      const res = await fetch("/api/family-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          story: story.trim(),
          amount_needed: amount ? parseFloat(amount) : null,
          help_type: helpType,
          location_state: state || null,
          location_city: city || null,
        }),
      })

      if (!res.ok) throw new Error(await res.text())

      toast.success(f("success"))
      router.push(`/${locale}/donar`)
    } catch {
      toast.error(tc("tryAgain"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Link
        href={`/${locale}/donar`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> {tc("back")}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{f("formTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">{f("titleLabel")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={f("titleLabel")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{f("descriptionLabel")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={f("descriptionLabel")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">{f("storyLabel")}</Label>
              <Textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder={f("storyLabel")}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{f("amountLabel")}</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={f("amountLabel")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpType">{f("helpTypeLabel")}</Label>
              <Select value={helpType} onValueChange={(v) => setHelpType(v || "")} required>
                <SelectTrigger id="helpType">
                  <SelectValue placeholder={tc("select")} />
                </SelectTrigger>
                <SelectContent>
                  {HELP_TYPES.map((htype) => (
                    <SelectItem key={htype} value={htype}>{ht(htype)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">{f("stateLabel")}</Label>
                <Select value={state} onValueChange={(v) => setState(v || "")}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder={tc("select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((est) => (
                      <SelectItem key={est.id} value={est.name}>{est.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{f("cityLabel")}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={f("cityLabel")}
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full gap-2" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {f("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
