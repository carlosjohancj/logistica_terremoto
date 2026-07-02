# Logística Terremoto — Documentación

## 1. Visión General

Plataforma de **logística civil** que conecta voluntarios, organizaciones y damnificados para coordinar ayuda efectiva tras el terremoto de Venezuela.

- **No recolecta ni gestiona donaciones directamente** — todo es manejado por terceros (organizaciones, voluntarios).
- **Enfoque en logística**: viajes, transporte, hospedaje, insumos, empleos.
- **i18n**: 7 idiomas — español, inglés, francés, italiano, alemán, portugués, árabe.

### Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (Turbopack) |
| UI | Tailwind CSS 4 + shadcn/ui (base-nova) |
| Estado global | Zustand |
| Formularios | react-hook-form + zod |
| Mapas | react-leaflet + Leaflet |
| Geocoding | @turf/turf (distancia) + Nominatim (coordenadas) |
| Backend | Supabase self-hosted |
| Auth | Supabase Auth (service role para admin) |
| Tiempo real | Supabase Realtime (chats) |
| Bots | n8n → webhooks Telegram/WhatsApp |
| Despliegue | Nixpacks via Dokploy |

---

## 2. Roles del Sistema

Cada usuario se registra con un rol. El rol determina qué tabs ve en el dashboard y qué acciones puede realizar.

| Rol | Descripción | Tabs en perfil |
|---|---|---|
| `damnificado` | Víctima del terremoto que necesita ayuda | Perfil, Publicaciones, Ayuda Asignada, Conexiones, Mensajes |
| `transportista` | Persona que ofrece transporte de personas/carga | + Solicitudes Disponibles |
| `voluntario` | Voluntario civil. Subtipos: `hospedaje`, `gestion`, `ambos` | + Solicitudes Disponibles, + Tareas de gestión (si aplica) |
| `anfitrion` | Ofrece hospedaje temporal | Perfil, Publicaciones, Conexiones, Mensajes |
| `donante` | Donante que apoya la plataforma | Perfil, Publicaciones, Conexiones, Mensajes |
| `organizacion` | Organización civil con miembros | + Organización (dashboard, miembros) |
| `admin` | Administrador del sistema | + Admin (panel de moderación) |

### Voluntario — subtipos

- **`hospedaje`**: se enfoca en ofrecer alojamiento a damnificados.
- **`gestion`**: ayuda a validar información, gestionar mensajes y coordinar la logística de viajes y reasentamiento.
- **`ambos`**: realiza ambas funciones.

El subtipo se selecciona al registrarse cuando el rol es `voluntario`.

---

## 3. Estructura del Sitio — Rutas

### Públicas (sin autenticación)

| Ruta | Propósito |
|---|---|
| `/` | Landing page con stats (viajes, transportistas, voluntarios, organizaciones) y hero |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro con selector de rol y tipo de voluntario |
| `/donar` | Información de donación para mantenimiento de la plataforma + enlace PayPal |
| `/empiezo-desde-cero` | Sección exclusiva para damnificados (ver sección 5) |
| `/empiezo-desde-cero/asistencia` | Formulario multi-paso con asistencia IA |
| `/empiezo-desde-cero/solicitar-viaje` | Solicitud de viaje avanzada |
| `/explorar` | Mapa interactivo con solicitudes de viaje y ofertas de transporte |
| `/empleos` | Listado de empleos publicados por empresas |
| `/empleos/[id]` | Detalle de un empleo |
| `/ofrecer-transporte` | Formulario para ofrecer transporte |
| `/ofrecer-hospedaje` | Formulario para ofrecer hospedaje |
| `/ofrecer-insumos` | Formulario para ofrecer donaciones físicas / insumos |
| `/donaciones-fisicas` | Listado de donaciones físicas |
| `/donaciones-fisicas/[id]` | Detalle de una donación física |
| `/recursos` | Recursos descargables (guías, documentos) |
| `/sobre-nosotros` | Información de la plataforma |
| `/terminos-de-uso` | Términos legales |
| `/contacto` | Página de contacto |
| `/empresas/registro` | Registro de empresa |

### Requieren autenticación

| Ruta | Propósito |
|---|---|
| `/perfil` | Dashboard unificado con tabs según el rol (ver sección 4) |
| `/perfil?tab=...` | Tab específico del dashboard |
| `/solicitar-viaje` | Formulario de solicitud de viaje (versión simple) |
| `/matches` | Redirige a `/perfil?tab=conexiones` |
| `/empresas/dashboard` | Redirige a `/perfil?tab=empresa` |

### Solo admin

| Ruta | Propósito |
|---|---|
| `/admin` | Panel de administración con moderación de contenido |

