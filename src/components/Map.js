"use client";

import { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, LineLayer, TextLayer, PolygonLayer, PathLayer } from '@deck.gl/layers';

// ── Viewport (centred on Uttarakhand) ────────────────────────────────────────
const INITIAL_VIEW_STATE = {
  longitude: 79.2,
  latitude: 30.15,
  zoom: 7.2,
  pitch: 0,
  bearing: 0,
  transitionDuration: 800,
};

// ── Vector basemap data (no external tile server needed) ──────────────────────

const UK_POLY = [[
  [77.48,30.42],[77.60,30.10],[77.75,29.85],[78.00,29.55],
  [78.30,29.15],[78.75,28.90],[79.20,28.95],[79.60,29.05],
  [80.00,29.15],[80.40,29.30],[80.80,29.50],[81.00,30.00],
  [80.55,30.45],[80.00,30.85],[79.50,31.20],[79.00,31.45],
  [78.40,31.30],[78.00,31.10],[77.60,30.80],[77.48,30.42],
]];

const HP_POLY = [[
  [75.60,30.40],[76.00,30.55],[76.60,30.70],[77.20,30.90],
  [77.48,30.42],[77.60,30.10],[77.40,29.70],[77.10,29.40],
  [76.80,29.20],[76.40,29.40],[76.00,29.80],[75.70,30.10],[75.60,30.40],
]];

const UP_POLY = [[
  [77.48,30.42],[78.30,29.15],[78.75,28.90],[79.20,28.95],
  [79.60,29.05],[80.40,29.30],[81.00,30.00],[81.00,28.60],
  [79.00,28.40],[77.00,28.50],[76.60,28.80],[76.80,29.20],
  [77.10,29.40],[77.40,29.70],[77.60,30.10],[77.48,30.42],
]];

// Nepal border strip (north-east)
const NEPAL_POLY = [[
  [81.00,30.00],[81.00,31.20],[80.00,31.40],[79.00,31.45],
  [79.50,31.20],[80.00,30.85],[80.55,30.45],[81.00,30.00],
]];

const STATE_BORDER = [
  [77.48,30.42],[77.60,30.10],[77.75,29.85],[78.00,29.55],
  [78.30,29.15],[78.75,28.90],[79.20,28.95],[79.60,29.05],
  [80.00,29.15],[80.40,29.30],[80.80,29.50],[81.00,30.00],
  [80.55,30.45],[80.00,30.85],[79.50,31.20],[79.00,31.45],
  [78.40,31.30],[78.00,31.10],[77.60,30.80],[77.48,30.42],
];

const RIVERS = [
  // Ganga / Bhagirathi
  { path:[[79.07,30.90],[78.85,30.30],[78.40,30.05],[78.15,29.95],[78.00,30.00],[77.90,29.70],[78.20,29.45],[78.55,29.15],[79.00,28.90]], color:[56,189,248,150], w:2.5 },
  // Yamuna
  { path:[[77.95,30.70],[77.80,30.50],[77.65,30.20],[77.50,29.95]], color:[56,189,248,120], w:2 },
  // Alaknanda
  { path:[[79.85,30.70],[79.50,30.50],[79.10,30.25],[78.90,30.00],[78.60,29.80]], color:[56,189,248,110], w:1.8 },
  // Tons
  { path:[[77.60,31.10],[77.50,30.85],[77.48,30.42]], color:[56,189,248,90], w:1.5 },
];

const CITIES = [
  { position:[78.0322,30.3165], name:'Dehradun',    tier:1, r:5500 },
  { position:[78.1642,29.9457], name:'Haridwar',    tier:2, r:4000 },
  { position:[78.7733,30.0869], name:'Rishikesh',   tier:2, r:3200 },
  { position:[79.4304,30.7268], name:'Uttarkashi',  tier:3, r:2800 },
  { position:[79.9284,29.3817], name:'Almora',      tier:3, r:2800 },
  { position:[79.2130,29.3690], name:'Pauri',       tier:3, r:2500 },
  { position:[78.9720,30.4150], name:'Tehri',       tier:3, r:2500 },
  { position:[80.2198,29.2183], name:'Pithoragarh', tier:3, r:2500 },
  { position:[79.6501,29.5892], name:'Bageshwar',   tier:3, r:2200 },
];

// ── Storm simulation ──────────────────────────────────────────────────────────

