"use client";

import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { MAP_STYLE_URL } from "@/lib/maps/constants";

export type ListItem = {
  id: string;
  type: "travel" | "transport" | "housing";
  title: string;
  lat: number;
  lng: number;
  destLat?: number;
  destLng?: number;
  description: string;
  routeGeometry?: [number, number][];
  routeApproximate?: boolean;
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

export function MapView({
  items,
  center = [9.5, -66.5],
  zoom = 6,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapError, setMapError] = useState(false);
  const [degradedRouting, setDegradedRouting] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [center[1], center[0]],
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("error", (e) => {
      if (e.error?.message?.includes("Failed to load")) {
        setMapError(true);
      }
    });
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
      setDegradedRouting(
        items.some(
          (item) =>
            item.destLat !== undefined &&
            item.routeApproximate === true,
        ),
      );
    }

    if (m.isStyleLoaded()) {
      render(m);
    } else {
      m.once("style.load", () => render(m));
    }
  }, [items]);

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden border">
      {(mapError || degradedRouting) && (
        <div className="absolute top-2 left-2 right-2 z-10 flex flex-col gap-1">
          {mapError && (
            <p className="rounded-md bg-destructive/90 px-3 py-1.5 text-xs text-white shadow">
              No se pudo cargar el mapa. Verifica que tileserver esté activo.
            </p>
          )}
          {degradedRouting && !mapError && (
            <p className="rounded-md bg-amber-600/90 px-3 py-1.5 text-xs text-white shadow">
              Algunas rutas se muestran en línea recta (Valhalla no disponible).
            </p>
          )}
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

function addRouteLines(map: maplibregl.Map, items: ListItem[]) {
  const features: GeoJSON.Feature[] = [];

  items.forEach((item) => {
    if (item.destLat === undefined || item.destLng === undefined) return;

    const coords =
      item.routeGeometry && item.routeGeometry.length > 1
        ? item.routeGeometry
        : [
            [item.lng, item.lat],
            [item.destLng, item.destLat],
          ];

    features.push({
      type: "Feature",
      properties: {
        color: routeColors[item.type],
        approximate: item.routeApproximate ?? !item.routeGeometry,
      },
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    });
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
    id: "route-lines-road",
    type: "line",
    source: sourceId,
    filter: ["!", ["get", "approximate"]],
    paint: {
      "line-color": ["get", "color"],
      "line-width": 3,
      "line-opacity": 0.85,
    },
  });

  map.addLayer({
    id: "route-lines-approx",
    type: "line",
    source: sourceId,
    filter: ["get", "approximate"],
    paint: {
      "line-color": ["get", "color"],
      "line-width": 2,
      "line-opacity": 0.5,
      "line-dasharray": [2, 2.5],
    },
  });
}
