"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import "./map.css";

const normalizeColor = (value, fallback) => {
  const trimmed = (value || "").trim();
  return trimmed || fallback;
};

const parseHexToRgb = (value) => {
  const hex = value.replace("#", "").trim();
  if (![3, 4, 6, 8].includes(hex.length)) return null;
  const expanded = hex.length <= 4 ? hex.split("").map((c) => c + c).join("") : hex;
  const hasAlpha = expanded.length === 8;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  const a = hasAlpha ? parseInt(expanded.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
};

const parseRgbString = (value) => {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) return null;
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts[3] ? Number(parts[3]) : 1;
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b, a: Number.isNaN(a) ? 1 : a };
};

const toRgba = (color, alpha) => {
  const trimmed = (color || "").trim();
  const parsed = trimmed.startsWith("#") ? parseHexToRgb(trimmed) : parseRgbString(trimmed);
  if (!parsed) return `rgba(255,255,255,${alpha})`;
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${Math.max(0, Math.min(1, alpha))})`;
};

const getThemePalette = () => {
  if (typeof window === "undefined") {
    return {
      bg: "#080808",
      surface: "#27272a",
      accent: "#E8192C",
      muted: "#a1a1aa",
      border: "#27272a",
      text: "#F5F0EB",
    };
  }
  const root = getComputedStyle(document.documentElement);
  return {
    bg: normalizeColor(root.getPropertyValue("--background"), "#080808"),
    surface: normalizeColor(root.getPropertyValue("--secondary"), "#27272a"),
    accent: normalizeColor(root.getPropertyValue("--crimson"), "#E8192C"),
    muted: normalizeColor(root.getPropertyValue("--muted-foreground"), "#a1a1aa"),
    border: normalizeColor(root.getPropertyValue("--border"), "#27272a"),
    text: normalizeColor(root.getPropertyValue("--foreground"), "#F5F0EB"),
  };
};

const buildMapStyle = (palette) => ({
  version: 8,
  sources: {
    openmaptiles: {
      type: "vector",
      url: "https://tiles.openfreemap.org/planet",
    },
  },
  glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
  sprite: "https://openmaptiles.github.io/osm-bright-gl-style/sprite",
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": palette.bg },
    },
    {
      id: "water",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "water",
      paint: { "fill-color": toRgba(palette.accent, 0.12) },
    },
    {
      id: "landcover-grass",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["==", ["get", "class"], "grass"],
      paint: { "fill-color": toRgba(palette.accent, 0.08) },
    },
    {
      id: "buildings",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "building",
      paint: {
        "fill-color": palette.surface,
        "fill-outline-color": toRgba(palette.border, 0.4),
      },
    },
    {
      id: "road-motorway-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
      paint: { "line-color": palette.bg, "line-width": 6 },
    },
    {
      id: "road-motorway",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk"]]],
      paint: { "line-color": toRgba(palette.accent, 0.8), "line-width": 4 },
    },
    {
      id: "road-primary-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "primary"],
      paint: { "line-color": palette.bg, "line-width": 4.5 },
    },
    {
      id: "road-primary",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "primary"],
      paint: { "line-color": toRgba(palette.accent, 0.55), "line-width": 2.5 },
    },
    {
      id: "road-secondary-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
      paint: { "line-color": palette.bg, "line-width": 3.5 },
    },
    {
      id: "road-secondary",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["secondary", "tertiary"]]],
      paint: { "line-color": toRgba(palette.muted, 0.45), "line-width": 1.5 },
    },
    {
      id: "road-minor-casing",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "path", "track"]]],
      paint: { "line-color": palette.bg, "line-width": 3 },
    },
    {
      id: "road-minor",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "path", "track"]]],
      paint: { "line-color": toRgba(palette.border, 0.3), "line-width": 1 },
    },
    {
      id: "transit-rail",
      type: "line",
      source: "openmaptiles",
      "source-layer": "transportation",
      filter: ["==", ["get", "class"], "rail"],
      paint: {
        "line-color": toRgba(palette.accent, 0.4),
        "line-width": 1.2,
        "line-dasharray": [2, 2],
      },
    },
    {
      id: "place-labels",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "place",
      layout: {
        "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-size": 13,
      },
      paint: {
        "text-color": toRgba(palette.text, 0.85),
        "text-halo-color": palette.bg,
        "text-halo-width": 1.5,
      },
    },
    {
      id: "road-labels",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "transportation_name",
      layout: {
        "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
        "text-font": ["Noto Sans Regular"],
        "text-size": 10,
      },
      paint: {
        "text-color": toRgba(palette.text, 0.55),
        "text-halo-color": palette.bg,
        "text-halo-width": 1,
      },
    },
    {
      id: "poi-labels-hidden",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "poi",
      layout: { visibility: "none" },
    },
  ],
});

const markerIconMarkup = (markerType, color) => {
  if (markerType === "user") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true" class="custom-map-icon-svg" style="color:${color}">
        <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="custom-map-icon-svg" style="color:${color}">
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill="currentColor" />
      <circle cx="12" cy="10" r="2.5" fill="rgba(8,8,8,0.9)" />
    </svg>
  `;
};

