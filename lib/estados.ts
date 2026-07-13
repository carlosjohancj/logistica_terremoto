"use client"

import { useState, useEffect } from "react"
import { getSupabase } from "@/types/supabase"
import type { Estado as EstadoRow, CityCoord } from "@/types/database"

type Municipio = {
  municipio: string
  ciudades: string[]
}

// The DB row's `municipios` column is untyped jsonb; narrow it to the shape
// this module actually relies on.
export type Estado = Omit<EstadoRow, "municipios" | "capital" | "lat" | "lng"> & {
  capital: string
  municipios: Municipio[]
  lat: number
  lng: number
}

let estadoCache: Estado[] | null = null
let coordCache: Record<string, CityCoord> | null = null

async function fetchEstados(): Promise<Estado[]> {
  if (estadoCache) return estadoCache
  try {
    const supabase = getSupabase()
    const res = (await supabase.from("estados").select("*").order("name")).data as Estado[] | null || []
    estadoCache = res
    return res
  } catch {
    return []
  }
}

async function fetchCityCoords(): Promise<Record<string, CityCoord>> {
  if (coordCache) return coordCache
  try {
    const supabase = getSupabase()
    const { data } = await supabase.from("city_coords").select("*") as never as { data: CityCoord[] | null }
    const map: Record<string, CityCoord> = {}
    for (const c of data ?? []) {
      map[`${c.city}|${c.state}`] = c
    }
    coordCache = map
    return map
  } catch {
    return {}
  }
}

export async function getEstados(): Promise<Estado[]> {
  return fetchEstados()
}

export async function getCoords(): Promise<Record<string, number[]>> {
  const estados = await fetchEstados()
  const result: Record<string, number[]> = {}
  for (const e of estados) {
    result[e.name] = [e.lat, e.lng]
  }
  return result
}

export async function getCityCoord(state: string, city: string): Promise<{ lat: number; lng: number } | null> {
  const coords = await fetchCityCoords()
  const key = `${city}|${state}`
  const found = coords[key]
  if (found) return { lat: found.lat, lng: found.lng }

  const estados = await fetchEstados()
  const estado = estados.find((e) => e.name === state)
  if (estado) return { lat: estado.lat, lng: estado.lng }
  return null
}

export async function getCitiesByState(state: string): Promise<string[]> {
  const estados = await fetchEstados()
  const estado = estados.find((e) => e.name === state)
  if (!estado) return []
  const cities = new Set<string>()
  for (const m of estado.municipios) {
    for (const c of m.ciudades) {
      cities.add(c)
    }
  }
  return [...cities].sort()
}

export function useEstados() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEstados().then((data) => {
      setEstados(data)
      setLoading(false)
    })
  }, [])

  return { estados, loading }
}
