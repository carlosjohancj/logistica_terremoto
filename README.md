# Logística Terremoto

Plataforma de logística civil que conecta voluntarios, organizaciones y damnificados para coordinar ayuda efectiva tras el terremoto de Venezuela.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Base de datos / Auth**: Supabase self-hosted
- **Mapas**: MapLibre GL JS + tileserver-gl (Docker)
- **Ruteo**: Valhalla (Docker)
- **i18n**: next-intl (7 idiomas)
- **Despliegue**: Dokploy + Nixpacks

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Variables de Entorno

Ver `.env.local` o la configuración en Dokploy.

## Servicios Docker

- Valhalla (ruteo): puerto 8002
- tileserver-gl (mapas): puerto 8080

Ambos con puertos expuestos en el host, accesibles vía `host.docker.internal` desde el contenedor de Next.js.
