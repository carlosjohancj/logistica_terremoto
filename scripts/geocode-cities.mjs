import { createClient } from "@supabase/supabase-js"
import * as fs from "fs"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://backend.desdecerovenezuela.org:8000"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function getEstados() {
  const { data } = await supabase.from("estados").select("*").order("name")
  return data || []
}

function extractCities(estados) {
  const cities = []
  const seen = new Set()
  for (const e of estados) {
    if (!e.municipios) continue
    for (const m of e.municipios) {
      if (!m.ciudades) continue
      for (const c of m.ciudades) {
        const key = `${c}|${e.name}`
        if (!seen.has(key)) {
          seen.add(key)
          cities.push({ city: c, state: e.name })
        }
      }
    }
  }
  return cities
}

async function geocode(city, state) {
  const q = encodeURIComponent(`${city}, ${state}, Venezuela`)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "LogisticaTerremoto/1.0 (geocoding script)" },
    })
    if (!res.ok) {
      console.error(`  HTTP ${res.status} for ${city}, ${state}`)
      return null
    }
    const data = await res.json()
    if (data.length === 0) {
      console.log(`  No results for ${city}, ${state}`)
      return null
    }
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch (err) {
    console.error(`  Error geocoding ${city}, ${state}: ${err.message}`)
    return null
  }
}

async function main() {
  console.log("Fetching estados...")
  const estados = await getEstados()
  const cities = extractCities(estados)
  console.log(`Found ${cities.length} unique cities`)

  const inserts = []
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < cities.length; i++) {
    const { city, state } = cities[i]
    process.stdout.write(`[${i + 1}/${cities.length}] ${city}, ${state}... `)
    const coord = await geocode(city, state)
    if (coord) {
      inserts.push({
        city: city.replace(/'/g, "''"),
        state: state.replace(/'/g, "''"),
        lat: coord.lat,
        lng: coord.lng,
      })
      console.log(`✓ (${coord.lat}, ${coord.lng})`)
      successCount++
    } else {
      console.log("✗")
      failCount++
    }
    // Nominatim rate limit: 1 request/second
    await new Promise((r) => setTimeout(r, 1100))
  }

  // Generate SQL file
  let sql = `-- Geocoded cities (${new Date().toISOString()})\n`
  sql += `-- Success: ${successCount}, Failed: ${failCount}\n\n`
  sql += `INSERT INTO city_coords (city, state, lat, lng) VALUES\n`
  for (let i = 0; i < inserts.length; i++) {
    const { city, state, lat, lng } = inserts[i]
    sql += `  ('${city}', '${state}', ${lat}, ${lng})`
    sql += i < inserts.length - 1 ? ",\n" : ";\n"
  }
  sql += `\n-- ON CONFLICT DO NOTHING\n`

  fs.writeFileSync("supabase/geocoded-cities.sql", sql)
  console.log(`\nDone! Written ${inserts.length} rows to supabase/geocoded-cities.sql`)
}

main().catch(console.error)
