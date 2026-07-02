# Progreso y Mejoras — Logística Terremoto

## 1. Lo que ya se implementó

### Auth y Registro
- Registro via API route con service role (`/api/auth/register`)
- Login via `signInWithPassword()`
- Todos los formularios requieren autenticación (`submit.ts` sin fallback anónimo)
- Perfil se crea en `profiles` al registrar
- Roles: `damnificado`, `transportista`, `voluntario`, `anfitrion`, `donante`, `admin`

### Dashboard Unificado `/perfil`
 7 tabs según el rol del usuario:
  - **Perfil** — resumen con contadores
  - **Mis Publicaciones** — lista de posts propios
  - **Solicitudes Disponibles** (transportista/voluntario) — solicitudes abiertas filtradas por zona + botón "Tomar solicitud"
  - **Ayuda Asignada** (damnificado) — quién tomó su solicitud con datos de contacto
  - **Conexiones** — matches del usuario
  - **Empresa** (dueños de empresa) — panel de empleos (crear, listar, cerrar)
  - **Mensajes** — chat entre las partes de un match

### Matching
- `POST /api/matches` — toma una solicitud y crea match
- Cambia status de `travel_request` a `"matched"`
- Filtro por zona (origin_state) según ofertas de transporte del transportista

### Mensajería
- `POST /api/messages` — envía mensajes con service role
- Tab "Mensajes" en perfil con selector de conversación y input
- SQL de tabla `messages` con RLS en `supabase/messages.sql`

### Redirecciones
- `/matches` → `/perfil?tab=conexiones`
- `/empresas/dashboard` → `/perfil?tab=empresa`

---

## 2. Sistema de Rutas y Mapas — Estado Actual

### Cómo funciona hoy
- El mapa en `/explorar` muestra **marcadores individuales** usando `react-leaflet`
- Cada `travel_request` / `transport_offer` → **1 marcador** en coordenadas del estado de origen (+ jitter aleatorio)
- No hay líneas, no hay rutas, no hay polilíneas en el mapa
- Solo coordenadas a nivel de estado (desde tabla `estados`: lat/lng por estado)
- Las ciudades existen solo como strings (nombre), sin coordenadas

### Limitaciones actuales

| Aspecto | Estado actual |
|---|---|
| Visualización de ruta | Solo marcador en origen. Sin línea origen→destino |
| Segmentos / tramos | No existe el concepto |
| Múltiples transportistas | No soportado |
| Kilometraje | No se calcula ni muestra |
| Coordenadas de ciudades | No existen (solo nombres) |
| Insumos en ruta | No hay relación rutas→insumos |
| Tipo `ListItem` | Solo 1 par lat/lng — no soporta origen+destino |

---

## 3. Lo que falta — Mejora del Sistema de Rutas

### Visión general
El usuario describe:
> "Poder ver la ruta, crear tramos por si lo llevan entre diferentes transportistas, cantidad de kilómetros con salida y llegada final, insumos en el camino, insumos en la ciudad."

Esto implica un rediseño profundo del modelo de datos y la visualización.

### 3.1 Modelo de datos — Rutas con segmentos

Necesitamos una nueva tabla (o modificar las existentes):

```sql
-- Tramos de ruta (segmentos entre ciudades)
CREATE TABLE route_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  transport_offer_id UUID REFERENCES transport_offers(id),  -- quién lleva este tramo
  origin_city TEXT NOT NULL,
  origin_lat DECIMAL,
  origin_lng DECIMAL,
  destination_city TEXT NOT NULL,
  destination_lat DECIMAL,
  destination_lng DECIMAL,
  distance_km DECIMAL,          -- km calculados
  estimated_time TEXT,          -- tiempo estimado
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  "order" INTEGER,              -- orden del tramo en la ruta completa
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insumos asociados a un tramo o ciudad
CREATE TABLE route_supplies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID REFERENCES route_segments(id),
  supply_type TEXT NOT NULL,     -- comida, agua, medicina, gasolina, etc.
  description TEXT,
  quantity INTEGER,
  location_type TEXT,            -- 'en_ruta' | 'en_ciudad'
  city TEXT,
  status TEXT DEFAULT 'needed',  -- needed, secured, delivered
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Coordenadas de ciudades

Actualmente solo tenemos coordenadas de **estados**. Para rutas reales necesitamos coordenadas de **ciudades**.

**Opción A** — API de geocoding (recomendada):
- Usar Nominatim (OSM) o Mapbox Geocoding para obtener lat/lng de ciudades venezolanas
- Cachear resultados en la tabla `estados` (agregar columna JSON `ciudades_coords`)
- Llamada bajo demanda cuando se crea una ruta

**Opción B** — Precargar coordenadas:
- Generar un script que geocodee todas las ciudades de Venezuela
- Almacenar en una tabla `city_coords` o en el JSON de `estados.municipios[].ciudades[]`

### 3.3 Visualización en el mapa

```tsx
// Nuevo: Polyline entre origen y destino
import { Polyline, Marker, Popup } from "react-leaflet"

