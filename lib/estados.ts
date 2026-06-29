"use client"

import { useState, useEffect } from "react"
import { getSupabase } from "./supabase"

type Municipio = {
  municipio: string
  ciudades: string[]
}

export type Estado = {
  id: string
  name: string
  capital: string
  municipios: Municipio[]
  lat: number
  lng: number
}

let cache: Estado[] | null = null

async function fetchEstados(): Promise<Estado[]> {
  if (cache) return cache
  try {
    const supabase = getSupabase()
    const res = (await supabase.from("estados").select("*").order("name")).data as Estado[] | null || []
    cache = res
    return res
  } catch {
    return []
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

export async function getEstadosList(): Promise<string[]> {
  const estados = await fetchEstados()
  return estados.map((e) => e.name)
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