function generateStormCells(t) {
  const bLon = 77.75, bLat = 30.05;
  const dLon = t * 0.055, dLat = t * 0.042;
  // Minimum intensity 0.4 → always visible at t=0
  const raw = t <= 4 ? (t + 1) / 5 : (10 - t) / 6;
  const intensity = Math.max(0.4, raw);

  const cells = [{
    id: 'main',
    position: [bLon + dLon, bLat + dLat],
    radius: 14000 + intensity * 14000,
    color: [239, 68, 68, Math.round(200 * intensity)],
    dBZ: Math.round(28 + intensity * 32),
  }];

  if (t >= 3 && t <= 8) {
    const si = Math.max(0.15, t - 3 <= 2 ? (t-3) * 0.35 : (5-(t-3)) * 0.3);
    cells.push({
      id: 'secondary',
      position: [bLon + dLon - 0.22, bLat + dLat + 0.14],
      radius: 9000 + si * 10000,
      color: [245, 158, 11, Math.round(180 * si)],
      dBZ: Math.round(22 + si * 24),
    });
  }
  if (t >= 3 && t <= 6) {
    cells.push({
      id: 'hail',
      position: [bLon + dLon + 0.03, bLat + dLat + 0.025],
      radius: 4500,
      color: [168, 85, 247, 230],
      dBZ: 62,
    });
  }
  return cells;
}

function generateLightning(t) {
  if (t < 1 || t > 8) return [];
  const count = t < 5 ? t * 12 : (10 - t) * 10;
  const bLon = 77.75 + t * 0.055, bLat = 30.05 + t * 0.042;
  return Array.from({ length: count }, (_, i) => {
    const r1 = (t * 997 + i * 17) % 1000 / 1000;
    const r2 = (t * 113 + i * 53) % 1000 / 1000;
    return { position: [bLon + (r1-0.5)*0.45, bLat + (r2-0.5)*0.45], radius: 900 + r1*1200, color:[253,224,71,230] };
  });
}

function genVectors(cells) {
  return cells.map(c => ({
    sourcePosition: c.position,
    targetPosition: [c.position[0]+0.18, c.position[1]+0.25],
    color: [59, 130, 246, 200],
  }));
}

