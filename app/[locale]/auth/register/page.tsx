"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { getPB, type Role } from "@/lib/pocketbase"

export default function RegisterPage() {
  const t = useTranslations("auth")
  const tc = useTranslations("common")
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    role: "",
  })
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (form.password !== form.passwordConfirm) {
      toast.error(t("errorPasswordMatch"))
      return
    }

    setLoading(true)
    try {
      const pb = getPB()
      await pb.collection("users").create({
        name: form.name,
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
        phone: form.phone,
        role: form.role || "damnificado",
      })
      await pb.collection("users").authWithPassword(form.email, form.password)
      toast.success(tc("success"))
      router.push("/")
    } catch (err) {
      const msg = err instanceof Error ? err.message : tc("error")
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("register")}</CardTitle>
          <CardDescription>{t("registerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("role")}</Label>
              <Select value={form.role} onValueChange={(v) => update("role", v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder={t("role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damnificado">{t("roleDamnificado")}</SelectItem>
                  <SelectItem value="transportista">{t("roleTransportista")}</SelectItem>
                  <SelectItem value="anfitrion">{t("roleAnfitrion")}</SelectItem>
                  <SelectItem value="donante">{t("roleDonante")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">{t("passwordConfirm")}</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => update("passwordConfirm", e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tc("loading") : t("submit")}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t("hasAccount")}{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              {t("loginHere")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
