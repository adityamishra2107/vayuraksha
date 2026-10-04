"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Bell, Settings, Zap, CloudRain, Wind,
  Thermometer, Shield, Activity, Radio,
} from "lucide-react";
import ForecastHorizonScrubber from "@/components/ForecastHorizonScrubber";

// SSR-safe dynamic import (WebGL requires browser)
const WeatherMap = dynamic(() => import("@/components/WeatherMap"), { ssr: false });

// ── Per-step weather metrics (simulated IMD DWR data) ────────────────────────
const METRICS = [
  { dBZ: 28, echoTop: 6,  mesh: 0,  cbRisk: 8,  lightning: 15,  wind: 22, temp: 31, label: "Developing" },
  { dBZ: 34, echoTop: 8,  mesh: 0,  cbRisk: 18, lightning: 40,  wind: 28, temp: 29, label: "Strengthening" },
  { dBZ: 41, echoTop: 10, mesh: 5,  cbRisk: 32, lightning: 85,  wind: 38, temp: 27, label: "Strengthening" },
  { dBZ: 48, echoTop: 11, mesh: 12, cbRisk: 52, lightning: 130, wind: 46, temp: 25, label: "Severe" },
  { dBZ: 55, echoTop: 13, mesh: 22, cbRisk: 68, lightning: 190, wind: 56, temp: 23, label: "Extreme" },
  { dBZ: 63, echoTop: 15, mesh: 38, cbRisk: 84, lightning: 240, wind: 68, temp: 21, label: "EXTREME" },
  { dBZ: 61, echoTop: 14, mesh: 32, cbRisk: 78, lightning: 200, wind: 62, temp: 21, label: "Extreme" },
  { dBZ: 52, echoTop: 12, mesh: 18, cbRisk: 60, lightning: 140, wind: 50, temp: 22, label: "Severe" },
  { dBZ: 44, echoTop: 10, mesh: 8,  cbRisk: 40, lightning: 80,  wind: 38, temp: 24, label: "Moderate" },
  { dBZ: 36, echoTop: 8,  mesh: 2,  cbRisk: 22, lightning: 35,  wind: 28, temp: 27, label: "Weakening" },
  { dBZ: 28, echoTop: 6,  mesh: 0,  cbRisk: 10, lightning: 12,  wind: 18, temp: 29, label: "Dissipating" },
  { dBZ: 68, echoTop: 16, mesh: 42, cbRisk: 92, lightning: 280, wind: 72, temp: 20, label: "EXTREME" },
];

function getThreatColor(dBZ) {
  if (dBZ >= 60) return "#7e22ce";
  if (dBZ >= 55) return "#dc2626";
  if (dBZ >= 45) return "#d97706";
  if (dBZ >= 35) return "#b45309";
  return "#0369a1";
}

