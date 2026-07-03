"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { getSupabase } from "@/lib/supabase"
import ChatFloating from "@/components/transportista/chat-floating"

const navItems = [
  { href: "/transportista", label: "Inicio", icon: "📊" },
  { href: "/transportista/ruta", label: "Planificar ruta", icon: "🗺️" },
]

export default function TransportistaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

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
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "transportista") {
        router.push("/perfil")
        return
      }

      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Verificando acceso...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-16 lg:w-56 border-r bg-background flex flex-col shrink-0">
        <div className="p-3 border-b">
          <Link href="/transportista" className="text-sm font-bold hidden lg:block">
            Transportista
          </Link>
          <Link href="/transportista" className="text-sm font-bold lg:hidden block text-center">
            T
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/transportista"
              ? pathname === "/transportista"
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t">
          <Link
            href="/perfil"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <span className="text-lg">👤</span>
            <span className="hidden lg:inline">Perfil</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>

      <ChatFloating />
    </div>
  )
}
