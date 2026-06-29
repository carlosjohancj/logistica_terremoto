"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/shared/language-switcher"
import { cn } from "@/lib/utils"
import { getPB } from "@/lib/pocketbase"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const pb = getPB()
    setIsLoggedIn(!!pb.authStore.model)
    const unsubscribe = pb.authStore.onChange(() => {
      setIsLoggedIn(!!pb.authStore.model)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const links = [
    { href: `/${locale}`, label: t("inicio") },
    { href: `/${locale}/solicitar-viaje`, label: t("solicitarViaje") },
    { href: `/${locale}/ofrecer-transporte`, label: t("ofrecerTransporte") },
    { href: `/${locale}/ofrecer-hospedaje`, label: t("ofrecerHospedaje") },
    { href: `/${locale}/explorar`, label: t("explorar") },
    { href: `/${locale}/donar`, label: t("donar") },
    { href: `/${locale}/donaciones-fisicas`, label: t("donacionesFisicas") },
    { href: `/${locale}/empleos`, label: t("empleos") },
    { href: `/${locale}/recursos`, label: t("recursos") },
    { href: `/${locale}/sobre-nosotros`, label: t("sobreNosotros") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-bold text-primary">Desde Cero</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.slice(0, -2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <Link href={`/${locale}/sobre-nosotros`}>
              <Button variant="ghost" size="sm">{links[links.length - 1].label}</Button>
            </Link>
            <Link href={`/${locale}/empleos`}>
              <Button variant="ghost" size="sm">{links[links.length - 2].label}</Button>
            </Link>
          </div>

          <LanguageSwitcher />

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={`/${locale}/matches`}>
                  <Button variant="ghost" size="sm">Conexiones</Button>
                </Link>
                <Link href={`/${locale}/perfil`}>
                  <Button variant="outline" size="sm">{t("perfil")}</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/login`}>
                  <Button variant="outline" size="sm">{t("iniciarSesion")}</Button>
                </Link>
                <Link href={`/${locale}/auth/register`}>
                  <Button size="sm">{t("registrarse")}</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block py-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {isLoggedIn ? (
              <>
                <Link
                  href={`/${locale}/matches`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("matches")}
                </Link>
                <Link
                  href={`/${locale}/perfil`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("perfil")}
                </Link>
                <button
                  className="block py-2 text-sm font-medium text-destructive"
                  onClick={() => { getPB().authStore.clear(); window.location.href = `/${locale}` }}
                >
                  {t("cerrarSesion")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("iniciarSesion")}
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="block py-2 text-sm font-medium text-muted-foreground"
                >
                  {t("registrarse")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
