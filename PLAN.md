# Plan de Acción — Desde Cero

> **⚠️ Este plan refleja el proyecto en su fase inicial (PocketBase). Ver DOCS.md para la documentación actualizada.**
> Stack actual: Next.js 16, Supabase, MapLibre GL JS, Valhalla, tileserver-gl Docker.

Sistema de logística para damnificados del terremoto de Venezuela.

## Stack Tecnológico (Actualizado)

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) + Tailwind CSS 4 |
| UI | shadcn/ui + @base-ui/react |
| Backend/DB | Supabase self-hosted (PostgreSQL) |
| Auth | Supabase Auth (admin.createUser + service role) |
| Mapas | MapLibre GL JS + tileserver-gl (Docker) |
| Ruteo | Valhalla (Docker) |
| i18n | next-intl (7 idiomas) |
| Bots | n8n + webhooks Next.js |
