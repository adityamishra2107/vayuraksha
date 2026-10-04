"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Check, ChevronRight, Map, Radio, Settings as SettingsIcon, Shield, SlidersHorizontal } from "lucide-react";

const initialSettings = [
  { id: "alerts", title: "CAP alert notifications", description: "Show severe-weather alerts from the VayuRaksha alert stream.", icon: Bell, enabled: true },
  { id: "sound", title: "Alert sound", description: "Play an audible signal when a new extreme alert is received.", icon: Radio, enabled: false },
  { id: "terrain", title: "3D terrain mode", description: "Keep elevation enabled while exploring threat zones.", icon: Map, enabled: true },
  { id: "auto", title: "Auto-play forecast", description: "Advance the 0–6 hour forecast timeline automatically.", icon: SlidersHorizontal, enabled: false },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const toggle = (id) => setSettings((current) => current.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      <nav className="border-b border-white/10 bg-slate-950/85 px-5 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"><ArrowLeft size={17} /> Dashboard</Link>
          <img src="/vayuraksha-logo.png" alt="VayuRaksha" className="h-9 w-20 rounded bg-white object-contain p-1" />
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300"><SettingsIcon size={13} /> Operations preferences</div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="mt-2 text-sm text-slate-400">Configure how VayuRaksha presents forecasts, terrain and CAP alerts.</p>
        </div>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-md">
          <div className="border-b border-white/10 px-5 py-4"><h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white"><Shield size={16} className="text-blue-300" /> Dashboard behavior</h2></div>
          <div className="divide-y divide-white/5">
            {settings.map(({ id, title, description, icon: Icon, enabled }) => (
              <div key={id} className="flex items-center justify-between gap-4 px-5 py-5">
                <div className="flex items-start gap-3"><div className="rounded-lg border border-white/10 bg-white/5 p-2"><Icon size={17} className="text-blue-300" /></div><div><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div></div>
                <button aria-pressed={enabled} onClick={() => toggle(id)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${enabled ? "bg-blue-600" : "bg-slate-700"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${enabled ? "left-6" : "left-1"}`}>{enabled && <Check size={11} className="m-1 text-blue-600" />}</span></button>
              </div>
            ))}
          </div>
        </section>
        <Link href="/alerts" className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-5 py-4 text-sm text-slate-300 transition hover:bg-white/5"><span className="flex items-center gap-2"><Bell size={16} className="text-red-300" /> Manage CAP alert feed</span><ChevronRight size={16} className="text-slate-500" /></Link>
      </main>
    </div>
  );
}
