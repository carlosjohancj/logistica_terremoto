"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { loginUser } from "@/lib/auth"
import { createLoginSchema, type LoginFormValues } from "@/lib/schemas/auth"

export default function LoginPage() {
  const t = useTranslations("auth")
  const tc = useTranslations("common")
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(
      createLoginSchema({
        errorRequired: t("errorRequired"),
        errorEmail: t("errorEmail"),
        errorPasswordLength: t("errorPasswordLength"),
        errorPasswordMatch: t("errorPasswordMatch"),
      })
    ),
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginUser(values)
      toast.success(tc("success"))
      router.push(`/${locale}`)
    } catch {
      toast.error(t("errorLogin"))
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("login")}</CardTitle>
          <CardDescription>{t("loginDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <PasswordInput id="password" {...register("password")} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? tc("loading") : t("submit")}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t("noAccount")}{" "}
            <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">
              {t("registerHere")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
