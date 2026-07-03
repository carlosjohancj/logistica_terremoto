"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

const content: Record<string, { title: string; desc: string; home: string; back: string }> = {
  es: { title: "Página no encontrada", desc: "La página que buscas no existe o ha sido movida a otra dirección.", home: "Ir al inicio", back: "Volver atrás" },
  en: { title: "Page not found", desc: "The page you're looking for doesn't exist or has been moved.", home: "Go home", back: "Go back" },
  fr: { title: "Page non trouvée", desc: "La page que vous cherchez n'existe pas ou a été déplacée.", home: "Accueil", back: "Retour" },
  it: { title: "Pagina non trovata", desc: "La pagina che cerchi non esiste o è stata spostata.", home: "Vai alla home", back: "Indietro" },
  de: { title: "Seite nicht gefunden", desc: "Die gesuchte Seite existiert nicht oder wurde verschoben.", home: "Zur Startseite", back: "Zurück" },
  pt: { title: "Página não encontrada", desc: "A página que você procura não existe ou foi movida.", home: "Ir para o início", back: "Voltar" },
  ar: { title: "الصفحة غير موجودة", desc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", home: "العودة إلى الرئيسية", back: "رجوع" },
}

export default function LocaleNotFound() {
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"
  const c = content[locale] || content.es

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl font-semibold mb-2">{c.title}</p>
        <p className="text-muted-foreground mb-8">{c.desc}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/${locale}`}>
            <Button>
              <Home className="h-4 w-4 mr-1" /> {c.home}
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> {c.back}
          </Button>
        </div>
      </div>
    </div>
  )
}
