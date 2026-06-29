"use client"

import { useState, useEffect } from "react"
import { getPB } from "./pocketbase"

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
    const pb = getPB()
    const res = await pb.collection("estados").getFullList<Estado>({ sort: "name" })
    cache = res
    return res
  } catch {
    const { default: fallback } = await import("@/data/venezuela.json")
    const { default: coordsFallback } = await import("@/data/coords.json")
    cache = fallback.map((e: { estado: string; capital: string; municipios: Municipio[] }) => {
      const coord = (coordsFallback as Record<string, number[]>)[e.estado] || [0, 0]
      return {
        id: e.estado,
        name: e.estado,
        capital: e.capital,
        municipios: e.municipios,
        lat: coord[0],
        lng: coord[1],
      }
    })
    return cache!
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
