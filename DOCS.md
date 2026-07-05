# Logística Terremoto — Documentación Completa

> Plataforma de **logística civil** que conecta voluntarios, organizaciones y damnificados para coordinar ayuda efectiva tras el terremoto de Venezuela.

---

## Parte I — Para Usuarios

---

### 1. Visión General

**Logística Terremoto** es una plataforma que organiza la ayuda humanitaria conectando a quienes necesitan asistencia con quienes pueden brindarla. No almacena ni distribuye donaciones directamente — todo es gestionado por terceros (organizaciones, voluntarios, transportistas, anfitriones).

#### ¿Qué resuelve?

- Un damnificado necesita salir de su ciudad y no tiene medios de transporte.
- Un transportista tiene espacio en su vehículo y quiere ayudar.
- Un voluntario quiere gestionar la logística entre ambos.
- Una organización necesita coordinar a sus miembros para dar seguimiento a las ayudas.

La plataforma pone a estas personas en contacto y gestiona el ciclo completo: solicitud → match → ruta → seguimiento.

#### ¿Qué NO hace?

- No recolecta dinero para damnificados (solo recibe donaciones para su propio mantenimiento vía PayPal).
- No almacena ni distribuye alimentos, ropa, medicinas ni ningún bien físico.
- No ofrece servicios médicos ni de rescate.
- No es una red social — es una herramienta de coordinación logística.

---

### 2. Roles del Sistema

Cada usuario elige un rol al registrarse. El rol determina qué puede ver y hacer en la plataforma.

| Rol | ¿Quién es? | ¿Qué puede hacer? |
|-----|-----------|-------------------|
| **Damnificado** | Víctima del terremoto que necesita ayuda para reubicarse | Solicitar viaje, ver ayuda asignada, chatear con transportistas |
| **Transportista** | Persona con vehículo que ofrece transporte de personas o carga | Crear ofertas de transporte, tomar solicitudes (completas o por tramos), chatear |
| **Voluntario** | Persona que quiere ayudar en la gestión logística | Gestionar solicitudes, validar información, coordinar viajes, ofrecer hospedaje (subtipo) |
| **Anfitrión** | Persona que ofrece hospedaje temporal a damnificados | Publicar ofertas de hospedaje, recibir damnificados |
| **Organización** | ONG, fundación o grupo civil organizado | Crear organización, invitar miembros, dashboard de ayudas |
| **Donante** | Persona que apoya económicamente el mantenimiento de la plataforma | Accede a información de donación (PayPal) |
| **Admin** | Administrador del sistema | Moderar contenido, gestionar todas las entidades |

#### Voluntario — Subtipos

Al registrarse como voluntario, se debe elegir un subtipo:

| Subtipo | Enfoque |
|---------|---------|
| `hospedaje` | Ofrecer alojamiento a damnificados |
| `gestion` | Validar información, gestionar mensajes, coordinar logística de viajes |
| `ambos` | Realiza ambas funciones |

Los voluntarios de tipo `gestion`/`ambos` ven tareas adicionales en su perfil: solicitudes pendientes de validar, mensajes sin leer, coordinación de reasentamiento.

---

### 3. Flujos de Usuario por Rol

#### Damnificado

```
Registro (rol: damnificado)
  │
  ├─→ /empiezo-desde-cero  (explorar ciudades, alojamientos, timeline)
  │     ├─→ Asistencia IA (formulario multi-paso)
  │     └─→ Solicitar Viaje (origen, destino, pasajeros, salud)
  │
  ├─→ /solicitar-viaje (versión simple)
  │
  └─→ /perfil
        ├─ Tab "Mis Publicaciones" → ver mis solicitudes
        ├─ Tab "Ayuda Asignada" → ver transportista asignado, ruta, contacto
        ├─ Tab "Conexiones" → historial de matches
        └─ Tab "Mensajes" → chatear con transportista/voluntario
```

**Ciclo completo:**

1. Te registras como damnificado.
2. Entras a Empiezo Desde Cero y llenas el formulario de Asistencia IA (opcional) o vas directo a Solicitar Viaje.
3. Completas tu solicitud con origen, destino, cuántas personas viajan, necesidades de salud.
4. Tu solicitud aparece como "disponible" para transportistas y voluntarios.
5. Cuando un transportista toma tu solicitud (o un tramo), recibes notificación.
6. Ves los datos del transportista en "Ayuda Asignada" y pueden chatear.
7. El viaje se realiza y el transportista marca como completado.

#### Transportista

```
Registro (rol: transportista)
  │
  ├─→ /ofrecer-transporte (crear oferta con ruta, capacidad, fechas)
  │
  └─→ /perfil
        ├─ Tab "Mis Publicaciones" → mis ofertas de transporte
        ├─ Tab "Solicitudes Disponibles" → solicitudes abiertas en tu zona
        │     └─ Botón "Tomar solicitud"
        │           ├─ "Llevar toda la ruta" (origen → destino completo)
        │           └─ "Llevar solo un tramo" (seleccionar origen/destino del tramo)
        ├─ Tab "Conexiones" → historial de matches
        └─ Tab "Mensajes" → chatear con damnificados
```

**Ciclo completo:**

1. Te registras como transportista y creas una o más ofertas de transporte.
2. En "Solicitudes Disponibles" ves las solicitudes abiertas filtradas por tus rutas.
3. Ves una solicitud que puedes cubrir. Haces clic en "Tomar solicitud".
4. Eliges: llevas la ruta completa o solo un tramo (si otro transportista cubre el resto).
5. Se crea el match y el segmento de ruta.
6. Chateas con el damnificado para coordinar detalles.
7. Completas el viaje.

#### Voluntario (gestión)