function HazardCard({ icon: Icon, title, value, unit, subtitle, color, isSevere }) {
  return (
    <motion.div
      layout
      className="rounded-xl border bg-slate-900/70 backdrop-blur-md p-4 overflow-hidden relative"
      style={{ borderColor: isSevere ? color + "55" : "rgba(255,255,255,0.07)" }}
    >
      {isSevere && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${color}18, transparent 70%)` }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon size={13} style={{ color }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-extrabold"
              style={{ color }}
            >
              {value}
            </motion.span>
            <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{subtitle}</p>
        </div>
        {isSevere && (
          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 tracking-widest">
            ALERT
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [forecastData, setForecastData] = useState([]);
  const [capAlert, setCapAlert] = useState(null);
  const wsRef = useRef(null);

  // Fetch pre-calculated 0-6 hour forecast data from FastAPI
  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch("http://localhost:8001/api/forecast");
        const json = await res.json();
        if (json.status === "success") {
          setForecastData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch forecast from backend:", err);
      }
    }
    fetchForecast();
  }, []);

  // Connect to WebSocket for CAP alerts
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8001/api/ws/alerts");
    
    ws.onopen = () => {
      console.log("WebSocket connected to VayuRaksha Command Center");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "CAP_ALERT") {
          console.log("Received CAP Alert:", data.alert);
          setCapAlert(data.alert);
          // Auto-clear alert after 10 seconds for demo purposes
          setTimeout(() => setCapAlert(null), 10000);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, []);

  // Send the current step to the backend to simulate real-time progression
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(activeIndex.toString());
    }
  }, [activeIndex]);

  // Lock body scroll for full-screen map
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const m = METRICS[activeIndex] || METRICS[0];
  const threatColor = getThreatColor(m.dBZ);
  const isExtreme = m.dBZ >= 55;

  useEffect(() => {
    if (m.dBZ < 55) {
      const clearAlert = setTimeout(() => setCapAlert(null), 0);
      return () => clearTimeout(clearAlert);
    }

    const showAlert = setTimeout(() => {
      setCapAlert({
        info: {
          headline: "Severe Cloudburst Alert Issued",
          area: { areaDesc: "Active scan zone" },
        },
      });
    }, 0);
    const dismiss = setTimeout(() => setCapAlert(null), 10000);
    return () => {
      clearTimeout(showAlert);
      clearTimeout(dismiss);
    };
  }, [activeIndex, m.dBZ]);

  return (
    <div className="relative w-screen h-screen bg-[#070b14] overflow-hidden text-white">

      {/* ── 1. MAP BACKGROUND (z-0) ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <WeatherMap 
          activeIndex={activeIndex} 
          stormData={forecastData[activeIndex]?.geojson || { type: "FeatureCollection", features: [] }} 
        />
      </div>

      {/* ── 2. FLOATING UI OVERLAYS (z-10) ──────────────────────────────── */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">

        <AnimatePresence>
          {capAlert && (
            <motion.div
              initial={{ opacity: 0, x: 28, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 28 }}
              className="pointer-events-auto absolute right-4 top-20 z-30 w-[min(90vw,24rem)] rounded-xl border border-red-400/50 bg-red-950/90 p-3 shadow-[0_12px_40px_rgba(127,29,29,0.45)] backdrop-blur-xl"
              role="alert"
            >
              <div className="flex items-start gap-2">
                <Bell size={17} className="mt-0.5 shrink-0 text-red-300" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-300">CAP Alert · PostGIS Engine</p>
                  <p className="mt-1 text-sm font-bold text-white">⚠️ SEVERE CLOUDBURST ALERT ISSUED</p>
                  <p className="mt-1 text-[11px] text-red-100/75">{capAlert.info?.area?.areaDesc || "Threat scan area"}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP NAVBAR */}
        <header className="pointer-events-auto relative z-20 flex min-h-[68px] justify-between items-center px-5 py-2.5 bg-slate-950/85 backdrop-blur-xl border-b border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-12 w-24 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white p-1 shadow-lg">
              <img src="/vayuraksha-logo.png" alt="VayuRaksha" className="h-full w-full object-contain" />
            </div>
            <div className="hidden md:block">
              <span className="block text-[11px] text-slate-200 font-bold uppercase tracking-[0.24em]">Command Dashboard</span>
              <span className="mt-0.5 block text-[9px] text-slate-400 uppercase tracking-widest">VayuRaksha Nowcast Operations</span>
            </div>
          </div>

          {/* Live threat badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-extrabold tracking-wider shadow-lg"
              style={{ color: threatColor, borderColor: threatColor + "50", background: threatColor + "15" }}
            >
              {isExtreme && <span className="w-1.5 h-1.5 rounded-full animate-ping absolute" style={{ background: threatColor }} />}
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: threatColor }} />
              THREAT: {m.label.toUpperCase()}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <Link aria-label="Open alerts" href="/alerts" className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 transition-colors">
              <Bell size={17} className="text-slate-200" />
            </Link>
            <Link aria-label="Open settings" href="/settings" className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 transition-colors">
              <Settings size={17} className="text-slate-200" />
            </Link>
            <Link aria-label="Open home" href="/" className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 hover:bg-white/20 transition-colors">
              <Home size={17} className="text-slate-200" />
            </Link>
          </div>
        </header>

        {/* MIDDLE LAYER — left sidebar + right panel */}
        <div className="flex-1 flex justify-between p-3 gap-3 overflow-hidden">

          {/* LEFT — Hazard Matrix */}
          <aside className="pointer-events-auto w-64 flex flex-col gap-2.5 overflow-y-auto custom-scroll">
            {/* AI Insight banner */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 backdrop-blur-md p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Radio size={11} className="text-blue-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400">AI Insight · ConvLSTM</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {m.dBZ >= 55
                  ? "⚡ Extreme supercell. Hail likely > 38mm. Imminent cloudburst risk."
                  : m.dBZ >= 45
                  ? "⚠️ Severe convection active. Echo tops rising rapidly."
                  : m.dBZ >= 35
                  ? "🌧 Moderate storm cell developing. Monitor closely."
                  : "📡 Weak convection. Monitoring for initiation triggers."}
              </p>
            </div>

            <HazardCard icon={Activity}    title="Max Reflectivity"  value={m.dBZ}       unit="dBZ"   subtitle="Radar peak return"          color="#3b82f6" isSevere={capAlert != null || m.dBZ>=55} />
            <HazardCard icon={Wind}        title="Echo Top"          value={m.echoTop}   unit="km"    subtitle="Storm top altitude"          color="#818cf8" isSevere={capAlert != null || m.echoTop>=13} />
            <HazardCard icon={Shield}      title="MESH (Hail)"       value={m.mesh}      unit="mm"    subtitle="Max Expected Hail Size"      color="#a78bfa" isSevere={capAlert != null || m.mesh>=25} />
            <HazardCard icon={CloudRain}   title="Cloudburst Risk"   value={m.cbRisk}    unit="%"     subtitle="Probability next 30 min"     color={threatColor} isSevere={capAlert != null || m.cbRisk>=70} />
            <HazardCard icon={Zap}         title="Lightning Density" value={m.lightning} unit="/min"  subtitle="Estimated flash rate"        color="#eab308" isSevere={capAlert != null || m.lightning>=150} />
            <HazardCard icon={Thermometer} title="Surface Temp"      value={m.temp}      unit="°C"   subtitle="Estimated near-surface"      color="#22d3ee" isSevere={capAlert != null} />
          </aside>

          {/* RIGHT — Map controls */}
          <aside className="pointer-events-auto w-52 flex flex-col gap-2.5">
            <div className="rounded-xl border border-white/8 bg-slate-900/70 backdrop-blur-md p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3">Data Layers</p>
              {[
                { key: "radar",     label: "Radar Reflectivity", color: "#3b82f6", on: true },
                { key: "lightning", label: "Lightning Strikes",  color: "#eab308", on: true },
                { key: "mesh",      label: "MESH Hail Cores",    color: "#a78bfa", on: m.mesh > 0 },
                { key: "satellite", label: "IR Cloud Top",       color: "#22d3ee", on: false },
              ].map((l) => (
                <div key={l.key} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: l.on ? l.color : "#374151" }} />
                    <span className={`text-xs ${l.on ? "text-slate-200" : "text-slate-600"}`}>{l.label}</span>
                  </div>
                  <span className={`text-[9px] font-bold ${l.on ? "text-green-400" : "text-slate-600"}`}>{l.on ? "ON" : "OFF"}</span>
                </div>
              ))}
            </div>

            {/* dBZ colour scale */}
            <div className="rounded-xl border border-white/8 bg-slate-900/70 backdrop-blur-md p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Reflectivity (dBZ)</p>
              <div className="h-2 rounded-full" style={{ background: "linear-gradient(90deg,#0369a1,#16a34a,#d97706,#dc2626,#7e22ce)" }} />
              <div className="flex justify-between text-[8px] text-slate-500 mt-1">
                <span>20</span><span>30</span><span>40</span><span>50</span><span>60+</span>
              </div>
            </div>

            {/* Storm motion */}
            <div className="rounded-xl border border-white/8 bg-slate-900/70 backdrop-blur-md p-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Storm Motion</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center relative">
                  <div className="w-0.5 h-3 bg-blue-400 absolute" style={{ transform: "rotate(25deg)", transformOrigin: "bottom center", bottom: "50%", left: "50%", marginLeft: "-1px" }} />
                  <span className="absolute text-[6px] top-0.5 text-blue-300 font-bold">N</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">NNE @ 32 km/h</p>
                  <p className="text-[9px] text-slate-500">Bearing 025°</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM — Forecast Scrubber */}
        <div className="pointer-events-auto">
          <ForecastHorizonScrubber activeIndex={activeIndex} onChange={setActiveIndex} />
        </div>
      </div>
    </div>
  );
}