### API Routes

| Ruta | Método | Propósito |
|---|---|---|
| `/api/auth/register` | POST | Registro con service role (admin.createUser) |
| `/api/forms` | POST | Envío genérico de formularios |
| `/api/matches` | POST | Tomar una solicitud de viaje (crear match) |
| `/api/messages` | POST | Enviar mensaje en un match |
| `/api/route-segments` | POST | Crear segmento de ruta (tramo) |
| `/api/organizations` | GET, POST | Listar / crear organización |
| `/api/organizations/members` | POST | Agregar miembro a organización |
| `/api/webhooks/telegram` | POST | Webhook de Telegram (n8n) |
| `/api/webhooks/whatsapp` | POST | Webhook de WhatsApp (n8n) |

---

## 4. Dashboard `/perfil`

Dashboard unificado con tabs. El tab activo se controla via `?tab=` en la URL y un **estado local** que garantiza feedback visual inmediato al hacer clic.

### Tabs disponibles por rol

| Tab | Roles | Descripción |
|---|---|---|
| Perfil | Todos | Resumen con contadores de publicaciones + tareas de gestión (solo voluntarios gestión) |
| Mis Publicaciones | Todos | Lista de solicitudes de viaje, transporte y hospedaje del usuario |
| Solicitudes Disponibles | transportista, voluntario | Solicitudes abiertas filtradas por zona + botón "Tomar solicitud" con diálogo de tramos |
| Ayuda Asignada | damnificado | Transportistas que tomaron su solicitud, con desglose de segmentos |
| Conexiones | Todos | Matches del usuario (como transportista o damnificado) |
| Empresa | empresa (dueño) | Panel de empleos: crear, listar, cerrar |
| Organización | organizacion | Crear org, ver miembros, invitar por email, dashboard de ayudas |
| Mensajes | Todos | Chat entre partes de un match |

### Funcionamiento del tab activo

1. Al cargar la página, se lee `?tab=` de la URL y se establece el estado local `localTab`.
2. Al hacer clic en un tab, `setLocalTab()` se ejecuta **inmediatamente** (feedback visual instantáneo) y luego `router.replace()` actualiza la URL.
3. Los componentes que se renderizan dependen de `localTab || computedActiveTab`.

---

## 5. Empiezo Desde Cero

Sección dedicada exclusivamente a **damnificados del terremoto de La Guaira y personas en campamentos**. Ellos mismos o un voluntario pueden registrarlos.

### `/empiezo-desde-cero` (página principal)

- Hero con logo y descripción.
- **24 tarjetas de estado** expandibles con:
  - Nombre del estado y capital.
  - Al expandir: listado de ciudades con sus alojamientos disponibles (desde `housing_offers`).
  - Buscador en tiempo real por nombre de estado o capital.
- **Timeline de reasentamiento**: 6 pasos visuales (Registro → Evaluación → Asignación → Traslado → Estabilización → Reasentamiento).
- Llamados a la acción: Asistencia IA y Solicitar Viaje.

### `/empiezo-desde-cero/asistencia` (Asistencia IA)

Formulario multi-paso que recolecta:

1. **Datos personales**: nombre, edad, teléfono, lugar de origen.
2. **Familiares y situación**: integrantes, familiares fallecidos.
3. **Tipo de ayuda**: selección múltiple (trabajo, económica, médica, psicológica, alimentación, vivienda, transporte, legal).
4. **Estado de la vivienda**: destruida, dañada, habitable, intacta, desconocido + información adicional.

Los datos se envían a `/api/forms` para que un voluntario de gestión los revise. El asistente IA (n8n) se desplegará como un widget o página externa conectada a este flujo.

### `/empiezo-desde-cero/solicitar-viaje` (Solicitud avanzada)

Formulario con:

- Nombre y teléfono (opcionales).
- **Origen**: selector de estado + ciudad (cargado desde Supabase tabla `estados`).
- **Destino**: selector de estado + ciudad.
- **Pasajeros**: cantidad, checkboxes para niños, adultos mayores, discapacitados.
- **Necesidades de salud**: textarea para condiciones médicas.
- **Notas adicionales**.

---

## 6. Sistema de Organizaciones

### Tablas

- **`organizations`**: id, name, description, contact_email, contact_phone, logo_url, admin_id (FK a profiles), status, created_at.
- **`organization_members`**: id, organization_id (FK), member_id (FK), role (admin|member), status (active|invited), UNIQUE(org+member).

### Flujo

1. Un usuario se registra con rol `organizacion`.
2. En el tab "Organización" del perfil, si no tiene org, ve un formulario para **crear una**.
3. Al crear, el usuario queda como **admin** de la organización.
4. El admin puede **invitar miembros** por email desde el panel.
5. Los miembros invitados deben existir como usuarios en la plataforma.

