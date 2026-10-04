"use client";

import { useMemo, useRef, useState } from "react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl/maplibre";
import { setWorkerUrl } from "maplibre-gl";
import { Search, LoaderCircle, MapPin, Mountain } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl("/maplibre-gl-worker.mjs");

const INDIA_VIEW = {
  longitude: 79.2,
  latitude: 22.8,
  zoom: 4.1,
  pitch: 48,
  bearing: -8,
};

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const DEM_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const INDIA_STATES = "https://raw.githubusercontent.com/datameet/maps/master/States/Country/india_state.geojson";

const STORM_FILL = {
  id: "storm-fill",
  type: "fill",
  paint: {
    "fill-color": ["get", "color"],
    "fill-opacity": [
      "interpolate",
      ["linear"],
      ["get", "intensity"],
      35, 0.24,
      45, 0.3,
      65, 0.4,
    ],
    "fill-opacity-transition": { duration: 600 },
  },
};

const LIGHTNING = {
  id: "lightning-points",
  type: "circle",
  paint: {
    "circle-radius": 4,
    "circle-color": "#fde047",
    "circle-opacity": 0.9,
    "circle-blur": 0.15,
    "circle-stroke-color": "#fff7ae",
    "circle-stroke-width": 1,
  },
};

const STATES_FILL = {
  id: "india-states-fill",
  type: "fill",
  paint: {
    "fill-color": "#163052",
    "fill-opacity": 0.2,
  },
};

const STATES_LINE = {
  id: "india-states-line",
  type: "line",
  paint: {
    "line-color": "#8ab4e8",
    "line-opacity": 0.55,
    "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.5, 8, 1.2, 12, 2],
  },
};

const STATE_LABELS = {
  id: "india-state-labels",
  type: "symbol",
  layout: {
    "text-field": ["coalesce", ["get", "st_nm"], ["get", "ST_NM"], ["get", "name"], ""],
    "text-size": ["interpolate", ["linear"], ["zoom"], 3, 9, 7, 11, 10, 14],
    "text-max-width": 8,
    "text-allow-overlap": false,
    "text-ignore-placement": false,
  },
  paint: {
    "text-color": "#d5e8ff",
    "text-halo-color": "#07101c",
    "text-halo-width": 1.5,
    "text-opacity": ["interpolate", ["linear"], ["zoom"], 3, 0, 5, 0.72, 8, 0.8],
  },
};

const SCAN_RING = {
  id: "scan-ring",
  type: "circle",
  paint: {
    "circle-radius": ["get", "radius"],
    "circle-color": "transparent",
    "circle-opacity": 0.05,
    "circle-stroke-color": "#22d3ee",
    "circle-stroke-width": 2,
    "circle-stroke-opacity": 0.85,
  },
};

const TARGET_MARKER = {
  id: "scan-target",
  type: "circle",
  paint: {
    "circle-radius": 6,
    "circle-color": "#22d3ee",
    "circle-stroke-color": "#e0fbff",
    "circle-stroke-width": 2,
    "circle-stroke-opacity": 0.95,
  },
};

const INDIA_LABEL = {
  id: "india-country-label",
  type: "symbol",
  layout: {
    "text-field": "INDIA",
    "text-size": ["interpolate", ["linear"], ["zoom"], 3, 20, 5, 28, 8, 36],
    "text-letter-spacing": 0.18,
    "text-allow-overlap": true,
  },
  paint: {
    "text-color": "#b9d7ff",
    "text-halo-color": "#07101c",
    "text-halo-width": 2,
    "text-opacity": 0.42,
  },
};

function stormPolygon(step, target, offset = 0) {
  const lon = target[0] + (step - 5) * 0.025 + offset;
  const lat = target[1] + (step - 5) * 0.018;
  return [
    [lon, lat],
    [lon + 0.28, lat + 0.08],
    [lon + 0.32, lat + 0.28],
    [lon + 0.15, lat + 0.38],
    [lon - 0.08, lat + 0.28],
    [lon - 0.1, lat + 0.08],
    [lon, lat],
  ];
}

function makeStormData(step, target) {
  const features = [];
  if (step > 0) {
    features.push({
      type: "Feature",
      properties: {
        color: step >= 5 ? "#7e22ce" : step >= 4 ? "#dc2626" : "#d97706",
        intensity: step >= 4 ? 65 : 45,
      },
      geometry: { type: "Polygon", coordinates: [stormPolygon(step, target)] },
    });
  }
  if (step >= 2) {
    features.push({
      type: "Feature",
      properties: { color: "#d97706", intensity: 35 },
      geometry: { type: "Polygon", coordinates: [stormPolygon(step, target, -0.28)] },
    });
  }
  return { type: "FeatureCollection", features };
}

function makeLightningData(step, target) {
  if (step < 1 || step > 9) return { type: "FeatureCollection", features: [] };
  const count = step < 5 ? step * 10 : (10 - step) * 8;
  const lon = target[0] + (step - 5) * 0.025;
  const lat = target[1] + (step - 5) * 0.018;
  return {
    type: "FeatureCollection",
    features: Array.from({ length: count }, (_, i) => {
      const r1 = ((step * 997 + i * 17) % 1000) / 1000;
      const r2 = ((step * 113 + i * 53) % 1000) / 1000;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon + (r1 - 0.5) * 0.5, lat + (r2 - 0.5) * 0.5] },
        properties: {},
      };
    }),
  };
}

