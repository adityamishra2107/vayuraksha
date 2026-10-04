"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Crosshair, Activity, ArrowLeft,
  Bell, Zap, Radio, CheckCircle, AlertTriangle, XCircle,
  RefreshCw, Terminal, Users, Map, Clock, Database, Cpu,
  Wifi, Server, Send, ChevronRight,
} from "lucide-react";

const SYSTEM_SERVICES = [
  { id: "radar",    label: "IMD DWR Radar Sync",      status: "operational", uptime: "99.8%", latency: "42ms" },
  { id: "insat",   label: "INSAT-3DR Telemetry",      status: "operational", uptime: "99.2%", latency: "87ms" },
  { id: "ai",      label: "ConvLSTM Inference Engine", status: "high_load",   uptime: "98.5%", latency: "380ms" },
  { id: "wrf",     label: "WRF Physics Model",         status: "operational", uptime: "99.6%", latency: "210ms" },
  { id: "postgis", label: "PostGIS Spatial DB",         status: "operational", uptime: "100%",  latency: "5ms"  },
  { id: "cap",     label: "NDMA CAP Gateway",           status: "operational", uptime: "99.9%", latency: "62ms" },
  { id: "kafka",   label: "Kafka Data Pipeline",        status: "operational", uptime: "99.7%", latency: "18ms" },
  { id: "redis",   label: "Redis Forecast Cache",       status: "operational", uptime: "100%",  latency: "2ms"  },
];

const GEOFENCE_ZONES = [
  { id: "GEO-001", name: "Dehradun Urban Core",      pop: "835,000",  risk: "HIGH",   color: "#ef4444" },
  { id: "GEO-002", name: "Rishikesh Pilgrim Zone",   pop: "102,000",  risk: "SEVERE", color: "#f97316" },
  { id: "GEO-003", name: "Haridwar Kumbh Area",      pop: "228,000",  risk: "MODERATE", color: "#eab308" },
  { id: "GEO-004", name: "Uttarkashi Cloudburst Belt", pop: "18,000", risk: "EXTREME", color: "#ef4444" },
  { id: "GEO-005", name: "Nainital Lake Buffer",     pop: "41,000",   risk: "LOW",    color: "#22d3ee" },
];

const CAP_TEMPLATES = [
  { id: "extreme", label: "Extreme Supercell Warning", severity: "EXTREME", color: "#ef4444", event: "Severe Convection & Cloudburst Risk" },
  { id: "hail",    label: "Large Hail Advisory",       severity: "SEVERE",  color: "#f97316", event: "MESH > 30mm Hailstorm Warning" },
  { id: "flood",   label: "Flash Flood Watch",         severity: "MODERATE", color: "#eab308", event: "Rapid Runoff — Flash Flood Watch" },
  { id: "lightning", label: "Lightning Safety Alert",  severity: "HIGH",    color: "#a78bfa", event: "Lightning Density > 150 /min" },
];

function StatusIcon({ status }) {
  if (status === "operational") return <CheckCircle size={14} className="text-emerald-400" />;
  if (status === "high_load")   return <AlertTriangle size={14} className="text-amber-400" />;
  return <XCircle size={14} className="text-red-400" />;
}