### API

- `POST /api/organizations` — crear org (body: name, description, contact_email, contact_phone).
- `GET /api/organizations` — obtener org del usuario + miembros.
- `POST /api/organizations/members` — agregar miembro (body: organization_id, member_email, role).

---

## 7. Sistema de Rutas y Mapas

### Solicitudes de viaje (`travel_requests`)

Un damnificado crea una solicitud con origen, destino, cantidad de personas y notas. Estado inicial: `open`.

### Ofertas de transporte (`transport_offers`)

Un transportista registra su ruta habitual. Sirve para filtrar solicitudes disponibles por zona.

### Matches (`matches`)

Cuando un transportista toma una solicitud, se crea un match. Estado: `pending` → `confirmed` → `completed`.

### Segmentos de ruta (`route_segments`)

Si la ruta completa no puede ser cubierta por un solo transportista, se pueden crear **tramos**:

- Cada transportista elige si lleva la ruta completa o solo un tramo (origen→destino intermedio).
- La distancia se calcula con `@turf/turf` (línea recta entre coordenadas de ciudades).
- Cuando todos los tramos cubren la ruta completa, el estado cambia a `confirmed`.

### Diálogo de tramos (en Solicitudes Disponibles)

Al hacer clic en "Tomar solicitud":

1. Se abre un diálogo modal con la información de la ruta.
2. Opciones:
   - **"Llevar toda la ruta"**: crea un segmento que cubre origen→destino completo.
   - **"Llevar solo un tramo"**: dropdowns para seleccionar ciudad origen y destino del tramo.
3. Al confirmar, se llama a `POST /api/route-segments`.

### Mapa (`/explorar`)

- Muestra marcadores de solicitudes de viaje y ofertas de transporte.
- **Marcador origen**: círculo verde sólido.
- **Marcador destino**: círculo blanco con borde verde (si tiene destino).
- **Polyline**: línea punteada verde entre origen y destino.
- Coordenadas a nivel de ciudad (vía `getCityCoord()`) con fallback a coordenadas de estado.
- Jitter aleatorio para evitar superposición de marcadores.

---

## 8. Mensajería

Chat entre las partes de un match (transportista ↔ damnificado).

- **Tabla `messages`**: id, match_id, sender_id, content, created_at.
- **RLS**: solo participantes del match pueden leer. Solo el sender puede insertar.
- **Realtime**: habilitado via `supabase_realtime` para mensajes en vivo.
- **API**: `POST /api/messages` (service role).
- **UI**: selector de conversación + burbujas de chat + input.

---

## 9. Admin

Panel de moderación y monitoreo (solo rol `admin`).

### Estadísticas (barra superior)

| Stat | Fuente |
|---|---|
| Viajes | `travel_requests` |
| Transporte | `transport_offers` |
| Hospedaje | `housing_offers` |
| Empresas | `companies` |
| Insumos | `supplies` |
| Empleos | `jobs` |

### Tabs de moderación

| Tab | Acciones disponibles |
|---|---|
| Viajes | Aprobar (→ matched), Rechazar (→ cancelled), Completar (→ completed) |
| Transporte | Ídem |
| Hospedaje | Ídem |
| Empresas | Aprobar (→ active), Rechazar (→ inactive), Desactivar |
| Insumos | Solo vista (sin acciones) |
| Empleos | Solo vista (sin acciones) |

---

## 10. Base de Datos (Supabase)

### Tablas principales

| Tabla | Propósito |
|---|---|
| `profiles` | Perfiles de usuario (id, name, email, phone, role, volunteer_type) |
| `travel_requests` | Solicitudes de viaje de damnificados |
| `transport_offers` | Ofertas de transporte de transportistas |
| `housing_offers` | Ofertas de hospedaje de anfitriones |
| `matches` | Relación entre solicitud y transportista |
| `messages` | Mensajes de chat por match |
| `route_segments` | Tramos de ruta con distancias y transportistas |
| `organizations` | Organizaciones civiles |
| `organization_members` | Miembros de organizaciones |
| `city_coords` | Coordenadas de ciudades (geocoding cache) |
| `companies` | Empresas registradas |
| `jobs` | Empleos publicados por empresas |
| `supplies` | Insumos y donaciones físicas |
| `reviews` | Reseñas entre usuarios |
| `estados` | Estados de Venezuela con municipios, ciudades y coordenadas |
| `graphics` | Diseños gráficos subidos |
| `donation_settings` | Configuración de métodos de pago (legacy) |

### RLS (Row Level Security)