export default function WeatherMap({ activeIndex = 0 }) {
  const mapRef = useRef(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [locationName, setLocationName] = useState("India");
  const [scanTarget, setScanTarget] = useState([79.2, 22.8]);

  const stormData = useMemo(() => makeStormData(activeIndex, scanTarget), [activeIndex, scanTarget]);
  const lightningData = useMemo(() => makeLightningData(activeIndex, scanTarget), [activeIndex, scanTarget]);
  const targetData = useMemo(() => ({
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: { radius: 18 + activeIndex * 7 }, geometry: { type: "Point", coordinates: scanTarget } }],
  }), [scanTarget]);
  const countryLabelData = useMemo(() => ({
    type: "FeatureCollection",
    features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [79.2, 22.8] } }],
  }), []);
  const dBZ = 28 + activeIndex * 4;

  function enableTerrain(event) {
    const map = event.target;
    if (!map.getSource("terrain-dem")) {
      map.addSource("terrain-dem", {
        type: "raster-dem",
        tiles: [DEM_TILES],
        tileSize: 256,
        encoding: "terrarium",
        maxzoom: 15,
      });
    }
    map.setTerrain({ source: "terrain-dem", exaggeration: 1.35 });
  }

  async function searchLocation(event) {
    event.preventDefault();
    const search = query.trim();
    if (!search) return;

    setSearching(true);
    setSearchError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=in&limit=1&q=${encodeURIComponent(search)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!response.ok) throw new Error(`Geocoding request failed (${response.status})`);
      const results = await response.json();
      if (!results.length) throw new Error("Location not found in India");

      const result = results[0];
      const longitude = Number(result.lon);
      const latitude = Number(result.lat);
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        throw new Error("Geocoder returned invalid coordinates");
      }

      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: 10.5,
        pitch: 55,
        bearing: 0,
        duration: 2500,
        essential: true,
      });
      setLocationName(result.display_name.split(",").slice(0, 2).join(","));
      setScanTarget([longitude, latitude]);
    } catch (error) {
      console.error("Location search failed:", error);
      setSearchError(error instanceof Error ? error.message : "Location search failed");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="relative w-full h-full bg-[#07101c]">
      <Map
        ref={mapRef}
        initialViewState={INDIA_VIEW}
        mapStyle={MAP_STYLE}
        attributionControl={false}
        onLoad={enableTerrain}
        maxPitch={70}
        reuseMaps
      >
        <NavigationControl position="bottom-right" showCompass showZoom />
        <Source id="india-states-source" type="geojson" data={INDIA_STATES}>
          <Layer {...STATES_FILL} />
          <Layer {...STATES_LINE} />
          <Layer {...STATE_LABELS} />
        </Source>
        <Source id="india-label-source" type="geojson" data={countryLabelData}>
          <Layer {...INDIA_LABEL} />
        </Source>
        <Source id="scan-target-source" type="geojson" data={targetData}>
          <Layer {...SCAN_RING} />
          <Layer {...TARGET_MARKER} />
        </Source>
        <Source id="storm-source" type="geojson" data={stormData}>
          <Layer {...STORM_FILL} />
        </Source>
        <Source id="lightning-source" type="geojson" data={lightningData}>
          <Layer {...LIGHTNING} />
        </Source>
      </Map>

      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(10,30,55,0.05),rgba(4,10,20,0.18))]" />

      <form onSubmit={searchLocation} className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-[min(92%,28rem)] pointer-events-auto">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-xl">
          {searching ? <LoaderCircle size={17} className="shrink-0 animate-spin text-blue-700" /> : <Search size={17} className="shrink-0 text-slate-600" />}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search any Indian city or district..."
            aria-label="Search an Indian city or district"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
          />
          <button type="submit" disabled={searching || !query.trim()} className="rounded-lg bg-blue-500/90 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40">
            FLY
          </button>
        </div>
        {searchError && <p role="alert" className="mt-1 rounded-lg bg-red-950/90 px-3 py-1.5 text-[11px] text-red-200">{searchError}</p>}
      </form>

      <div className="absolute left-4 top-20 z-10 pointer-events-none flex flex-col gap-2 font-mono text-[10px] text-slate-700">
        <div className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-white/85 px-2 py-1 shadow-sm backdrop-blur-md">
          <Mountain size={12} /> TERRAIN 3D · 1.35x
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white/85 px-2 py-1 shadow-sm backdrop-blur-md">
          <MapPin size={12} /> {locationName}
        </div>
        <div className="rounded-md border border-slate-200 bg-white/85 px-2 py-1 shadow-sm backdrop-blur-md">
          THREAT SCAN · {activeIndex === 0 ? "INITIALISING" : `+${activeIndex * 0.6} HR`}
        </div>
      </div>

      {activeIndex > 0 && (
        <div className="absolute right-4 top-20 z-10 pointer-events-none rounded-md border border-red-200 bg-white/90 px-2 py-1 font-mono text-xs font-bold text-red-700 shadow-sm backdrop-blur-md">
          {dBZ} dBZ · {dBZ >= 55 ? "EXTREME" : "DEVELOPING"}
        </div>
      )}

      <div className="absolute bottom-24 left-4 z-10 pointer-events-none font-mono text-[10px] leading-tight text-slate-600">
        <div>0–6 HR NOWCAST · MAPLIBRE TERRAIN</div>
        <div>DEM: AWS TERRAIN-RGB · SEARCH: OSM NOMINATIM</div>
      </div>
      <div className="absolute bottom-2 right-2 z-10 pointer-events-none rounded bg-white/80 px-1.5 py-0.5 text-[9px] text-slate-600 shadow-sm">
        © OpenStreetMap contributors · CARTO
      </div>
    </div>
  );
}