function genLabels(cells) {
  return cells.filter(c => c.dBZ > 30).map(c => ({ position: c.position, text: `${c.dBZ} dBZ` }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapView({
  timeIndex,
  viewMode,
  activeLayers = { radar:true, lightning:true, satellite:false, terrain:false },
}) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      pitch:   viewMode === '3d' ? 45 : 0,
      bearing: viewMode === '3d' ? -15 : 0,
      transitionDuration: 1000,
    }));
  }, [viewMode]);

  const stormData  = useMemo(() => generateStormCells(timeIndex),   [timeIndex]);
  const lightData  = useMemo(() => generateLightning(timeIndex),     [timeIndex]);
  const vectorData = useMemo(() => genVectors(stormData),            [stormData]);
  const labelData  = useMemo(() => genLabels(stormData),             [stormData]);

  const layers = [
    // ── 1. State fill polygons ──────────────────────────────────────────
    new PolygonLayer({ id:'nepal', data:[{p:NEPAL_POLY}], getPolygon:d=>d.p, getFillColor:[28,38,60,180], stroked:false, filled:true }),
    new PolygonLayer({ id:'hp', data:[{p:HP_POLY}], getPolygon:d=>d.p, getFillColor:[32,44,72,190], stroked:false, filled:true }),
    new PolygonLayer({ id:'up', data:[{p:UP_POLY}], getPolygon:d=>d.p, getFillColor:[26,36,60,190], stroked:false, filled:true }),
    new PolygonLayer({ id:'uk', data:[{p:UK_POLY}], getPolygon:d=>d.p, getFillColor:[38,56,95,210], stroked:false, filled:true }),

    // ── 2. State border glow ───────────────────────────────────────────
    new PathLayer({
      id: 'uk-border-glow',
      data: [{ path: STATE_BORDER }],
      getPath: d => d.path,
      getColor: [99, 179, 237, 60],
      getWidth: 6,
      widthMinPixels: 4,
      rounded: true,
    }),
    new PathLayer({
      id: 'uk-border',
      data: [{ path: STATE_BORDER }],
      getPath: d => d.path,
      getColor: [147, 210, 255, 180],
      getWidth: 1.5,
      widthMinPixels: 1.5,
      rounded: true,
    }),

    // ── 3. Rivers ──────────────────────────────────────────────────────
    new PathLayer({
      id: 'rivers',
      data: RIVERS,
      getPath: d => d.path,
      getColor: d => d.color,
      getWidth: d => d.w,
      widthMinPixels: 1,
      rounded: true,
    }),

    // ── 4. City dots ──────────────────────────────────────────────────
    new ScatterplotLayer({
      id: 'cities',
      data: CITIES,
      getPosition: d => d.position,
      getRadius: d => d.r,
      getFillColor: d => d.tier === 1 ? [255,255,255,220] : d.tier === 2 ? [200,220,255,180] : [160,180,220,140],
      radiusMinPixels: d => d.tier === 1 ? 4 : 2,
      radiusMaxPixels: 8,
      stroked: true,
      getLineColor: [59,130,246,120],
      lineWidthMinPixels: 1,
    }),
    new TextLayer({
      id: 'city-labels',
      data: CITIES,
      getPosition: d => d.position,
      getText: d => d.name,
      getSize: d => d.tier === 1 ? 14 : d.tier === 2 ? 12 : 10,
      getColor: d => d.tier === 1 ? [255,255,255,230] : [180,210,255,190],
      getPixelOffset: [0, -18],
      getTextAnchor: 'middle',
      fontFamily: 'Inter, sans-serif',
      fontWeight: d => d.tier === 1 ? 'bold' : 'normal',
    }),

    // ── 5. Radar reflectivity storm cells ─────────────────────────────
    activeLayers.radar && new ScatterplotLayer({
      id: 'storm-radar',
      data: stormData,
      pickable: true,
      opacity: 0.90,
      filled: true,
      stroked: false,
      radiusMinPixels: 8,
      radiusMaxPixels: 200,
      getPosition: d => d.position,
      getRadius: d => d.radius,
      getFillColor: d => d.color,
      transitions: { getPosition:{duration:1000}, getRadius:{duration:1000}, getFillColor:{duration:700} },
    }),

    // ── 6. Outer halo ring ────────────────────────────────────────────
    activeLayers.radar && new ScatterplotLayer({
      id: 'storm-halo',
      data: stormData,
      pickable: false,
      opacity: 0.30,
      filled: false,
      stroked: true,
      lineWidthMinPixels: 2,
      radiusMinPixels: 10,
      getPosition: d => d.position,
      getRadius: d => d.radius * 1.4,
      getLineColor: d => [...d.color.slice(0,3), 200],
      transitions: { getPosition:{duration:1000}, getRadius:{duration:1000} },
    }),

    // ── 7. Motion vectors ─────────────────────────────────────────────
    activeLayers.radar && new LineLayer({
      id: 'vectors',
      data: vectorData,
      getWidth: 2.5,
      widthMinPixels: 2,
      getSourcePosition: d => d.sourcePosition,
      getTargetPosition: d => d.targetPosition,
      getColor: d => d.color,
    }),

    // ── 8. Lightning ──────────────────────────────────────────────────
    activeLayers.lightning && new ScatterplotLayer({
      id: 'lightning',
      data: lightData,
      pickable: false,
      opacity: 1.0,
      filled: true,
      radiusMinPixels: 2,
      radiusMaxPixels: 9,
      getPosition: d => d.position,
      getRadius: d => d.radius,
      getFillColor: d => d.color,
    }),

    // ── 9. dBZ labels ─────────────────────────────────────────────────
    activeLayers.radar && new TextLayer({
      id: 'dbz-labels',
      data: labelData,
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 13,
      getColor: [255, 255, 255, 240],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      getPixelOffset: [0, 0],
    }),
  ].filter(Boolean);

  return (
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 50%, #0d1832 0%, #070c1a 60%, #050810 100%)' }}>
      {/* SVG fallback basemap — visible immediately behind Deck.gl */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="75.5 -32 6.5 3.8"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Note: SVG Y-axis is inverted vs latitude, so lat -> -lat */}
        {/* Uttarakhand fill */}
        <polygon
          points="77.48,-30.42 77.60,-30.10 77.75,-29.85 78.00,-29.55 78.30,-29.15 78.75,-28.90 79.20,-28.95 79.60,-29.05 80.00,-29.15 80.40,-29.30 80.80,-29.50 81.00,-30.00 80.55,-30.45 80.00,-30.85 79.50,-31.20 79.00,-31.45 78.40,-31.30 78.00,-31.10 77.60,-30.80"
          fill="rgba(38,56,110,0.90)" stroke="rgba(99,179,237,0.8)" strokeWidth="0.05"
        />
        {/* HP fill */}
        <polygon
          points="75.60,-30.40 76.00,-30.55 76.60,-30.70 77.20,-30.90 77.48,-30.42 77.60,-30.10 77.40,-29.70 77.10,-29.40 76.80,-29.20 76.40,-29.40 76.00,-29.80 75.70,-30.10"
          fill="rgba(32,44,80,0.85)" stroke="rgba(99,179,237,0.35)" strokeWidth="0.03"
        />
        {/* UP strip */}
        <polygon
          points="77.48,-30.42 78.30,-29.15 78.75,-28.90 79.20,-28.95 79.60,-29.05 80.40,-29.30 81.00,-30.00 81.00,-28.60 79.00,-28.40 77.00,-28.50 76.60,-28.80 76.80,-29.20 77.10,-29.40 77.40,-29.70 77.60,-30.10"
          fill="rgba(26,36,70,0.85)" stroke="rgba(99,179,237,0.28)" strokeWidth="0.03"
        />
        {/* Ganga */}
        <polyline
          points="79.07,-30.90 78.85,-30.30 78.40,-30.05 78.15,-29.95 78.00,-30.00 77.90,-29.70 78.20,-29.45 78.55,-29.15 79.00,-28.90"
          fill="none" stroke="rgba(56,189,248,0.65)" strokeWidth="0.07" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* Yamuna */}
        <polyline
          points="77.95,-30.70 77.80,-30.50 77.65,-30.20 77.50,-29.95"
          fill="none" stroke="rgba(56,189,248,0.50)" strokeWidth="0.05" strokeLinecap="round"
        />
        {/* Alaknanda */}
        <polyline
          points="79.85,-30.70 79.50,-30.50 79.10,-30.25 78.90,-30.00 78.60,-29.80"
          fill="none" stroke="rgba(56,189,248,0.45)" strokeWidth="0.05" strokeLinecap="round"
        />
        {/* City dots */}
        <circle cx="78.03" cy="-30.32" r="0.12" fill="white" opacity="0.95" />
        <circle cx="78.16" cy="-29.95" r="0.09" fill="rgba(200,220,255,0.85)" />
        <circle cx="78.77" cy="-30.09" r="0.09" fill="rgba(200,220,255,0.85)" />
        <circle cx="79.43" cy="-30.73" r="0.08" fill="rgba(180,200,240,0.75)" />
        <circle cx="79.93" cy="-29.38" r="0.08" fill="rgba(180,200,240,0.75)" />
        <circle cx="79.21" cy="-29.37" r="0.07" fill="rgba(180,200,240,0.70)" />
        <circle cx="78.97" cy="-30.42" r="0.07" fill="rgba(180,200,240,0.70)" />
        {/* City name labels */}
        <text x="78.03" y="-30.50" fontSize="0.14" fill="rgba(255,255,255,0.90)" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">Dehradun</text>
        <text x="78.16" y="-29.75" fontSize="0.11" fill="rgba(200,220,255,0.80)" textAnchor="middle" fontFamily="sans-serif">Haridwar</text>
        <text x="78.77" y="-29.89" fontSize="0.11" fill="rgba(200,220,255,0.80)" textAnchor="middle" fontFamily="sans-serif">Rishikesh</text>
        <text x="79.43" y="-30.93" fontSize="0.10" fill="rgba(180,200,240,0.70)" textAnchor="middle" fontFamily="sans-serif">Uttarkashi</text>
        <text x="79.93" y="-29.18" fontSize="0.10" fill="rgba(180,200,240,0.70)" textAnchor="middle" fontFamily="sans-serif">Almora</text>
      </svg>
      {/* Deck.gl canvas — must fill container */}
      <style>{`canvas { width:100% !important; height:100% !important; }`}</style>
      <DeckGL
        style={{ width: '100%', height: '100%' }}
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={{ doubleClickZoom: false }}
        getCursor={({ isDragging }) => isDragging ? 'grabbing' : 'crosshair'}
        getTooltip={({ object }) =>
          object?.dBZ
            ? { html: `<div style="background:#0f172a;padding:8px 12px;border-radius:8px;border:1px solid rgba(99,179,237,0.3);font-family:monospace;font-size:12px;color:#e2e8f0;line-height:1.5"><b style="color:#93c5fd">Reflectivity</b><br/>${object.dBZ} dBZ</div>` }
            : null
        }
      />
    </div>
  );
}
