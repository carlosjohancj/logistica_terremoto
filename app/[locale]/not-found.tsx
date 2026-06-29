"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function LocaleNotFound() {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl font-semibold mb-2">Página no encontrada</p>
        <p className="text-muted-foreground mb-8">
          La página que buscas no existe o ha sido movida a otra dirección.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}`}>
            <Button>
              <Home className="h-4 w-4 mr-1" /> Ir al inicio
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver atrás
          </Button>
        </div>
      </div>
    </div>
  )
}