```
Registro (rol: voluntario, subtipo: gestion/ambos)
  │
  └─→ /perfil
        ├─ Tab "Perfil" → Tareas de gestión (solicitudes pendientes, mensajes, logística)
        ├─ Tab "Solicitudes Disponibles" → revisar y validar solicitudes
        ├─ Tab "Conexiones" → seguimiento de matches
        └─ Tab "Mensajes" → comunicación con todas las partes
```

**Ciclo completo:**

1. Te registras como voluntario con subtipo `gestion`.
2. En tu perfil ves las tareas pendientes: solicitudes por validar, mensajes sin leer.
3. Revisas las solicitudes de viaje, validas la información.
4. Coordinas con transportistas y damnificados para asegurar que los viajes se concreten.
5. Das seguimiento al reasentamiento de las familias.

#### Anfitrión

```
Registro (rol: anfitrion)
  │
  ├─→ /ofrecer-hospedaje (crear oferta: ubicación, capacidad, comodidades)
  │
  └─→ /perfil
        └─ Tab "Mis Publicaciones" → ver mis ofertas de hospedaje
```

#### Organización

```
Registro (rol: organizacion)
  │
  └─→ /perfil
        └─ Tab "Organización"
              ├─ Si no tienes org: botón "Crear Organización"
              │     └─ Formulario: nombre, descripción, contacto
              └─ Si tienes org: dashboard con miembros y ayudas
                    ├─ Lista de miembros con roles
                    ├─ Invitar nuevo miembro por email
                    └─ Estadísticas de ayudas activas
```

---

### 4. Guía de Funciones Clave

#### 4.1 Empiezo Desde Cero (`/empiezo-desde-cero`)

Sección diseñada para damnificados del terremoto. Incluye:

- **24 tarjetas de estado**: expandibles, muestran capital + ciudades con alojamientos disponibles. Incluye buscador en tiempo real.
- **Timeline de reasentamiento**: 6 pasos visuales — Registro → Evaluación → Asignación → Traslado → Estabilización → Reasentamiento.
- **CTAs**: botones a Asistencia IA y Solicitar Viaje.

#### 4.2 Asistencia IA (`/empiezo-desde-cero/asistencia`)

Formulario multi-paso para damnificados que no saben por dónde empezar:

1. **Datos personales**: nombre, edad, teléfono, lugar de origen.
2. **Familiares**: cuántos integrantes, si hubo fallecidos.
3. **Tipo de ayuda**: trabajo, económica, médica, psicológica, alimentación, vivienda, transporte, legal.
4. **Estado de vivienda**: destruida, dañada, habitable, intacta — más información adicional.

Los datos quedan registrados para que un voluntario de gestión les dé seguimiento.

#### 4.3 Solicitar Viaje (`/solicitar-viaje` y `/empiezo-desde-cero/solicitar-viaje`)

Dos formularios para crear una solicitud de viaje:

| Versión | Ruta | Características |
|---------|------|-----------------|
| Simple | `/solicitar-viaje` | Formulario rápido con react-hook-form + zod |
| Avanzada | `/empiezo-desde-cero/solicitar-viaje` | Selectores estado/ciudad, pasajeros (niños, adultos mayores, discapacitados), salud, notas |

Ambos envían los datos a `POST /api/forms` con `type: "travel_request"`.

#### 4.4 Dashboard (`/perfil`)

Panel unificado con tabs según el rol del usuario:

| Tab | Visible para | Qué muestra |
|-----|-------------|-------------|
| Perfil | Todos | Resumen: contador de publicaciones, tareas de gestión (voluntarios) |
| Mis Publicaciones | Todos | Lista de solicitudes de viaje, transporte y hospedaje |
| Solicitudes Disponibles | transportista, voluntario | Solicitudes abiertas filtradas por zona + botón "Tomar solicitud" |
| Ayuda Asignada | damnificado | Transportista que tomó tu solicitud + desglose de tramos + contacto |
| Conexiones | Todos | Historial de matches como transportista o damnificado |
| Empresa | empresa (dueño) | Panel de empleos: crear, listar, cerrar |
| Organización | organizacion | Crear org, ver miembros, invitar, dashboard |
| Mensajes | Todos | Chat entre partes de un match |

**Cómo funciona el tab activo:**
1. La URL determina el tab inicial (`?tab=solicitudes`).
2. Al hacer clic en un tab, el cambio es instantáneo (estado local) y luego se actualiza la URL.
3. Si entras directo a una URL con `?tab=`, se abre ese tab directamente.

#### 4.5 Mapa (`/explorar`)

Mapa interactivo con Leaflet que muestra:

- **Solicitudes de viaje**: marcador origen (círculo verde) y destino (círculo blanco borde verde), polyline entre ambos.
- **Ofertas de transporte**: marcadores individuales con información de ruta.
- **Ofertas de hospedaje**: marcadores con datos del alojamiento.
- Coordenadas precisas a nivel de ciudad (vía `getCityCoord()`), con fallback a coordenadas del estado.

#### 4.6 Tramos de Ruta

Cuando un transportista toma una solicitud, puede elegir:

- **Ruta completa**: cubre el origen → destino completo de la solicitud.
- **Tramo personalizado**: selecciona un origen y destino intermedio (ej: lleva de Ciudad A a Ciudad B, y otro transportista lleva de B a C).

Cuando todos los tramos cubren la ruta completa, el estado de la solicitud cambia a "matched".

#### 4.7 Mensajería

Chat en tiempo real entre las partes de un match:

1. Ve al tab "Mensajes" en tu perfil.
2. Selecciona la conversación (match).
3. Envía y recibe mensajes al instante.

---

### 5. Glosario

