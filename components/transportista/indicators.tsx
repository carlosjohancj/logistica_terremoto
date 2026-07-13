"use client"

import { Route, Gauge, Users, ClipboardList } from "lucide-react"

type IndicatorsProps = {
  kmTotal: number
  viajesRealizados: number
  familiasAyudadas: number
  solicitudesPendientes: number
}

const cards = [
  {
    label: "Kilómetros recorridos",
    value: (n: number) => `${n.toFixed(0)} km`,
    icon: Route,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    label: "Viajes realizados",
    value: (n: number) => String(n),
    icon: Gauge,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    label: "Familias ayudadas",
    value: (n: number) => String(n),
    icon: Users,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    label: "Solicitudes pendientes",
    value: (n: number) => String(n),
    icon: ClipboardList,
    gradient: "from-purple-500 to-violet-600",
  },
]

export default function Indicators({ kmTotal, viajesRealizados, familiasAyudadas, solicitudesPendientes }: IndicatorsProps) {
  const values = [kmTotal, viajesRealizados, familiasAyudadas, solicitudesPendientes]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        const val = c.value(values[i])
        return (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div
              className={`absolute -top-8 -right-8 h-28 w-28 rounded-full bg-linear-to-br ${c.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}
            />
            <div className="relative flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground leading-snug">
                  {c.label}
                </p>
                <p className="mt-2 text-2xl font-bold whitespace-nowrap text-foreground tabular-nums sm:text-3xl">
                  {val}
                </p>
              </div>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${c.gradient} text-white shadow-sm`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