// Para una ruta con múltiples segmentos:
<Polyline
  positions={[
    [origen.lat, origen.lng],  // Salida
    [tramo1.destination_lat, tramo1.destination_lng],  // Parada 1
    [tramo2.destination_lat, tramo2.destination_lng],  // Parada 2
    [destino_final.lat, destino_final.lng],  // Llegada final
  ]}
  color="#6B8F71"
  weight={4}
/>

// Marcador en cada punto con popup de información
```

### 3.4 Cálculo de kilometraje

**Opción A** — Leaflet + Turf.js:
```ts
import turf from "@turf/turf"
const distancia = turf.distance(origen, destino, { units: "kilometers" })
// ~ distancia en línea recta (no por carretera)
```

**Opción B** — API de routing OSRM:
```
https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}
```
Devuelve distancia real por carretera + geometría de la ruta.

### 3.5 Flujo completo propuesto

```
1. Damnificado crea travel_request (origen→destino final)
2. Transportista 1 toma tramo 1 (Cordero → Barinas)
3. Se crea route_segment: Cordero→Barinas, distance_km, order=1
4. Transportista 2 toma tramo 2 (Barinas → destino final)
5. Se crea route_segment: Barinas→destino, distance_km, order=2
6. El mapa muestra:
   - Línea verde para tramo 1
   - Línea azul para tramo 2
   - Marcadores en cada ciudad con popups
   - Km totales = suma de segmentos
7. Insumos asociados:
   - "Se necesitan 5gal de gasolina en Barinas" → aparece en el mapa
   - "Se necesita comida para 3 personas en ruta" → aparece en el tramo
```

### 3.6 Etapas de implementación sugeridas

| Etapa | Descripción | Dependencias |
|---|---|---|
| **1** | Agregar coordenadas de ciudades (geocoding) | API de geocoding |
| **2** | Crear tabla `route_segments` | SQL |
| **3** | Mostrar Polyline origen→destino en mapa | Leaflet Polyline |
| **4** | Agregar múltiples marcadores (origen + destino + paradas) | — |
| **5** | Fragmentar ruta en tramos cuando hay múltiples transportistas | route_segments |
| **6** | Calcular y mostrar kilometraje (Turf.js u OSRM) | Turf.js |
| **7** | Tabla `route_supplies` + visualización en mapa | SQL + Leaflet |
| **8** | UI para que transportista seleccione tramo (no la ruta completa) | — |

---

## 4. Pendientes adicionales (no relacionados con rutas)

- **`ofrecer-insumos`** no tiene enlace en navbar (ver `docs/rutas-faltantes-navbar.md`)
- **`empresas/registro`** no tiene enlace directo en navbar
- La navegación del perfil con `?tab=` via `router.replace` no actualiza el botón activo visualmente al cambiar de tab (usar `useSearchParams` + estado local)
- Las páginas de detalle (`/[id]` de donaciones, empleos) necesitan verificación de datos
- La página de admin solo cambia status — no hay flujo de verificación de empresas ni moderación de contenido

---

## 5. Archivos relevantes

| Archivo | Propósito |
|---|---|
| `components/maps/map-view.tsx` | Componente del mapa (solo markers, sin rutas) |
| `lib/estados.ts` | Datos de estados + coordenadas (solo nivel estado) |
| `app/[locale]/explorar/page.tsx` | Página de exploración (carga datos, los pasa al mapa) |
| `lib/supabase.ts` | Constantes de tablas |
| `lib/schemas/travel-request.ts` | Schema de solicitud de viaje (origen/destino) |
| `lib/schemas/transport-offer.ts` | Schema de oferta de transporte |
| `app/api/matches/route.ts` | Creación de matches |
| `app/[locale]/perfil/page.tsx` | Dashboard unificado con tabs |
| `app/[locale]/perfil/mensajes-panel.tsx` | Chat entre partes del match |
| `supabase/messages.sql` | SQL para tabla de mensajes |
| `package.json` | Dependencias (leaflet, react-leaflet — sin routing) |