| Término | Significado |
|---------|-------------|
| **Damnificado** | Persona afectada por el terremoto que necesita ayuda para reubicarse o recibir asistencia |
| **Transportista** | Persona con vehículo que ofrece llevar personas o carga |
| **Voluntario** | Persona que ayuda en la gestión logística de la plataforma |
| **Anfitrión** | Persona que ofrece alojamiento temporal en su vivienda |
| **Organización** | ONG, fundación o grupo civil registrado en la plataforma |
| **Match** | Vinculación entre una solicitud de viaje y un transportista que la toma |
| **Segmento / Tramo** | Parte de una ruta cubierta por un transportista específico |
| **Ruta completa** | Viaje que cubre el origen y destino original de la solicitud |
| **Solicitud abierta** | Solicitud de viaje aún no tomada por ningún transportista |
| **Service role** | Clave especial de Supabase que permite operaciones administrativas (crear usuarios, bypass de RLS) |
| **RLS** | Row Level Security — políticas de seguridad a nivel de fila en Supabase |

---

### 6. Preguntas Frecuentes (FAQ)

**¿La plataforma cobra por usar el servicio?**
No. Es completamente gratuita para damnificados, transportistas, voluntarios, anfitriones y organizaciones.

**¿Puedo donar dinero a los damnificados?**
No directamente. La plataforma no recolecta dinero para damnificados. Solo recibe donaciones para su propio mantenimiento técnico a través de PayPal.

**¿Necesito registrarme para solicitar un viaje?**
Sí. Todos los formularios requieren autenticación. El registro es gratuito y rápido.

**¿Qué pasa después de enviar una solicitud de viaje?**
Tu solicitud aparece en "Solicitudes Disponibles" para transportistas y voluntarios. Cuando alguien la toma, recibirás notificación y podrás ver sus datos de contacto.

**¿Puedo tomar solo un tramo del viaje?**
Sí. Al hacer clic en "Tomar solicitud", puedes elegir entre "Llevar toda la ruta" o "Llevar solo un tramo" (seleccionando origen y destino intermedio).

**¿Cómo sé que un transportista es confiable?**
La plataforma muestra el nombre y teléfono del transportista. Los usuarios pueden chatear antes del viaje para coordinar. No hay un sistema de verificación de identidad — recomendamos tomar precauciones.

**¿Puedo registrarme con varios roles?**
No. Cada cuenta tiene un solo rol. Si necesitas múltiples roles, crea cuentas separadas.

**¿Cómo agrego miembros a mi organización?**
En el tab "Organización" de tu perfil, una vez creada la organización, verás la opción "Agregar miembro". Ingresa el email del miembro (debe estar registrado en la plataforma).

**¿Los datos se guardan de forma segura?**
Sí. La autenticación usa Supabase Auth. Las contraseñas se almacenan hasheadas. Las políticas RLS restringen el acceso a los datos según el usuario.

**¿Puedo eliminar mi cuenta?**
Actualmente no hay un botón de auto-eliminación. Contacta al administrador para solicitar la baja.

**¿En qué idiomas está disponible?**
7 idiomas: español, inglés, francés, italiano, alemán, portugués y árabe. Puedes cambiar el idioma desde el selector en la barra de navegación.

---

## Parte II — Para Desarrolladores

---

