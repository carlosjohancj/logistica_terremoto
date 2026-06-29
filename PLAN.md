# Plan de Acción — Desde Cero

Sistema de logística para damnificados del terremoto de Venezuela.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS 4 |
| UI | shadcn/ui + Radix |
| Estado | Zustand |
| HTTP | Axios |
| Backend/DB | PocketBase v0.39.x (SQLite) |
| Mapas | Leaflet + react-leaflet |
| i18n | next-intl (7 idiomas) |
| Bots | n8n + webhooks Next.js |

## Colecciones PocketBase (Creadas ✅)

1. **users** — extendida con: `phone`, `whatsapp`, `role`, `languages`, `verified`
2. **travel_requests** — Solicitudes de damnificados (origen, destino, personas, vivienda, salud, etc.)
3. **transport_offers** — Ofertas de transportistas (vehículo, ruta, capacidad, donación gasolina)
4. **housing_offers** — Ofertas de hospedaje (ubicación, capacidad, servicios)
5. **donations** — Donaciones (monto, método, destino)
6. **matches** — Conexiones oferta-demanda
7. **reviews** — Reseñas y reputación

## Estructura de Archivos

```
logistica_terremoto/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx           ← Layout con navbar + footer (i18n)
│   │   ├── page.tsx             ← Landing page
│   │   ├── solicitar-viaje/page.tsx
│   │   ├── ofrecer-transporte/page.tsx
│   │   ├── ofrecer-hospedaje/page.tsx
│   │   ├── explorar/page.tsx    ← Mapa + filtros
│   │   ├── donar/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── perfil/page.tsx
│   │   ├── admin/page.tsx
│   │   └── api/webhooks/
│   │       ├── telegram/route.ts
│   │       └── whatsapp/route.ts
│   └── ...
├── components/
│   ├── ui/                      ← shadcn components
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── footer.tsx
│   ├── forms/
│   │   ├── travel-request-form.tsx
│   │   ├── transport-offer-form.tsx
│   │   └── housing-offer-form.tsx
│   ├── maps/
│   │   └── map-view.tsx
│   └── shared/
│       └── language-switcher.tsx
├── lib/
│   ├── pocketbase.ts            ← Cliente PocketBase singleton
│   ├── utils.ts                 ← cn() helper
│   └── i18n.ts                  ← next-intl config
├── hooks/
│   ├── use-auth.ts
│   └── use-pb.ts
├── messages/                    ← Traducciones
│   ├── es.json
│   ├── en.json
│   ├── fr.json
│   ├── it.json
│   ├── de.json
│   ├── pt.json
│   └── ar.json
├── data/
│   └── venezuela.json           ← Estados, municipios, ciudades
└── setup-pb.mjs                 ← Script de creación de colecciones
```

## Fases de Implementación

### ✅ Fase 0 — Infraestructura
- [x] Instalar dependencias (pocketbase, zustand, axios, next-intl, leaflet, shadcn)
- [ ] Configurar shadcn/ui
- [x] Crear colecciones en PocketBase
- [ ] Crear lib/pocketbase.ts
- [ ] Crear hooks/use-auth.ts, hooks/use-pb.ts

### 🔄 Fase 1 — Base del proyecto
- [ ] Configurar next-intl (i18n routing + messages)
- [ ] Tema cálido en globals.css
- [ ] Layout (navbar + footer)
- [ ] Landing page (hero, stats, CTA)

### 📋 Fase 2 — Formularios
- [ ] Solicitar viaje (damnificados)
- [ ] Ofrecer transporte (transportistas)
- [ ] Ofrecer hospedaje (anfitriones)

### 🔍 Fase 3 — Exploración + Mapas
- [ ] Mapa Leaflet con marcadores
- [ ] Buscador con filtros (origen, destino, tipo)
- [ ] Página explorar

### 🔐 Fase 4 — Auth
- [ ] Registro + Login (email y WhatsApp)
- [ ] Perfil de usuario
- [ ] Mis publicaciones

### 🔗 Fase 5 — Matching
- [ ] Sistema de matches
- [ ] Reviews

### 💰 Fase 6 — Donaciones + i18n completo
- [ ] Página de donar
- [ ] Traducciones a 7 idiomas

### 🤖 Fase 7 — Bots + n8n
- [ ] Webhooks Telegram
- [ ] Webhooks WhatsApp

### 🛡️ Fase 8 — Admin
- [ ] Panel admin básico
- [ ] Moderación de publicaciones

## Diseño Visual (Tema Cálido)

| Color | Uso | Hex |
|-------|-----|-----|
| Terracota | Primary | `#CC5A3A` |
| Mostaza | Accent | `#E8B84B` |
| Crema | Background | `#FFF8F0` |
| Arena | Secondary bg | `#F5E6D3` |
| Texto | Foreground | `#1A1A1A` |
| Verde | Éxito | `#2D8A4E` |

## Conexiones n8n

```
n8n Bot → POST /api/webhooks/whatsapp → Axios → PocketBase
n8n Bot → POST /api/webhooks/telegram → Axios → PocketBase
```

Los webhooks reciben JSON de n8n, procesan la data contra PocketBase y responden. n8n maneja la conversación con los usuarios.
