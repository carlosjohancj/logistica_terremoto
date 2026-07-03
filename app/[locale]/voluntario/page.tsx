"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabase } from "@/lib/supabase"
import { Construction } from "lucide-react"

export default function VoluntarioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const supabase = getSupabase()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      setLoading(false)
    }
    check()
  }, [router])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Verificando acceso...</p></div>

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Construction className="h-16 w-16 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Panel de Voluntario</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Esta sección está en construcción. Pronto podrás gestionar tus tareas de validación y logística desde aquí.
      </p>
    </div>
  )
}
