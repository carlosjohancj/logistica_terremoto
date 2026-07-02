<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Archivo de progreso

### Resumen del proyecto
Logística Terremoto — plataforma multi-tenant (Next.js 16, Tailwind 4, shadcn/ui, Supabase) para conectar víctimas del terremoto de Venezuela con transportistas, hospedaje, donantes, insumos, empleos, voluntarios, chat y recursos descargables. i18n en 7 idiomas.

### Progreso

#### Completado
- **Registro**: fix del 500 — `/api/auth/register` usa `admin.createUser()` + insert directo en profiles. Trigger `on_auth_user_created` eliminado.
- **Roles**: `"voluntario"` agregado a `Role` type, select de registro, traducciones en 7 idiomas.
- **Matches API**: POST `/api/matches` crea match + cambia status travel_request a `"matched"`.
- **Messages API**: POST `/api/messages` inserta mensajes con service role.
- **Route Segments API**: POST `/api/route-segments` crea segmentos, calcula distancia (turf), detecta cobertura total, actualiza match/status.
  - Fix: import named `{ distance }` en vez de default import.
- **Dashboard unificado** `/perfil` con 7 tabs: Perfil, Mis Publicaciones, Solicitudes Disponibles, Ayuda Asignada, Conexiones, Empresa, Mensajes.
- **Solicitudes Panel** (`solicitudes-panel.tsx`): lista solicitudes abiertas filtradas por zona, botón "Tomar solicitud" con diálogo modal que permite elegir entre "Ruta completa" y "Tramo personalizado" con dropdowns de ciudades origen/destino.
- **Ayuda Asignada**: ahora muestra desglose de segmentos (múltiples transportistas por solicitud) con distancia y datos de contacto.
- **Mapa** (`map-view.tsx`): marcadores origen/destino separados, Polyline con dash, colores por tipo. Página `/explorar` usa `getCityCoord()` para coordenadas a nivel ciudad (fallback a centroide de estado).
- **Explorar**: coordenadas precisas por ciudad vía `getCityCoord()`.
- **Redirecciones**: `/matches` → `/perfil?tab=conexiones`, `/empresas/dashboard` → `/perfil?tab=empresa`.
- **SQL**: `city-coords.sql`, `route-segments.sql`, `messages.sql`.
- **Geocoding**: `scripts/geocode-cities.mjs` (Nominatim, rate-limited).
- **Librerías**: `@turf/turf` instalado (distancia de ruta).
- **Build**: 27 rutas, compila limpio.

#### Pendiente (debe ejecutar el usuario)
1. Ejecutar SQL en Supabase Studio: `city-coords.sql`, `route-segments.sql`, `messages.sql`.
2. Ejecutar `scripts/geocode-cities.mjs` con variables de entorno de Supabase para poblar `city_coords`.
3. Si generó `supabase/geocoded-cities.sql`, ejecutarlo también.
4. Verificar navbar: agregar `ofrecer-insumos` y enlace a empresa.
5. Verificar `empresas/registro` accesible desde navbar.

#### Notas técnicas
- Supabase self-hosted en `http://backend.desdecerovenezuela.org:8000` (HTTP, no HTTPS).
- Service role key en `.env.local` para operaciones admin.
- `city_coords` y `route_segments` deben crearse en DB antes de usar.
- `@turf/turf` usa named exports (ej. `distance`).
- RLS policies en SQL asumen `auth.uid()`.
