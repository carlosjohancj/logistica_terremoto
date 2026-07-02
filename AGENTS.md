<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Archivo de progreso

### Resumen del proyecto
Logística Terremoto — plataforma de **logística civil** (Next.js 16, Tailwind 4, shadcn/ui, Supabase) que conecta voluntarios, organizaciones y damnificados para coordinar ayuda efectiva. Sin recolección directa — todo gestionado por terceros. i18n en 7 idiomas.

### Progreso

#### Completado
- **Registro**: fix del 500 — `/api/auth/register` usa `admin.createUser()` + insert directo. Tipos de voluntario (hospedaje/gestion/ambos).
- **Roles**: `damnificado`, `transportista`, `anfitrion`, `donante`, `voluntario`, **`organizacion`**, `admin`
- **Navbar**: enlaces a `ofrecer-insumos`, `empresas/registro`, `empiezo-desde-cero`
- **Footer**: enlace donación plataforma + empiezo-desde-cero
- **Homepage**: stats (viajes, transportistas, voluntarios, organizaciones), hero replanteado
- **Donar**: simplificado a info + enlace PayPal externo
- **Empiezo Desde Cero** (`/empiezo-desde-cero`):
  - Página principal con 24 tarjetas de estado expandibles (ciudades + alojamientos)
  - Timeline de reasentamiento (6 pasos)
  - **Asistencia IA** (`/asistencia`): formulario multi-paso (familiares, fallecidos, tipo ayuda, vivienda)
  - **Solicitar Viaje** (`/solicitar-viaje`): formulario avanzado con estado/ciudad, pasajeros, salud
- **Organizaciones**: SQL + API (crear, listar, miembros) + panel en perfil (crear org, invitar miembros)
- **Perfil**: tab Organización con dashboard de miembros/ayudas
- **Dashboard unificado** `/perfil` con 8 tabs: Perfil, Mis Publicaciones, Solicitudes Disponibles, Ayuda Asignada, Conexiones, Empresa, **Organización**, Mensajes
- **Route Segments API**: POST `/api/route-segments` con @turf/turf (named import `{ distance }`)
- **Mapa** (`/explorar`): marcadores origen/destino, Polyline, city coords via `getCityCoord()`
- **SQL**: `city-coords.sql`, `route-segments.sql`, `messages.sql`, `organizations.sql`, `volunteer-types.sql`
- **Geocoding**: `scripts/geocode-cities.mjs` (Nominatim)
- **Build**: 33 rutas, compila limpio

#### Pendiente (debe ejecutar el usuario)
1. ~~Ejecutar SQL en Supabase Studio~~ ✅
2. ~~Ejecutar `scripts/geocode-cities.mjs`~~ ✅

#### Notas técnicas
- Supabase self-hosted en `http://backend.desdecerovenezuela.org:8000` (HTTP)
- Service role key en `.env.local` para operaciones admin
- `@turf/turf` usa named exports (ej. `distance`)
- RLS policies asumen `auth.uid()`
- Tablas nuevas: `organizations`, `organization_members`, `city_coords`, `route_segments`
- Columna nueva: `profiles.volunteer_type` (hospedaje/gestion/ambos)
