"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, Bell, CheckCircle2, CloudLightning,
  Filter, MapPin, Search, ShieldAlert,
} from "lucide-react";

const MOCK_ALERTS = [
  { id: "CAP-IN-001", type: "Cloudburst", severity: "Extreme", location: "Uttarkashi, Uttarakhand", time: "10 mins ago", status: "Active" },
  { id: "CAP-IN-002", type: "Severe Hail", severity: "Severe", location: "Shimla, Himachal Pradesh", time: "25 mins ago", status: "Active" },
  { id: "CAP-IN-003", type: "Flash Flood", severity: "Moderate", location: "Mandi, Himachal Pradesh", time: "1 hour ago", status: "Downgraded" },
  { id: "CAP-IN-004", type: "Lightning", severity: "Severe", location: "Dehradun, Uttarakhand", time: "2 hours ago", status: "Resolved" },
];

const severityStyles = {
  Extreme: "border-purple-400/30 bg-purple-500/15 text-purple-300",
  Severe: "border-red-400/30 bg-red-500/15 text-red-300",
  Moderate: "border-amber-400/30 bg-amber-500/15 text-amber-300",
};

export default function AlertsPage() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");
  const filteredAlerts = useMemo(() => MOCK_ALERTS.filter((alert) => {
    const matchesQuery = `${alert.id} ${alert.type} ${alert.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (severity === "All" || alert.severity === severity);
  }), [query, severity]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      <nav className="border-b border-white/10 bg-slate-950/85 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
              <ArrowLeft size={17} /> Dashboard
            </Link>
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <img src="/vayuraksha-logo.png" alt="VayuRaksha" className="h-9 w-20 rounded bg-white object-contain p-1" />
              <span className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:block">Alert Operations</span>
            </div>
          </div>
          <Link href="/dashboard" aria-label="Return to dashboard" className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10">
            <Bell size={17} />
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> Live CAP stream
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
              <ShieldAlert className="text-red-400" size={30} /> Alert Operations
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Monitor, filter and acknowledge Common Alerting Protocol warnings issued by VayuRaksha.</p>
          </div>
          <Link href="/dashboard" className="rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">
            View threat map
          </Link>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Active alerts", MOCK_ALERTS.filter((a) => a.status === "Active").length, "text-red-300"],
            ["Extreme", MOCK_ALERTS.filter((a) => a.severity === "Extreme").length, "text-purple-300"],
            ["Regions covered", new Set(MOCK_ALERTS.map((a) => a.location.split(", ")[1])).size, "text-blue-300"],
            ["Last sync", "12:14 IST", "text-emerald-300"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
              <p className={`mt-2 text-xl font-extrabold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 backdrop-blur-md md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search alert ID, hazard or district..." className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            {["All", "Extreme", "Severe", "Moderate"].map((item) => (
              <button key={item} onClick={() => setSeverity(item)} className={`rounded-lg px-3 py-2 text-xs font-bold transition ${severity === item ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">CAP warning feed</h2>
            <span className="text-xs text-slate-500">{filteredAlerts.length} results</span>
          </div>
          <div className="divide-y divide-white/5">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="flex flex-col gap-4 px-5 py-4 transition hover:bg-white/[0.03] md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {alert.type === "Cloudburst" ? <AlertTriangle className="mt-0.5 shrink-0 text-purple-300" size={18} /> : <CloudLightning className="mt-0.5 shrink-0 text-amber-300" size={18} />}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-300">{alert.id}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${severityStyles[alert.severity]}`}>{alert.severity}</span>
                    </div>
                    <p className="mt-1 font-semibold text-white">{alert.type}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><MapPin size={12} /> {alert.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 text-xs md:text-right">
                  <div><p className="text-slate-500">Issued</p><p className="mt-1 text-slate-300">{alert.time}</p></div>
                  <div><p className="text-slate-500">Status</p><p className={`mt-1 flex items-center gap-1 font-bold ${alert.status === "Active" ? "text-emerald-300" : "text-slate-400"}`}>{alert.status === "Active" ? <CheckCircle2 size={13} /> : null}{alert.status}</p></div>
                </div>
              </div>
            ))}
            {filteredAlerts.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No alerts match the selected filters.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
