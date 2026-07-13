"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSupabase, TABLES } from "@/types/supabase"
import { getEstados, getCitiesByState } from "@/lib/estados"
import type { Estado } from "@/lib/estados"
import { StatesMarquee } from "@/components/empiezo-desde-cero/states-marquee"
import { Timeline } from "@/components/empiezo-desde-cero/timeline"
import { Search, ArrowRight, Bot, Truck, Sparkles } from "lucide-react"

const LOGO_URL = "https://backend.desdecerovenezuela.org/storage/v1/object/public/general/logos/desde-cero.webp"

type HousingOffer = {
  id: string
  city: string
  state: string
  capacity: number
  accepts_children: boolean
  accepts_adults: boolean
  accepts_families: boolean
  notes?: string
}

export default function EmpiezoDesdeCeroPage() {
  const tc = useTranslations("common")
  const t = useTranslations("nav")
  const th = useTranslations("home")
  const pathname = usePathname()
  const locale = pathname.split("/")[1] || "es"

  const [estados, setEstados] = useState<Estado[]>([])
  const [citiesByState, setCitiesByState] = useState<Record<string, string[]>>({})
  const [housingByCity, setHousingByCity] = useState<Record<string, HousingOffer[]>>({})
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getEstados()
        setEstados(data)

        const supabase = getSupabase()
        const { data: housing } = await supabase
          .from(TABLES.HOUSING_OFFERS)
          .select("*")
          .eq("status", "open") as never as { data: HousingOffer[] | null }

        const hbc: Record<string, HousingOffer[]> = {}
        for (const h of housing ?? []) {
          const key = h.city || h.state
          if (!hbc[key]) hbc[key] = []
          hbc[key].push(h)
        }
        setHousingByCity(hbc)

        const cbs: Record<string, string[]> = {}
        for (const e of data) {
          const cities = await getCitiesByState(e.name)
          cbs[e.name] = cities
        }
        setCitiesByState(cbs)
      } catch {
        // silencio
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col">
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center bg-stone-50 overflow-hidden px-4 py-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_URL} alt="Desde Cero" className="w-full max-w-2xl h-auto" />
        <p className="mt-6 text-base md:text-lg text-muted-foreground text-center max-w-xl">
          {th("heroDesc")}
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href={`/${locale}/empiezo-desde-cero/asistencia`}>
            <Button size="lg" className="rounded-full px-10 h-14 text-base gap-3">
              <Bot className="h-5 w-5" />
              Asistencia IA
            </Button>
          </Link>
          <Link href={`/${locale}/empiezo-desde-cero/solicitar-viaje`}>
            <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base gap-3">
              <Truck className="h-5 w-5" />
              Solicitar Viaje
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">Estados de Venezuela</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Explora los estados, ciudades y sitios de hospedaje disponibles
          </p>
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar estado o capital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="container mx-auto grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <StatesMarquee
            estados={estados}
            citiesByState={citiesByState}
            housingByCity={housingByCity}
            search={search}
          />
        )}
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-2">Proceso de Reasentamiento</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">
            El camino desde la emergencia hasta la estabilización
          </p>
          <Timeline />
        </div>
      </section>

      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <Sparkles className="h-8 w-8 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-3">¿Necesitas ayuda personalizada?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Nuestro asistente con IA te guiará en el proceso de registro, evaluará tus necesidades y te conectará con los recursos disponibles.
            </p>
            <Link href={`/${locale}/empiezo-desde-cero/asistencia`}>
              <Button size="lg" className="rounded-full gap-3 px-10 h-14 text-base">
                <Bot className="h-5 w-5" />
                Ir a Asistencia IA
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
