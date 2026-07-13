"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { getSupabase } from "@/types/supabase"
import ChatFloating from "@/components/transportista/chat-floating"
import { LayoutDashboard, Map, Home, LogOut, Truck } from "lucide-react"

const navItems = [
  { href: "/transportista", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/transportista/ruta", label: "Planificar ruta", icon: Map, exact: false },
]

export default function TransportistaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const [loading, setLoading] = useState(true)
  const [profileName, setProfileName] = useState("")

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "transportista") {
        router.push("/perfil")
        return
      }

      setProfileName((profile as { name?: string } | null)?.name || "")
      setLoading(false)
    }
    checkAuth()
  }, [router])

  function handleLogout() {
    getSupabase().auth.signOut()
    router.push(`/${locale}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Verificando acceso...</p>
      </div>
    )
  }

  const initial = profileName.charAt(0).toUpperCase() || "T"

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-16 lg:w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-3 lg:px-5 py-4 border-b border-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Truck className="h-5 w-5" />
          </div>
          <div className="hidden lg:block min-w-0">
            <p className="text-sm font-bold leading-none truncate">Transportista</p>
            <p className="mt-1 text-xs text-muted-foreground truncate">Panel de logística</p>
          </div>
        </div>

        <nav className="flex-1 p-2 lg:p-3 space-y-1">
          {navItems.map((item) => {
            const target = `/${locale}${item.href}`
            const isActive = item.exact ? pathname === target : pathname.startsWith(target)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={target}
                title={item.label}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 hidden w-1 rounded-full bg-primary lg:block" />
                )}
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="hidden lg:inline truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-2 lg:p-3 border-t border-border space-y-1">
          <Link
            href={`/${locale}`}
            title="Volver al inicio"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="h-4.5 w-4.5 shrink-0" />
            <span className="hidden lg:inline">Inicio</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span className="hidden lg:inline">Cerrar sesión</span>
          </button>

          <div className="hidden lg:flex items-center gap-2.5 rounded-lg bg-muted/60 px-3 py-2 mt-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase text-primary-foreground">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{profileName || "Transportista"}</p>
              <p className="text-xs text-muted-foreground">Cuenta activa</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>

      <ChatFloating />
    </div>
  )
}