Cada tabla tiene políticas RLS que restringen acceso según `auth.uid()`:

- **`profiles`**: el usuario solo ve/modifica su propio perfil.
- **`travel_requests`**, **`transport_offers`**, **`housing_offers`**: lectura pública (status=open), escritura solo del dueño.
- **`matches`**: visible para el transportista y el damnificado de la solicitud.
- **`messages`**: visible para participantes del match.
- **`route_segments`**: visible para el transportista del segmento y el damnificado de la solicitud.
- **`organizations`**: visible para el admin y miembros de la org.
- **`organization_members`**: visible para el miembro y el admin de la org.

### Archivos SQL (locales, no se suben al repo)

Los archivos en `supabase/*.sql` y `scripts/geocode-cities.mjs` son **locales** y se ejecutan directamente en Supabase Studio. No forman parte del repositorio (`.gitignore` los excluye).

---

## 11. Traducciones (i18n)

### Idiomas

| Código | Idioma | Archivo |
|---|---|---|
| `es` | Español | `messages/es.json` |
| `en` | English | `messages/en.json` |
| `fr` | Français | `messages/fr.json` |
| `it` | Italiano | `messages/it.json` |
| `de` | Deutsch | `messages/de.json` |
| `pt` | Português | `messages/pt.json` |
| `ar` | العربية | `messages/ar.json` |

### Estructura de keys

```json
{
  "nav": { "solicitarViaje": "...", "ofrecerTransporte": "...", ... },
  "home": { "heroDesc": "...", "statsViajes": "...", ... },
  "auth": { "register": "...", "roleVoluntario": "...", ... },
  "common": { "error": "...", "loading": "...", "success": "...", ... },
  "donate": { "title": "...", ... },
  "travelRequest": { "title": "...", ... },
  "jobs": { "title": "...", ... },
  "supplies": { "title": "...", ... }
}
```

### Cómo agregar un nuevo key de traducción

1. Agregar el key con su valor en **los 7 archivos** `messages/*.json`.
2. Usar `useTranslations("namespace")` en el componente para accederlo.
3. Mantener consistencia: mismo nombre de key en todos los idiomas.

---

## 12. Desarrollo Local

### Variables de entorno (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=http://backend.desdecerovenezuela.org:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Iniciar servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Linter |

### Notas técnicas

- Supabase está **self-hosted** en `http://backend.desdecerovenezuela.org:8000` (HTTP, no HTTPS).
- El service role key permite operaciones admin (crear usuarios, insertar con RLS bypass).
- `@turf/turf` usa **named exports**: `import { distance } from "@turf/turf"`, no default import.
- Los formularios requieren **autenticación** — no hay fallback anónimo.
- Los archivos SQL se ejecutan **manualmente** en Supabase Studio (no hay migraciones automáticas).
- La rama principal es `logica`. Los pushes van a `origin/logistica`.

---

## 13. Componentes Reutilizables

| Componente | Ubicación | Propósito |
|---|---|---|
| `StateCard` | `components/empiezo-desde-cero/state-card.tsx` | Tarjeta expandible de estado con ciudades y alojamientos |
| `Timeline` | `components/empiezo-desde-cero/timeline.tsx` | Timeline visual de reasentamiento |
| `MapView` | `components/maps/map-view.tsx` | Mapa Leaflet con marcadores y polilíneas |
| `SolicitudesPanel` | `app/[locale]/perfil/solicitudes-panel.tsx` | Lista de solicitudes con diálogo de tramos |
| `MensajesPanel` | `app/[locale]/perfil/mensajes-panel.tsx` | Chat entre partes de un match |
| `EmpresaPanel` | `app/[locale]/perfil/empresa-panel.tsx` | Dashboard de empresa (empleos) |
| `TravelRequestForm` | `components/forms/travel-request/form.tsx` | Formulario de solicitud de viaje |
| `LanguageSwitcher` | `components/shared/language-switcher.tsx` | Selector de idioma |
| `ThemeToggle` | `components/shared/theme-toggle.tsx` | Cambio de tema claro/oscuro |

---

## 14. Convenciones de Código

- **Estilo**: Tailwind CSS 4 con colores personalizados (sage green `#6B8F71`, warm brown `#A0845C`, natural cream `#F4F1EA`).
- **Componentes**: shadcn/ui con base-nova.
- **Formularios**: react-hook-form + zod para validación.
- **API routes**: service role para operaciones que requieren RLS bypass.
- **Tipos**: TypeScript estricto. Evitar `any`. Usar `never as` para casts de Supabase queries cuando sea necesario.
- **Archivos SQL**: No se suben al repo (`.gitignore`). Se ejecutan localmente en Supabase Studio.