/**
 * @param {{
 * latitude: number | null | undefined;
 * longitude: number | null | undefined;
 * zoom?: number;
 * markers?: { lat: number; lng: number; label: string; color?: string; live?: boolean; markerType?: "event" | "user" }[];
 * height?: string;
 * interactive?: boolean;
 * routeCoordinates?: { from: { lat: number; lng: number }; to: { lat: number; lng: number } } | null;
 * }} props
 */
const CustomMap = ({
  latitude,
  longitude,
  zoom = 14,
  markers = [],
  height = "400px",
  interactive = true,
  routeCoordinates = null,
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstances = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const palette = useMemo(() => getThemePalette(), []);

  const hasCoords = Number.isFinite(latitude) && Number.isFinite(longitude);
  const styleConfig = useMemo(() => buildMapStyle(palette), [palette]);

  useEffect(() => {
    if (!hasCoords || !mapRef.current) return undefined;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: styleConfig,
      center: [longitude, latitude],
      zoom,
      interactive,
      dragRotate: false,
      pitchWithRotate: false,
      attributionControl: false,
    });
    mapInstance.current = map;
    map.on("load", () => {
      setMapLoaded(true);
    });
    map.on("error", () => {
      setMapLoaded(true);
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    return () => {
      markerInstances.current.forEach((marker) => marker.remove());
      markerInstances.current = [];
      map.remove();
      mapInstance.current = null;
    };
  }, [hasCoords, interactive, styleConfig, zoom, latitude, longitude]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !hasCoords) return;
    map.flyTo({ center: [longitude, latitude], speed: 1.2 });
  }, [hasCoords, latitude, longitude]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !Number.isFinite(zoom)) return;
    map.setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !hasCoords) return;
    markerInstances.current.forEach((marker) => marker.remove());
    markerInstances.current = [];
    markers.forEach((marker) => {
      if (!Number.isFinite(marker?.lat) || !Number.isFinite(marker?.lng)) return;
      const markerElement = document.createElement("div");
      const markerColor = marker.color || palette.accent;
      markerElement.className = `custom-map-marker ${marker.live ? "custom-map-marker-live" : ""}`;
      const iconElement = document.createElement("div");
      iconElement.className = "custom-map-icon-wrap";
      iconElement.innerHTML = markerIconMarkup(marker.markerType === "user" ? "user" : "event", markerColor);
      markerElement.appendChild(iconElement);
      const tooltip = document.createElement("div");
      tooltip.className = "custom-map-tooltip";
      tooltip.style.backgroundColor = palette.surface;
      tooltip.style.color = palette.text;
      tooltip.style.borderColor = toRgba(palette.border, 0.8);
      tooltip.textContent = marker.label || "Pinned location";
      markerElement.appendChild(tooltip);
      const markerInstance = new maplibregl.Marker({ element: markerElement, anchor: "center" })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map);
      markerInstances.current.push(markerInstance);
    });
  }, [hasCoords, markers, palette]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !hasCoords) return;
    const fromLat = Number(routeCoordinates?.from?.lat);
    const fromLng = Number(routeCoordinates?.from?.lng);
    const toLat = Number(routeCoordinates?.to?.lat);
    const toLng = Number(routeCoordinates?.to?.lng);
    const hasRoute = [fromLat, fromLng, toLat, toLng].every((value) => Number.isFinite(value));
    const sourceId = "custom-map-route-source";
    const casingLayerId = "custom-map-route-casing";
    const lineLayerId = "custom-map-route-line";
    const removeRoute = () => {
      if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId);
      if (map.getLayer(casingLayerId)) map.removeLayer(casingLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
    const drawRoute = () => {
      if (!hasRoute) {
        removeRoute();
        return;
      }
      const data = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [fromLng, fromLat],
            [toLng, toLat],
          ],
        },
      };
      const existingSource = map.getSource(sourceId);
      if (existingSource) {
        existingSource.setData(data);
      } else {
        map.addSource(sourceId, {
          type: "geojson",
          data,
        });
      }
      if (!map.getLayer(casingLayerId)) {
        map.addLayer({
          id: casingLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": toRgba(palette.bg, 0.9),
            "line-width": 6,
          },
        });
      }
      if (!map.getLayer(lineLayerId)) {
        map.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": toRgba(palette.accent, 0.88),
            "line-width": 3,
            "line-dasharray": [1, 1.5],
          },
        });
      }
    };
    if (map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.once("load", drawRoute);
    }
    return () => {
      if (!mapInstance.current) return;
      removeRoute();
    };
  }, [hasCoords, palette.accent, palette.bg, routeCoordinates]);

  if (!hasCoords) {
    return <div className="custom-map-skeleton" style={{ height }} aria-label="Map unavailable" />;
  }

  return (
    <div className="custom-map-shell" style={{ height }}>
      <div ref={mapRef} className="custom-map-canvas" />
      {!mapLoaded ? (
        <div className="custom-map-loading">
          <div className="custom-map-loading-spinner" />
          <span>Loading map theme...</span>
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Recenter map"
        className="custom-map-recenter"
        onClick={() => {
          if (!mapInstance.current) return;
          mapInstance.current.flyTo({ center: [longitude, latitude], speed: 1.2 });
        }}
      >
        ⦿ Recenter
      </button>
    </div>
  );
};

export default CustomMap;
