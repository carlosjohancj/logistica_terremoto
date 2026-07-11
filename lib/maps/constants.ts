/** Estilo vectorial servido vía proxy self-hosted (/api/map → tileserver-gl). */
export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "/api/map/styles/basic/style.json"