### 7. Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                     Cliente Web                          │
│  Next.js 16 (React 19) — Turbopack                      │
│  Tailwind 4 + shadcn/ui (@base-ui/react)                │
│  maplibre-gl (MapLibre GL JS)                           │
│  react-hook-form + zod                                  │
│  next-intl (i18n)                                       │
│  sonner (toasts)                                        │
│  next-themes (dark/light)                               │
└────────────┬───────────────────────────────┬────────────┘
             │ pages (SSR/CSR)               │ API routes
             ▼                               ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  app/[locale]/*          │  │  app/api/*               │
│  - Páginas públicas      │  │  - auth/register         │
│  - Dashboard /perfil     │  │  - forms                 │
│  - Empiezo Desde Cero    │  │  - messages              │
│  - Mapa /explorar        │  │  - organizations         │
│                          │  │  - route-segments        │
│  Auth: getSupabase()     │  │  - webhooks/*            │
│  (anon key + RLS)        │  │                          │
│                          │  │  Auth: getServiceSupabase│
│                          │  │  (service role — RLS     │
│                          │  │   bypass)                │
└────────────┬─────────────┘  └───────────┬──────────────┘
             │                             │
             ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase (self-hosted)                      │
│  http://backend.desdecerovenezuela.org:8000             │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Auth        │  │ PostgreSQL   │  │ Realtime       │ │
│  │ (users)     │  │ (17 tablas)  │  │ (chats)        │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│  Servicios Docker Internos                              │
│  │  Valhalla (ruteo, puerto 8002)                       │
│  │  tileserver-gl (tiles vectoriales, puerto 8080)       │
│  └──────────────────────────────────────────────────────┘
│              │
│              ▼
│  n8n (automatización / bots)                            │
│                                                         │
│  Telegram Webhook ← → POST /api/webhooks/telegram      │
│  WhatsApp Webhook ← → POST /api/webhooks/whatsapp      │
└─────────────────────────────────────────────────────────┘
```

#### Proxy.ts y Middleware

El archivo `proxy.ts` define una función `proxy()` para redirección por idioma basada en el header `Accept-Language`. Sin embargo, **no está conectado como middleware** — no existe un `middleware.ts` que lo exporte. La detección de idioma funciona a través de `next-intl`, que recibe el locale desde el parámetro `requestLocale` de la URL (ej: `/es/...`, `/en/...`).

Si se desea activar la redirección automática de `/ruta` → `/{locale}/ruta`, se debe crear un archivo `middleware.ts` en la raíz:

```ts
export { proxy as middleware } from "./proxy"
```

---

### 8. Estructura del Proyecto

```
logistica_terremoto/
├── app/
│   ├── api/
│   │   ├── auth/register/     # POST - registro con service role
│   │   ├── forms/             # POST - envío genérico de formularios
│   │   ├── messages/          # POST - enviar mensaje en match
│   │   ├── organizations/     # GET/POST - crear/listar org
│   │   │   └── members/       # POST - agregar miembro
│   │   ├── route-segments/    # POST - crear segmento de ruta
│   │   ├── map/[...path]/     # GET - proxy tileserver-gl (tiles, style.json)
│   │   ├── map/[...path]/   # GET - proxy tileserver (style.json + tiles)
│   │   └── webhooks/
│       ├── telegram/      # POST - webhook Telegram (n8n)
│       └── whatsapp/      # POST - webhook WhatsApp (n8n)
│   ├── [locale]/
│   │   ├── layout.tsx         # Layout con Navbar, Footer, Toaster
│   │   ├── page.tsx           # Homepage
│   │   ├── admin/             # Panel de administración
│   │   ├── auth/
│   │   │   ├── login/         # Inicio de sesión
│   │   │   └── register/      # Registro
│   │   ├── contacto/
│   │   ├── donar/             # Donación para mantenimiento
│   │   ├── donaciones-fisicas/ # Listado y detalle de insumos
│   │   ├── empiezo-desde-cero/ # Sección damnificados
│   │   │   ├── asistencia/    # Formulario multi-paso IA
│   │   │   └── solicitar-viaje/ # Solicitud avanzada
│   │   ├── empleos/           # Listado y detalle de empleos
│   │   ├── empresas/
│   │   │   ├── dashboard/     # Redirige a /perfil?tab=empresa
│   │   │   └── registro/      # Registro de empresa
│   │   ├── explorar/          # Mapa interactivo
│   │   ├── matches/           # Redirige a /perfil?tab=conexiones
│   │   ├── ofrecer-hospedaje/
│   │   ├── ofrecer-insumos/
│   │   ├── ofrecer-transporte/
│   │   ├── perfil/            # Dashboard unificado (8 tabs)
│   │   │   ├── empresa-panel.tsx
│   │   │   ├── mensajes-panel.tsx
│   │   │   └── solicitudes-panel.tsx
│   │   ├── recursos/          # Recursos descargables
│   │   ├── sobre-nosotros/
│   │   ├── solicitar-viaje/
│   │   └── terminos-de-uso/
│   ├── globals.css
│   ├── layout.tsx             # Root layout (Geist fonts, ThemeProvider)
│   └── not-found.tsx          # Global 404
│
├── components/
│   ├── empiezo-desde-cero/
│   │   ├── state-card.tsx     # Tarjeta expandible de estado
│   │   └── timeline.tsx       # Timeline 6 pasos reasentamiento
│   ├── forms/
│   │   ├── housing-offer/     # Formulario oferta hospedaje
│   │   ├── job/               # Formulario empleo (diálogo)
│   │   ├── shared/            # form-section, option-card
│   │   ├── transport-offer/   # Formulario oferta transporte
│   │   └── travel-request/    # Formulario solicitud viaje
│   ├── layout/
│   │   ├── navbar/            # Navbar + mobile menu + dropdowns
│   │   └── footer.tsx
│   ├── maps/
│   │   └── map-view.tsx       # Mapa MapLibre con marcadores/polylines (imperativo)
│   ├── shared/
│   │   ├── community-stats-bar.tsx
│   │   ├── field-styles.ts
│   │   ├── language-switcher.tsx
│   │   ├── page-hero.tsx
│   │   ├── stats-bar.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   └── ui/                    # shadcn/ui primitives (@base-ui/react)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── password-input.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
│
├── lib/
│   ├── auth.ts                # loginUser(), registerUser()
│   ├── community-stats.ts     # useCommunityStats()
│   ├── contact-info.ts        # WHATSAPP_NUMBER, CONTACT_EMAIL
│   ├── estados.ts             # getEstados(), getCityCoord(), useEstados()
│   ├── supabase.ts            # getSupabase(), getServiceSupabase(), TABLES, Role
│   ├── utils.ts               # cn()
│   ├── forms/
│   │   ├── constants.ts       # VEHICLE_TYPES, etc.
│   │   └── submit.ts          # submitHousingOffer(), etc.
│   └── schemas/               # Zod schemas por feature
│       ├── auth.ts
│       ├── company.ts
│       ├── housing-offer.ts
│       ├── job.ts
│       ├── review.ts          # Schema residual (sin componente que lo use)
│       ├── supply.ts
│       ├── transport-offer.ts
│       └── travel-request.ts
│
├── messages/                  # 7 archivos de traducción
│   ├── es.json
│   ├── en.json
│   ├── fr.json
│   ├── it.json
│   ├── de.json
│   ├── pt.json
│   └── ar.json
│
├── i18n/
│   └── request.ts             # Config next-intl: locale → messages
│
├── public/                    # Assets estáticos
│
├── proxy.ts                   # Función de redirección i18n (no conectada como middleware)
├── next.config.ts             # withNextIntlPlugin
├── components.json            # Config shadcn/ui
├── package.json               # Dependencias
└── tsconfig.json
```

---

### 9. Base de Datos (Supabase)

#### 9.1 Esquema de Tablas

| # | Tabla | Propósito | Columnas clave |
|---|-------|-----------|----------------|
| 1 | `profiles` | Perfiles de usuario | id (FK auth.users), name, email, phone, role, volunteer_type, created_at |
| 2 | `travel_requests` | Solicitudes de viaje | id, user_id, origin_state, origin_city, destination_state, destination_city, people_to_move, status (open/matched/completed/cancelled), notes |
| 3 | `transport_offers` | Ofertas de transporte | id, user_id, vehicle_type, capacity, origin_state, origin_city, destination_state, destination_city, status, notes |
| 4 | `housing_offers` | Ofertas de hospedaje | id, user_id, state, city, address, capacity, max_stay_days, amenities, status |
| 5 | `matches` | Match solicitud ↔ transportista | id, travel_request_id, user_id (transportista), status (pending/confirmed/completed/cancelled), created_at |
| 6 | `messages` | Mensajes de chat | id, match_id, sender_id, content, created_at |
| 7 | `route_segments` | Tramos de ruta | id, match_id, transportista_id, travel_request_id, origin_city, origin_state, origin_lat, origin_lng, destination_city, destination_state, destination_lat, destination_lng, distance_km, order, is_full_route, status |
| 8 | `organizations` | Organizaciones | id, name, description, contact_email, contact_phone, logo_url, admin_id (FK profiles), status, created_at |
| 9 | `organization_members` | Miembros de org | id, organization_id, member_id (FK profiles), role (admin/member), status (active/invited) |
| 10 | `companies` | Empresas registradas | id, user_id, name, sector, description, state, city, contact_name, contact_phone, contact_email, website, status |
| 11 | `jobs` | Empleos | id, company_id, title, description, requirements, location_state, location_city, modality, salary, contact, status |
| 12 | `supplies` | Insumos / donaciones físicas | id, user_id, title, category, quantity, condition, description, state, city, contact_name, contact_phone, needs_transport, status |
| 13 | `donations` | Donaciones económicas | id, user_id, amount, method, status, created_at |
| 14 | `graphics` | Recursos gráficos | id, title, description, category, file_url, status, created_at |
| 15 | `city_coords` | Cache de geocoding | city, state, lat, lng |
| 16 | `estados` | Estados de Venezuela | id, name, capital, municipios (JSON), lat, lng |

#### 9.2 Relaciones Clave

```
profiles (1) ──< travel_requests (user_id)
profiles (1) ──< transport_offers (user_id)
profiles (1) ──< housing_offers (user_id)
profiles (1) ──< companies (user_id)
profiles (1) ──< matches (user_id)          ← transportista
profiles (1) ──< messages (sender_id)
profiles (1) ──< organizations (admin_id)
profiles (1) ──< organization_members (member_id)

travel_requests (1) ──< matches (travel_request_id)
travel_requests (1) ──< route_segments (travel_request_id)

matches (1) ──< messages (match_id)
matches (1) ──< route_segments (match_id)

organizations (1) ──< organization_members (organization_id)
companies (1) ──< jobs (company_id)
```

#### 9.3 Políticas RLS

| Tabla | Lectura | Escritura |
|-------|---------|-----------|
| `profiles` | Propio perfil | Propio perfil |
| `travel_requests` | Pública (status=open) | Dueño de la solicitud |
| `transport_offers` | Pública | Dueño de la oferta |
| `housing_offers` | Pública | Dueño de la oferta |
| `matches` | Transportista o damnificado de la solicitud | — (creado vía API) |
| `messages` | Participantes del match | El sender |
| `route_segments` | Transportista del segmento o damnificado | — (creado vía API) |
| `organizations` | Admin y miembros | Admin de la org |
| `organization_members` | Miembro y admin | Admin de la org |
| `companies` | Pública | Dueño |
| `jobs` | Pública | Dueño de la empresa |
| `supplies` | Pública | Dueño |

#### 9.4 Archivos SQL

Los archivos SQL se ejecutan **manualmente** en Supabase Studio. No hay migraciones automáticas. Los scripts y SQLs residen en directorios locales (`supabase/*.sql`, `scripts/geocode-cities.mjs`) que están excluidos del repositorio vía `.gitignore`.

---

### 10. Autenticación

#### 10.1 Flujo de Registro

```
Página (/auth/register)
  │  react-hook-form + zod
  │  fields: name, email, phone, role, volunteerType (si rol=voluntario), password
  ▼
lib/auth.ts → registerUser(values)
  │  POST /api/auth/register
  ▼
API Route (app/api/auth/register/route.ts)
  │  1. Validar body (email, password, name obligatorios)
  │  2. getServiceSupabase().auth.admin.createUser({ email, password, email_confirm: true, user_metadata })
  │  3. Insertar en profiles: id, name, role, phone, volunteer_type
  │  4. Si profile insert falla → rollback: eliminar auth user
  │  5. Devolver { success: true, id }
  ▼
Página → signInWithPassword() → redirigir a home
```

**Nota**: El registro usa `admin.createUser()` (service role) porque el trigger `on_auth_user_created` en Supabase estaba roto. Se eliminó y todo el proceso se maneja desde la API route.

#### 10.2 Flujo de Login

```
Página (/auth/login)
  │  react-hook-form + zod
  │  fields: email, password
  ▼
lib/auth.ts → loginUser(values)
  │  getSupabase().auth.signInWithPassword({ email, password })
  ▼
Redirigir a home
```

#### 10.3 Sesión

- **Browser**: Supabase Auth con `persistSession: true` y `autoRefreshToken: true`.
- **Server-side**: Supabase Auth con `persistSession: false` (cada request verifica el token).
- **API Routes**: Verifican con `getSupabase().auth.getUser()` y devuelven 401 si no hay sesión.

#### 10.4 APIs con Auth Check

| Ruta | ¿Auth? | ¿Service Role? | Observación |
|------|--------|----------------|-------------|
| POST /api/auth/register | No (crea usuario) | Sí | Usa admin.createUser() |
| POST /api/forms | Sí — getUser() | Sí | Inserta con RLS bypass |
| POST /api/messages | Sí — getUser() | Sí | Deriva sender_id de la sesión |
| GET /api/organizations | Sí — getUser() | Sí | Busca org del usuario |
| POST /api/organizations | Sí — getUser() | Sí | Crea org + admin member |
| POST /api/organizations/members | Sí — getUser() + verifica admin | Sí | Solo admin puede invitar |
| POST /api/route-segments | Sí — getUser() | Sí | Deriva transportista_id de sesión |
| POST /api/webhooks/telegram | No | Sí | Webhook abierto (riesgo conocido) |
| POST /api/webhooks/whatsapp | No | Sí | Webhook abierto (riesgo conocido) |

---

### 11. API Routes — Referencia Completa

#### POST /api/auth/register

Registra un nuevo usuario usando service role. Crea el auth user y su perfil en una transacción manual.

```
Body:    { email, password, name, role?, phone?, volunteerType? }
Auth:    No (usa service role)
Service: Sí
Errores: 400 (missing fields), 500 (auth/profile error)
Éxito:   { success: true, id: string }
```

#### POST /api/forms

Envío genérico de formularios. Enruta según `type` a la tabla correspondiente.

```
Body:    { type: string, data: object }
         types válidos: travel_request, transport_offer, housing_offer,
                        company, job, supply, asistencia (no-op)
Auth:    Sí — 401 si no autenticado
Service: Sí
Errores: 400 (missing type), 400 (invalid type), 500 (insert error)
Éxito:   { success: true, id: string }
```

Nota: El campo `data` recibe automáticamente `user_id` derivado de la sesión. Los callers envían `type` (no `formType`) — la API acepta ambos.

#### POST /api/messages

Envía un mensaje en un match. El `sender_id` se deriva de la sesión.

```
Body:    { match_id: string, content: string }
Auth:    Sí — 401 si no autenticado
Service: Sí
Errores: 400 (missing fields), 500 (insert error)
Éxito:   { success: true, message: object }
```

#### GET /api/organizations

Obtiene la organización del usuario autenticado y sus miembros.

```
Body:    No
Auth:    Sí — 401 si no autenticado
Service: Sí
Errores: —
Éxito:   { organization: object | null, members: object[] }
```

#### POST /api/organizations

Crea una nueva organización. El usuario autenticado queda como admin.

```
Body:    { name: string, description?: string, contact_email?: string, contact_phone?: string }
Auth:    Sí — 401 si no autenticado
Service: Sí
Errores: 400 (name required), 500 (create error)
Éxito:   { success: true, organization: object }
```

#### POST /api/organizations/members

Agrega un miembro a una organización. Solo el admin de la org puede hacerlo.

```
Body:    { organization_id: string, member_email: string, role?: string }
Auth:    Sí — 401 si no autenticado, 403 si no es admin
Service: Sí
Errores: 400 (missing fields), 404 (user not found), 403 (not admin)
Éxito:   { success: true }
```

#### POST /api/route-segments

Crea un segmento de ruta. Calcula distancia con @turf/turf. Crea o actualiza el match.

```
Body:    { travel_request_id, origin_city, origin_state,
           destination_city, destination_state, is_full_route? }
Auth:    Sí — 401 si no autenticado (transportista_id = user.id)
Service: Sí
Errores: 400 (missing fields), 400 (coords not found), 500 (insert error)
Éxito:   { success: true, segment: object, match_id: string,
           all_covered: boolean, distance_km: number }
```

#### POST /api/webhooks/telegram

Webhook para integración con bot de Telegram (n8n). Sin verificación HMAC.

```
Body:    { type: "travel_request"|"transport_offer"|"housing_offer", data: object }
Auth:    No (webhook abierto)
Service: Sí
Errores: 400 (invalid type), 500 (insert error)
Éxito:   { success: true }
```

#### POST /api/webhooks/whatsapp

Webhook para integración con bot de WhatsApp (n8n). Sin verificación HMAC.

```
Body:    { type: "travel_request"|"transport_offer"|"housing_offer", data: object }
Auth:    No (webhook abierto)
Service: Sí
Errores: 400 (invalid type), 500 (insert error)
Éxito:   { success: true, data: object }
```

---

### 12. Sistema de Rutas y Mapas

#### 12.1 Flujo completo

1. **Damnificado** crea una solicitud de viaje → `travel_requests` (status: open).
2. **Transportista** ve la solicitud en "Solicitudes Disponibles" (filtrada por sus rutas).
3. Transportista hace clic en **"Tomar solicitud"** → se abre diálogo modal.
4. Opciones en el diálogo:
   - **"Llevar toda la ruta"**: crea un segmento que cubre origen→destino completo.
   - **"Llevar solo un tramo"**: dropdowns para seleccionar ciudad origen y destino del tramo.
5. Se llama a `POST /api/route-segments` que:
   a. Resuelve coordenadas de ciudades vía `getCityCoord()`.
   b. Calcula distancia con `@turf/turf` `distance()` (línea recta entre centroides).
   c. Crea o actualiza el match en `matches`.
   d. Inserta el segmento en `route_segments`.
   e. Si el segmento completa la ruta (full route o destino final alcanzado), marca el travel request como "matched".
6. El damnificado ve al transportista asignado en **"Ayuda Asignada"**.

#### 12.2 Coordenadas

- **Nivel ciudad**: `city_coords` tabla cacheada vía Nominatim (script `geocode-cities.mjs`).
- **Fallback**: coordenadas del estado desde la tabla `estados`.
- **Jitter**: se aplica desplazamiento aleatorio a marcadores del mapa para evitar superposición.

#### 12.3 Cálculo de distancia

Dos niveles:

1. **Valhalla** (ruteo por carretera): POST a `/api/osrm-route` que proxy a Valhalla interno. Devuelve geometría real de la ruta y distancia por carretera.
2. **Fallback @turf/turf** (línea recta): si Valhalla falla, se usa `distance()` de `@turf/turf` con haversine:

```ts
import { distance } from "@turf/turf"  // named import obligatorio

const from = [originCoord.lng, originCoord.lat]
const to = [destCoord.lng, destCoord.lat]
const distanceKm = Math.round(distance(from, to, { units: "kilometers" }) * 10) / 10
```

`@turf/turf` NO admite default import. Usar siempre `{ distance }`.

#### 12.4 Mapas

- **Librería**: MapLibre GL JS (imperativo, vía `maplibre-gl`). Sin wrapper React.
- **Tiles**: Servidor privado tileserver-gl en Docker, proxy vía `/api/map/[...path]` en Next.js.
- **Style**: `NEXT_PUBLIC_MAP_STYLE_URL=/api/map/styles/basic/style.json` — el proxy reescribe URLs absolutas/relativas del style.json.
- **Marcadores**: `maplibregl.Marker` con elementos DOM custom (div con estilo inline).
- **Polylines**: `map.addSource()` GeoJSON + `map.addLayer()` type `line`. Las rutas entre origen y destino se renderizan como líneas punteadas.
- **Ciclo de vida**: Se verifica `map.isStyleLoaded()` antes de agregar marcadores/líneas; si no, se espera `style.load`.
- **Marcadores de ruta**: Se almacenan en `markersRef` para limpieza en cada re-render.

#### 12.5 Infraestructura Docker

```
Servicios internos (misma red Docker):

Valhalla (valhalla:8002)
  → Ruteo por carretera (auto)
  → API: POST /route con format: geojson
  → Puerto expuesto: 8002

tileserver-gl (tiles-service:8080)
  → Tiles vectoriales desde .mbtiles
  → Style: /styles/basic/style.json
  → Tiles: /tiles/{z}/{x}/{y}.pbf
  → Puerto expuesto: 8080
```

Acceso desde Next.js vía `host.docker.internal` (puertos expuestos en host).

---

### 13. Traducciones (i18n)

#### 13.1 Idiomas

| Código | Idioma | Archivo |
|--------|--------|---------|
| `es` | Español | `messages/es.json` |
| `en` | English | `messages/en.json` |
| `fr` | Français | `messages/fr.json` |
| `it` | Italiano | `messages/it.json` |
| `de` | Deutsch | `messages/de.json` |
| `pt` | Português | `messages/pt.json` |
| `ar` | العربية | `messages/ar.json` |

#### 13.2 Namespaces

| Namespace | Propósito | Usado en |
|-----------|-----------|----------|
| `nav` | Navegación, botones de auth, enlaces | navbar, mobile-menu, perfil |
| `home` | Homepage, hero, stats, footer | homepage, footer, community-stats |
| `auth` | Login, registro, roles | auth/login, auth/register |
| `common` | Botones genéricos, estados | 20+ componentes |
| `travelRequest` | Formulario solicitud viaje | /solicitar-viaje, formulario |
| `transportOffer` | Formulario oferta transporte | /ofrecer-transporte, formulario |
| `housingOffer` | Formulario oferta hospedaje | /ofrecer-hospedaje, formulario |
| `jobs` | Empleos | /empleos, formulario empleo |
| `companies` | Empresas | /empresas/registro, perfil |
| `supplies` | Insumos | /donaciones-fisicas, /ofrecer-insumos |
| `graphics` | Recursos gráficos | /recursos |
| `donate` | Donación plataforma | /donar |
| `contact` | Contacto | /contacto |
| `terms` | Términos de uso | /terminos-de-uso |
| `explore` | Mapa | /explorar |
| `about` | Sobre nosotros | /sobre-nosotros |

#### 13.3 Cómo agregar un nuevo key

1. Agregar el key con su valor en **los 7 archivos** `messages/*.json`.
2. Usar `useTranslations("namespace")` en el componente.
3. Mantener consistencia: mismo nombre de key en todos los idiomas.
4. No mezclar keys de diferentes namespaces en un mismo `useTranslations` — crear uno por namespace.

---

### 14. Componentes

#### 14.1 Árbol de Componentes de Página

```
LocaleLayout
├── Navbar
│   ├── Dropdown (Ofrecer, Más)
│   ├── DropdownLink
│   ├── LanguageSwitcher
│   ├── ThemeToggle
│   └── MobileMenu
├── Page content (children)
│   ├── PageHero (shared)
│   ├── StateCard (empiezo-desde-cero)
│   ├── Timeline (empiezo-desde-cero)
│   ├── MapView (explorar)
│   ├── Form components (housing-offer, job, transport-offer, travel-request)
│   └── Panel components (empresa-panel, mensajes-panel, solicitudes-panel)
├── Footer
└── Toaster (sonner)
```

#### 14.2 UI Primitives (shadcn/ui)

Basados en `@base-ui/react` v1.6.0. Todos los componentes están en `components/ui/`.

| Componente | Props clave |
|------------|-------------|
| `Button` | variant (default/outline/secondary/ghost/destructive/link), size (sm/md/lg) |
| `Card` | + CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| `Badge` | variant (default/secondary/destructive/outline), className |
| `Input` | type, placeholder, className |
| `Textarea` | rows, placeholder |
| `Select` | value, onValueChange, placeholder + SelectTrigger, SelectContent, SelectItem |
| `Dialog` | open, onOpenChange + DialogContent, DialogHeader, DialogFooter |
| `Tabs` | value, onValueChange + TabsList, TabsTrigger, TabsContent |
| `Skeleton` | SkeletonCard, SkeletonGrid, SkeletonDetail, SkeletonProfile |
| `PasswordInput` | value, onChange (con toggle visibilidad) |

#### 14.3 Form Components

Usan `react-hook-form` + `@hookform/resolvers` + `zod`.

- `components/forms/housing-offer/form.tsx` — formulario completo de hospedaje (ubicación, capacidad, comodidades)
- `components/forms/job/form.tsx` — formulario de empleo en diálogo (título, requisitos, ubicación, modalidad)
- `components/forms/transport-offer/form.tsx` — formulario de transporte (vehículo, capacidad, ruta, fechas)
- `components/forms/travel-request/form.tsx` — formulario de solicitud viaje (origen, destino, pasajeros, vivienda)

Cada formulario usa esquemas zod definidos en `lib/schemas/`.

---

### 15. Seguridad

#### 15.1 Claves de Supabase

| Clave | Variable de entorno | Uso |
|-------|--------------------|-----|
| Anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente público (RLS activo) |
| Service role key | `SUPABASE_SERVICE_ROLE_KEY` | Solo en API routes (bypass RLS) |

**Regla de oro**: El service role key **nunca** debe exponerse al cliente. Solo se usa en API routes de Next.js (server-side).

#### 15.2 Auth en API Routes

- Las APIs verifican autenticación con `getSupabase().auth.getUser()`.
- Devuelven `401` si el usuario no está autenticado.
- El `user_id` se deriva de la sesión, **nunca** del body del request (previene IDOR).

#### 15.3 Riesgos Conocidos

| Riesgo | Descripción | Estado |
|--------|-------------|--------|
| Webhooks sin verificación | `/api/webhooks/telegram` y `/api/webhooks/whatsapp` aceptan POST de cualquiera | Pendiente — agregar HMAC o token |
| proxy.ts no conectado | La redirección i18n por Accept-Language no está activa | Pendiente — crear middleware.ts |
| Dependencias muertas | `zustand` y `axios` instalados pero sin uso | Pendiente — desinstalar |
| Schema residual | `lib/schemas/review.ts` sin componente que lo use | Pendiente — eliminar |

---

### 16. Despliegue

#### 16.1 Stack de despliegue

- **Hosting**: Dokploy sobre VPS.
- **Build**: Nixpacks (detecta automáticamente Next.js).
- **BD**: Supabase self-hosted en el mismo VPS o servidor separado.

#### 16.2 Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=http://backend.desdecerovenezuela.org:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
OSRM_URL=http://host.docker.internal:5000
TILE_SERVER_URL=http://host.docker.internal:8080
NEXT_PUBLIC_MAP_STYLE_URL=/api/map/styles/basic/style.json
```

#### 16.3 Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo (Turbopack) |
| `pnpm build` | Build de producción |
| `pnpm start` | Iniciar servidor de producción |
| `pnpm lint` | ESLint |

#### 16.4 Notas de Despliegue

- Supabase corre en **HTTP** (sin HTTPS) — asegurar que esté en la misma red o VPN.
- No hay migraciones automáticas. Los cambios de esquema SQL se aplican manualmente en Supabase Studio.
- Los scripts de geocoding (`scripts/geocode-cities.mjs`) se ejecutan localmente y no forman parte del build.
- La rama principal es `main`. Los pushes van a `origin/main`.

---

### 17. Desarrollo Local

#### 17.1 Requisitos

- Node.js >= 20
- pnpm >= 10
- Acceso al servidor Supabase (o instancia local)

#### 17.2 Setup

```bash
git clone <repo>
pnpm install
cp .env.local.example .env.local  # configurar claves
pnpm dev
```

#### 17.3 Sin Supabase Local

No hay soporte para Supabase local en este proyecto. Todas las operaciones apuntan al servidor self-hosted. Para desarrollo offline, se necesitaría una instancia local de Supabase.

---

### 18. Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `next` | 16.2.9 | Framework |
| `react` / `react-dom` | 19.2.4 | UI |
| `@supabase/supabase-js` | 2.108.2 | Cliente Supabase |
| `@base-ui/react` | 1.6.0 | Primitivas UI (shadcn/ui) |
| `tailwindcss` | 4 | Estilos |
| `@tailwindcss/postcss` | 4 | Plugin PostCSS Tailwind |
| `next-intl` | 4.13.0 | Internacionalización |
| `next-themes` | 0.4.6 | Tema claro/oscuro |
| `react-hook-form` | 7.80.0 | Formularios |
| `@hookform/resolvers` | 5.4.0 | Integración zod |
| `zod` | 4.4.3 | Validación |
| `maplibre-gl` | 4.7+ | Mapas vectoriales MapLibre GL JS |
| `@turf/turf` | 7.3.5 | Cálculos geográficos |
| `@turf/turf` | 7.3.5 | Cálculos geográficos |
| `lucide-react` | 1.22.0 | Iconos |
| `sonner` | 2.0.7 | Toasts / notificaciones |
| `class-variance-authority` | 0.7.1 | Variantes de componentes |
| `clsx` / `tailwind-merge` | — | Utilidades CSS |
| `tw-animate-css` | 1.4.0 | Animaciones Tailwind |
| `shadcn` | 4.12.0 | CLI shadcn/ui |

**Instaladas pero sin uso en el código:**
| Paquete | Acción recomendada |
|---------|-------------------|
| `zustand` (5.0.14) | Eliminar — no hay stores |
| `axios` (1.18.1) | Eliminar — se usa fetch nativo |

---

### 19. Pendientes Técnicos

| Ítem | Prioridad | Estado |
|------|-----------|--------|
| Agregar verificación HMAC/token a webhooks Telegram/WhatsApp | Alta | Pendiente |
| Conectar proxy.ts como middleware (crear middleware.ts) | Media | Pendiente |
| Desinstalar zustand y axios (deps muertas) | Baja | Pendiente |
| Eliminar lib/schemas/review.ts (schema muerto) | Baja | Pendiente |
| Agregar tests automatizados | Media | No implementado |

---

*Documentación generada el 2026-07-02. Última actualización: commit `6467269`.*
