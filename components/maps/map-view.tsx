"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";

export type ListItem = {
  id: string;
  type: "travel" | "transport" | "housing";
  title: string;
  lat: number;
  lng: number;
  destLat?: number;
  destLng?: number;
  description: string;
};

type MapViewProps = {
  items: ListItem[];
  center?: [number, number];
  zoom?: number;
};

const originColors: Record<string, string> = {
  travel: "#6B8F71",
  transport: "#A0845C",
  housing: "#4A7C59",
};

const destColors: Record<string, string> = {
  travel: "#4A7C59",
  transport: "#6B8F71",
  housing: "#3D6B47",
};

const routeColors: Record<string, string> = {
  travel: "#6B8F71",
  transport: "#A0845C",
  housing: "#4A7C59",
};

const styleUrl =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
  "https://demotiles.maplibre.org/style.json";

export function MapView({
  items,
  center = [9.5, -66.5],
  zoom = 6,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [center[1], center[0]],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    function render(map: maplibregl.Map) {
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current = [];

      items.forEach((item) => {
        const el = document.createElement("div");
        el.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:${originColors[item.type]};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer"></div>`;

        const popup = new maplibregl.Popup({ offset: 14 }).setHTML(
          `<div class="text-sm"><strong>${item.title}</strong><p class="text-muted-foreground mt-1">${item.description}</p></div>`,
        );

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([item.lng, item.lat])
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);

        if (item.destLat !== undefined && item.destLng !== undefined) {
          const destEl = document.createElement("div");
          destEl.innerHTML = `<div style="width:20px;height:20px;border-radius:50%;background:white;border:3px solid ${destColors[item.type]};box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer"></div>`;

          const destMarker = new maplibregl.Marker({ element: destEl })
            .setLngLat([item.destLng, item.destLat])
            .setPopup(
              new maplibregl.Popup({ offset: 10 }).setHTML(
                `<div class="text-sm"><strong>Destino</strong></div>`,
              ),
            )
            .addTo(map);
          markersRef.current.push(destMarker);
        }
      });

      addRouteLines(map, items);
    }

    if (m.isStyleLoaded()) {
      render(m);
    } else {
      m.once("style.load", () => render(m));
    }
  }, [items]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

function addRouteLines(map: maplibregl.Map, items: ListItem[]) {
  const features: GeoJSON.Feature[] = [];

  items.forEach((item) => {
    if (item.destLat !== undefined && item.destLng !== undefined) {
      features.push({
        type: "Feature",
        properties: { color: routeColors[item.type] },
        geometry: {
          type: "LineString",
          coordinates: [
            [item.lng, item.lat],
            [item.destLng, item.destLat],
          ],
        },
      });
    }
  });

  if (features.length === 0) return;

  const sourceId = "route-lines";
  if (map.getSource(sourceId)) {
    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features,
    });
    return;
  }

  map.addSource(sourceId, {
    type: "geojson",
    data: { type: "FeatureCollection", features },
  });

  map.addLayer({
    id: sourceId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": ["get", "color"],
      "line-width": 2,
      "line-opacity": 0.5,
      "line-dasharray": [2, 2.5],
    },
  });
}