function StatusBadge({ status }) {
  const map = {
    operational: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
    high_load:   "text-amber-400  bg-amber-400/10  border-amber-400/25",
    down:        "text-red-400    bg-red-400/10    border-red-400/25",
  };
  const label = { operational: "OPERATIONAL", high_load: "HIGH LOAD", down: "DOWN" };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border tracking-widest ${map[status] || map.operational}`}>
      {label[status] || status.toUpperCase()}
    </span>
  );
}

export default function CommandCenter() {
  const [log, setLog]             = useState([
    { msg: "[SYSTEM] VayuRaksha Command Node Initialized…", type: "info", ts: new Date().toLocaleTimeString("en-IN", { hour12: false }) },
  ]);
  const [sending, setSending]     = useState(null);
  const [sentAlerts, setSentAlerts] = useState([]);
  const [wsStatus, setWsStatus]   = useState("connecting");
  const [activeTab, setActiveTab] = useState("status");
  const [stepSim, setStepSim]     = useState(0);
  const wsRef  = useRef(null);
  const logRef = useRef(null);

  function addLog(msg, type = "info") {
    const ts = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLog(prev => [...prev.slice(-40), { msg, type, ts }]);
    setTimeout(() => logRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 50);
  }

  // Connect to backend WS
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8001/api/ws/alerts");
    wsRef.current = ws;

    ws.onopen  = () => { setWsStatus("connected"); addLog("✓ WebSocket connected to FastAPI backend", "success"); };
    ws.onerror = () => { setWsStatus("error");     addLog("✗ WebSocket connection failed", "error"); };
    ws.onclose = () => { setWsStatus("closed");    addLog("WebSocket closed", "warn"); };
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.type === "CAP_ALERT") addLog(`▲ CAP ALERT received: ${d.alert?.info?.headline}`, "alert");
      } catch {}
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    const mockLogs = [
      ["[KAFKA] Ingesting DWR volume scan (Nagpur) · 45MB", "info"],
      ["[CELERY] Grid conversion complete · 142ms", "success"],
      ["[ConvLSTM] GPU inference running · 0–2hr projection", "info"],
      ["[POSTGIS] ST_Intersects querying vulnerable talukas…", "info"],
      ["[CAP] No immediate severe threats detected · Standby", "success"],
    ];
    let index = 0;
    const interval = setInterval(() => {
      const [msg, type] = mockLogs[index % mockLogs.length];
      addLog(msg, type);
      index += 1;
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  async function sendCAP(template) {
    setSending(template.id);
    addLog(`Issuing ${template.label}…`, "info");
    try {
      // Simulate triggering step 4 (which fires CAP alert from backend)
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send("4");
      }
      await new Promise(r => setTimeout(r, 1200));
      setSentAlerts(prev => [...prev, { ...template, time: new Date().toLocaleTimeString("en-IN", { hour12: false }) }]);
      addLog(`✓ ${template.label} broadcast to NDMA CAP Gateway`, "success");
    } catch (err) {
      addLog(`✗ Failed to send alert: ${err.message}`, "error");
    } finally {
      setSending(null);
    }
  }

  function simulateStep(s) {
    setStepSim(s);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(s.toString());
      addLog(`Simulated forecast step ${s} sent to backend`, "info");
    }
  }

  const wsColor = { connected: "text-emerald-400", connecting: "text-amber-400", error: "text-red-400", closed: "text-slate-500" }[wsStatus];
  const wsLabel = { connected: "LIVE", connecting: "CONNECTING", error: "ERROR", closed: "CLOSED" }[wsStatus];

  const TABS = [
    { id: "status",    label: "System Status", icon: Activity },
    { id: "alerts",    label: "CAP Dispatch",  icon: ShieldAlert },
    { id: "geofences", label: "Geofences",     icon: Crosshair },
    { id: "simulate",  label: "Simulator",     icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="h-14 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <img src="/vayuraksha-logo.png" alt="VayuRaksha" className="h-10 w-32 object-contain object-center" />
            <ChevronRight size={14} className="text-slate-600" />
            <span className="text-slate-400 text-sm">Command Center</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* WS status indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/8">
            <span className={`w-1.5 h-1.5 rounded-full ${wsStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span className={`text-[10px] font-bold tracking-widest ${wsColor}`}>{wsLabel}</span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition text-xs font-bold text-white">
            <Map size={13} /> Dashboard
          </Link>
          <Link href="/alerts" className="p-2 rounded-lg border border-white/8 bg-white/5 hover:bg-white/10 transition">
            <Bell size={15} className="text-slate-400" />
          </Link>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-8">

        {/* ── PAGE HEADER ─────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <div className="p-2 bg-red-500/15 rounded-xl border border-red-500/25">
              <ShieldAlert size={24} className="text-red-400" />
            </div>
            Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Manage CAP alerts, geofences, system health, and simulate forecast progression.
          </p>
        </div>

        {/* ── QUICK STATS ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Server,   label: "Services Online",   value: `${SYSTEM_SERVICES.filter(s=>s.status==="operational").length}/${SYSTEM_SERVICES.length}`, color: "text-emerald-400" },
            { icon: Radio,    label: "Active WS Clients", value: "1", color: "text-blue-400" },
            { icon: Bell,     label: "Alerts Sent",       value: sentAlerts.length.toString(), color: "text-amber-400" },
            { icon: Database, label: "Forecast Steps",    value: "11 (0–6h)", color: "text-purple-400" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-slate-900/70 backdrop-blur-md p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={14} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</span>
              </div>
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT 2/3 — Tabbed Panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-900/60 rounded-xl border border-white/8 w-fit">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === t.id ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: System Status */}
            {activeTab === "status" && (
              <div className="rounded-2xl border border-white/8 bg-slate-900/70 backdrop-blur-md p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Server size={15} className="text-blue-400" /> System Health Monitor</h3>
                <div className="flex flex-col gap-2">
                  {SYSTEM_SERVICES.map(svc => (
                    <div key={svc.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <StatusIcon status={svc.status} />
                        <span className="text-sm text-slate-200 font-medium">{svc.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-slate-500 font-mono">↑{svc.uptime}</span>
                        <span className="text-[10px] text-slate-500 font-mono">⏱{svc.latency}</span>
                        <StatusBadge status={svc.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: CAP Dispatch */}
            {activeTab === "alerts" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert size={15} className="text-red-400" /> Manual CAP Alert Dispatch</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {CAP_TEMPLATES.map(t => (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendCAP(t)}
                        disabled={sending !== null}
                        className="text-left p-4 rounded-xl border transition-all group disabled:opacity-50"
                        style={{ borderColor: t.color + "33", background: t.color + "08" }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded border tracking-widest"
                            style={{ color: t.color, borderColor: t.color + "40", background: t.color + "15" }}>
                            {t.severity}
                          </span>
                          {sending === t.id
                            ? <RefreshCw size={13} className="animate-spin text-slate-400" />
                            : <Send size={13} className="text-slate-600 group-hover:text-white transition" />}
                        </div>
                        <p className="text-sm font-bold text-white">{t.label}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{t.event}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
                {sentAlerts.length > 0 && (
                  <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-6">
                    <h3 className="text-sm font-bold text-white mb-3">Broadcast History</h3>
                    {sentAlerts.map((a, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs text-slate-300">{a.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                            style={{ color: a.color, borderColor: a.color + "40", background: a.color + "15" }}>
                            {a.severity}
                          </span>
                          <span className="text-[10px] text-slate-600 font-mono">{a.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Geofences */}
            {activeTab === "geofences" && (
              <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Crosshair size={15} className="text-blue-400" /> Active Geofence Zones — Uttarakhand</h3>
                <div className="flex flex-col gap-2">
                  {GEOFENCE_ZONES.map(z => (
                    <div key={z.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-white/10 transition bg-white/2">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: z.color, boxShadow: `0 0 6px ${z.color}80` }} />
                        <div>
                          <p className="text-sm font-semibold text-white">{z.name}</p>
                          <p className="text-[10px] text-slate-500">Pop: {z.pop} · ID: {z.id}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded border tracking-widest"
                        style={{ color: z.color, borderColor: z.color + "40", background: z.color + "15" }}>
                        {z.risk}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 mt-4 flex items-center gap-1"><Map size={11} /> Zones are drawn from PostGIS spatial polygons via ST_Intersects.</p>
              </div>
            )}

            {/* Tab: Simulator */}
            {activeTab === "simulate" && (
              <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-6">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Zap size={15} className="text-amber-400" /> Forecast Step Simulator</h3>
                <p className="text-[11px] text-slate-500 mb-6">Send a forecast step index to the backend via WebSocket. Step 4 triggers the Dehradun Cloudburst CAP alert. Step 7 triggers the Rishikesh Hail alert.</p>
                <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 mb-6">
                  {Array.from({ length: 11 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => simulateStep(i)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${stepSim === i ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "border-white/10 text-slate-400 hover:text-white hover:border-white/20 bg-white/3"}`}
                    >
                      {i === 0 ? "Now" : `+${i * 36}m`}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-white/8 bg-slate-950/80 p-3 text-[11px] text-slate-400">
                  <p>Step {stepSim} metadata:</p>
                  <p className="font-mono mt-1 text-blue-300">
                    {`{ dBZ: ${28 + stepSim * 4}, echoTop: ${6 + stepSim}km, cbRisk: ${8 + stepSim * 8}%, step: ${stepSim} }`}
                  </p>
                </div>
                <p className="text-[10px] text-slate-600 mt-3 flex items-center gap-1"><Cpu size={10} /> Backend at localhost:8001 — WS status: <span className={wsColor}>{wsLabel}</span></p>
              </div>
            )}
          </div>

          {/* RIGHT 1/3 — Live Terminal Log */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur-md p-4 shadow-sm flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={14} className="text-blue-400" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">VayuRaksha · Live System Log</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div ref={logRef} className="h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[10px] space-y-1.5 pr-1 text-slate-700 shadow-inner custom-scroll">
                {log.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-500 flex-shrink-0">{l.ts}</span>
                    <span className={{
                      info:    "text-slate-700",
                      success: "text-emerald-700",
                      error:   "text-red-700",
                      warn:    "text-amber-700",
                      alert:   "text-orange-700 font-bold",
                    }[l.type] || "text-slate-700"}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Personnel */}
            <div className="rounded-2xl border border-white/8 bg-slate-900/70 backdrop-blur-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">Active Personnel</span>
              </div>
              {[
                { name: "IMD Ops Team",        role: "Radar Monitoring", online: true },
                { name: "NDMA Coordination",   role: "Alert Management", online: true },
                { name: "ISRO MOSDAC Uplink",  role: "Satellite Feed",   online: true },
                { name: "District DM Office",  role: "Field Response",   online: false },
              ].map(p => (
                <div key={p.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-slate-600">{p.role}</p>
                  </div>
                  <span className={`text-[9px] font-bold ${p.online ? "text-emerald-400" : "text-slate-600"}`}>
                    {p.online ? "● ONLINE" : "○ STANDBY"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
