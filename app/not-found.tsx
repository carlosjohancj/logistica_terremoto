import Link from "next/link"
import { headers } from "next/headers"

const locales = ["es", "en", "fr", "it", "de", "pt", "ar"]

export default async function GlobalNotFound() {
  const h = await headers()
  const acceptLang = h.get("accept-language") || ""
  const preferred = acceptLang
    .split(",")
    .map((l) => l.split(";")[0].split("-")[0].trim().toLowerCase())
    .find((l) => locales.includes(l))
  const locale = preferred || "es"

  const content: Record<string, { title: string; desc: string; back: string }> = {
    es: { title: "Página no encontrada", desc: "La página que buscas no existe o ha sido movida.", back: "Volver al inicio" },
    en: { title: "Page not found", desc: "The page you're looking for doesn't exist or has been moved.", back: "Back to home" },
    fr: { title: "Page non trouvée", desc: "La page que vous cherchez n'existe pas ou a été déplacée.", back: "Retour à l'accueil" },
    it: { title: "Pagina non trovata", desc: "La pagina che cerchi non esiste o è stata spostata.", back: "Torna alla home" },
    de: { title: "Seite nicht gefunden", desc: "Die gesuchte Seite existiert nicht oder wurde verschoben.", back: "Zurück zur Startseite" },
    pt: { title: "Página não encontrada", desc: "A página que você procura não existe ou foi movida.", back: "Voltar ao início" },
    ar: { title: "الصفحة غير موجودة", desc: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.", back: "العودة إلى الصفحة الرئيسية" },
  }

  const c = content[locale] || content.es

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-2">{c.title}</p>
      <p className="text-muted-foreground mb-8 text-center max-w-md">{c.desc}</p>
      <Link
        href={`/${locale}`}
        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        {c.back}
      </Link>
    </div>
  )
}
