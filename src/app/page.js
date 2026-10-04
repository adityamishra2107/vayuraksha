"use client";

import { motion } from 'framer-motion';
import {
  CloudLightning, ArrowRight, BrainCircuit, Mountain, ShieldAlert,
  Cpu, Radio, Satellite, Zap, Database, Globe, ChevronDown, Activity, Map
} from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Fade-up helper
// ---------------------------------------------------------------------------
const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {

  return (
    <div className="min-h-screen bg-background text-slate-200 selection:bg-accent-blue/30">

      {/* ================================================================
          NAV
      ================================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/vayuraksha-logo.png" alt="VayuRaksha" className="h-11 w-36 object-contain object-center transition-transform group-hover:scale-[1.03]" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[['#features','Features'],['#architecture','Architecture'],['#technology','Technology']].map(([href, label]) => (
              <a key={href} href={href} className="text-slate-400 hover:text-white transition-colors">{label}</a>
            ))}
            <Link href="/alerts" className="text-slate-400 hover:text-warning transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
              Live Alerts
            </Link>
            <Link href="/admin" className="text-slate-400 hover:text-white transition-colors">Command Center</Link>
          </div>

          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-lg bg-accent-blue text-white text-sm font-semibold hover:bg-blue-500 transition-all shadow-[0_0_18px_rgba(59,130,246,0.35)] hover:shadow-[0_0_28px_rgba(59,130,246,0.55)] flex items-center gap-2"
          >
            Open Dashboard <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ================================================================
          HERO
      ================================================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-200px] right-[-150px] w-[700px] h-[700px] bg-accent-blue/8 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-100px] left-[-200px] w-[600px] h-[600px] bg-purple-600/8 blur-[120px] rounded-full" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
          />
        </div>

        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-12 gap-12 lg:gap-16 items-start py-24 relative z-10">
          {/* Left — Copy */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-800 border border-white/8 text-xs font-bold uppercase tracking-widest mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
              <span className="text-slate-300 tracking-wider">EARLY WARNING SYSTEM &bull; 0&ndash;6 HOUR PREDICTIVE ENGINE</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl lg:text-[76px] font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 leading-[1.05] tracking-tight mb-8"
            >
              Hyper-Local<br />
              <span style={{ backgroundImage: 'linear-gradient(135deg,#3b82f6,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Convective Nowcasting
              </span><br />
              for India.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mb-12"
            >
              0–6 hour predictive intelligence for cloudbursts, hail, and severe lightning using{' '}
              <span className="text-slate-200 font-medium">multi-sensor AI</span>,{' '}
              <span className="text-slate-200 font-medium">Doppler radar extrapolation</span>, and{' '}
              <span className="text-slate-200 font-medium">WRF high-resolution physics models</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-xl bg-accent-blue text-white font-bold hover:bg-blue-500 transition-all shadow-[0_0_24px_rgba(59,130,246,0.4)] hover:shadow-[0_0_36px_rgba(59,130,246,0.6)] flex items-center gap-2 text-base group"
              >
                <Map size={18} />
                Launch Nowcast Map
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/alerts"
                className="px-8 py-4 rounded-xl border border-white/10 bg-brand-800/60 text-white font-semibold hover:bg-brand-700 transition-colors flex items-center gap-2 text-base"
              >
                <ShieldAlert size={18} className="text-warning" />
                Live CAP Alerts
              </Link>
            </motion.div>

            {/* Live stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-8 lg:gap-12 mt-16 pt-10 border-t border-white/10"
            >
              {[
                { val: '3 km', label: 'Spatial Resolution' },
                { val: '15 min', label: 'Update Frequency' },
                { val: '6 hr', label: 'Forecast Horizon' },
                { val: '94%', label: 'Detection Accuracy' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-xl font-extrabold text-white">{s.val}</div>
                  <div className="text-xs text-slate-500 font-medium">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Abstract Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-start-7 lg:col-span-6 relative w-full mt-12 lg:mt-0"
          >
            <DashboardMockup />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600 text-xs font-medium animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ================================================================
          FEATURES
      ================================================================ */}
      <section id="features" className="py-28 px-6 border-t border-white/5 bg-brand-900/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <FadeUp className="text-center mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-brand-800 border border-white/8 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Platform Pillars</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-4">Engineered for Mission-Critical Accuracy</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              VayuRaksha bridges the 0–6 hour gap between raw observations and actionable disaster warnings using a four-pillar architecture.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <BrainCircuit size={28} className="text-accent-blue" />,
                label: 'Spatio-Temporal AI',
                color: 'accent-blue',
                desc: 'ConvLSTM and pySTEPS optical-flow extrapolate radar reflectivity polygons up to 2 hours. Seamlessly blends into WRF physics for 2–6 hr.'
              },
              {
                icon: <Mountain size={28} className="text-purple-400" />,
                label: 'Terrain-Aware 3D',
                color: 'purple-400',
                desc: 'Overcomes radar beam blockage in mountainous Uttarakhand by fusing INSAT-3DR IR cooling rates and lightning sensor data.'
              },
              {
                icon: <Zap size={28} className="text-warning" />,
                label: 'Real Hazard Algorithms',
                color: 'warning',
                desc: 'Implements MESH for hail sizing using VIL and freezing levels. Detects cloudbursts via echo tops >12km + rain rate >100mm/hr.'
              },
              {
                icon: <Database size={28} className="text-accent-teal" />,
                label: 'PostGIS Alert Engine',
                color: 'accent-teal',
                desc: 'Storm polygons are intersected with district boundaries in PostGIS. Matching areas trigger NDMA-compliant CAP XML payloads automatically.'
              },
            ].map((f, i) => (
              <FadeUp key={f.label} delay={i * 0.08}>
                <div className="glass-panel p-6 rounded-2xl border border-white/8 hover:bg-white/[0.04] transition-all group h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-800 border border-white/8 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-3">{f.label}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          ARCHITECTURE
      ================================================================ */}
      <section id="architecture" className="py-28 px-6 border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <FadeUp className="mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-brand-800 border border-white/8 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">System Architecture</div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-100 mb-4">5-Stage Ingestion Pipeline</h2>
            <p className="text-lg text-slate-400 max-w-2xl">
              A fully cloud-native backend on FastAPI + Celery + Kafka, with PostGIS spatial alert routing and real-time WebSocket streaming to the frontend.
            </p>
          </FadeUp>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="grid lg:grid-cols-5 gap-6">
              {[
                { num: '01', icon: <Radio size={20} />, title: 'Data Ingestion', desc: 'IMD DWR + INSAT-3DR fetched every 10–15 min via Celery workers. Raw HDF5/binary parsed with wradlib + xarray.' },
                { num: '02', icon: <Cpu size={20} />,   title: 'AI Extrapolation', desc: 'pySTEPS optical flow computes motion field. ConvLSTM advects reflectivity grids to T+120 min at 3km resolution.' },
                { num: '03', icon: <Satellite size={20} />, title: 'WRF Blending', desc: 'Weighted morphing transition from radar extrapolation to WRF physics output for the T+2hr to T+6hr window.' },
                { num: '04', icon: <Globe size={20} />, title: 'PostGIS Routing', desc: 'Storm GeoJSON polygons intersected with district boundaries. Triggers CAP alerts for vulnerable populations instantly.' },
                { num: '05', icon: <Activity size={20} />, title: 'Live Dashboard', desc: 'Alerts and forecast frames streamed via Kafka → WebSocket to Deck.gl map layer with 300ms opacity transitions.' },
              ].map((s, i) => (
                <FadeUp key={s.num} delay={i * 0.1}>
                  <div className="glass-panel p-5 rounded-2xl border border-white/8 relative group hover:border-white/15 transition-colors">
                    <div className="absolute -top-3 left-4 text-[10px] font-black text-slate-600 font-mono">{s.num}</div>
                    <div className="w-10 h-10 rounded-lg bg-brand-800 border border-white/8 flex items-center justify-center text-accent-blue mb-4 group-hover:text-white group-hover:bg-accent-blue/20 transition-all">
                      {s.icon}
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 mb-2">{s.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          TECH STACK
      ================================================================ */}
      <section id="technology" className="py-28 px-6 border-t border-white/5 bg-brand-900/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <FadeUp className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-100 mb-3">Technology Stack</h2>
            <p className="text-slate-400">Open-source, cloud-native, production-ready.</p>
          </FadeUp>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Next.js 16', 'Deck.gl 9', 'MapLibre GL', 'Framer Motion',
              'FastAPI', 'Celery + Kafka', 'PostGIS', 'PySTEPS',
              'ConvLSTM', 'WRF-ARW', 'wradlib', 'INSAT-3DR', 'IMD DWR',
              'CAP v1.2', 'Kubernetes', 'Docker',
            ].map(tag => (
              <FadeUp key={tag}>
                <span className="px-4 py-2 rounded-lg bg-brand-800 border border-white/8 text-sm font-medium text-slate-300 hover:text-white hover:border-white/20 transition-colors cursor-default">
                  {tag}
                </span>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA
      ================================================================ */}
      <section className="py-28 px-6 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-blue/8 blur-[80px] rounded-full" />
        </div>
        <FadeUp className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-6">Ready to see the storm before it arrives?</h2>
          <p className="text-lg text-slate-400 mb-10">Open the live dashboard to explore the interactive 4D forecast map.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-accent-blue text-white text-lg font-bold hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] group"
          >
            <Map size={22} />
            Launch Nowcast Dashboard
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeUp>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}
      <footer className="py-8 border-t border-white/5 text-center text-sm text-slate-600 bg-brand-900">
        <p>© 2026 VayuRaksha — Ministry of Earth Sciences (MoES) Initiative · Smart India Hackathon 2024</p>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard Mockup — premium floating radar terminal
// ---------------------------------------------------------------------------
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Outer ambient glow */}
      <div className="absolute -inset-6 bg-accent-blue/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -inset-3 bg-purple-600/8 blur-2xl rounded-3xl pointer-events-none" />

      {/* Gradient border ring */}
      <div className="absolute -inset-[2px] rounded-[20px] pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.6) 0%, rgba(99,102,241,0.3) 40%, rgba(168,85,247,0.5) 100%)' }}
      />

    <div className="relative w-full aspect-[1.15] rounded-2xl bg-[#080d1a] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.25)]">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Radar rings */}
      {/* Scan-line overlay */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)' }}
      />
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center px-3 gap-2 border-b border-white/5 z-20">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500/70" />
          <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <span className="w-2 h-2 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[9px] text-slate-500 font-mono ml-2 tracking-widest uppercase">VayuRaksha · Radar Terminal</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
      </div>

      <svg className="absolute inset-0 w-full h-full mt-8" viewBox="0 0 400 270" preserveAspectRatio="xMidYMid meet">
        {/* Concentric radar range rings */}
        <circle cx="200" cy="135" r="110" fill="none" stroke="rgba(59,130,246,0.10)" strokeWidth="1" strokeDasharray="3 6" />
        <circle cx="200" cy="135" r="80"  fill="none" stroke="rgba(59,130,246,0.12)" strokeWidth="1" />
        <circle cx="200" cy="135" r="50"  fill="none" stroke="rgba(59,130,246,0.09)" strokeWidth="1" />
        <circle cx="200" cy="135" r="20"  fill="none" stroke="rgba(59,130,246,0.07)" strokeWidth="1" />
        {/* Cross-hairs */}
        <line x1="200" y1="25" x2="200" y2="245" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        <line x1="90"  y1="135" x2="310" y2="135" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5" />
        {/* Radar sweep line */}
        <line x1="200" y1="135" x2="200" y2="25" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5"
          style={{ transformOrigin: '200px 135px', animation: 'radar-sweep 4s linear infinite' }} />
        {/* Sweep gradient fill (pie slice) */}
        <path d="M200,135 L200,25 A110,110 0 0,1 310,135 Z" fill="rgba(59,130,246,0.04)"
          style={{ transformOrigin: '200px 135px', animation: 'radar-sweep 4s linear infinite' }} />
        {/* Storm cells */}
        <ellipse cx="230" cy="115" rx="36" ry="30" fill="rgba(239,68,68,0.40)" />
        <ellipse cx="230" cy="115" rx="20" ry="16" fill="rgba(239,68,68,0.60)" />
        <ellipse cx="233" cy="112" rx="8"  ry="6"  fill="rgba(168,85,247,0.75)" />
        <ellipse cx="185" cy="155" rx="22" ry="17" fill="rgba(245,158,11,0.38)" />
        {/* Lightning dots */}
        {[[245,100],[252,109],[238,106],[260,114],[225,97]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="rgba(253,224,71,1)" />
        ))}
        {/* Motion vector arrow */}
        <line x1="230" y1="115" x2="266" y2="83" stroke="rgba(99,179,237,0.7)" strokeWidth="1.5" strokeDasharray="5 3" />
        <polygon points="266,83 259,89 261,82" fill="rgba(99,179,237,0.9)" />
      </svg>

      {/* Floating HUD elements */}
      <div className="absolute top-10 left-3 glass-panel rounded-xl p-3 border border-white/10 text-xs w-36">
        <div className="text-[9px] text-accent-blue uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
          AI Insight
        </div>
        <div className="text-slate-200 font-medium leading-snug">Cloudburst imminent · 85%</div>
      </div>

      <div className="absolute top-10 right-3 text-right">
        <div className="text-[9px] text-slate-500 uppercase tracking-widest">Threat Level</div>
        <div className="text-sm font-black" style={{color:'#f87171',textShadow:'0 0 12px rgba(248,113,113,0.7)'}}>EXTREME</div>
      </div>

      {/* Bottom scrubber mockup */}
      <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-xl p-3 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] text-slate-400 font-bold">FORECAST HORIZON</span>
          <span className="text-accent-blue font-bold text-xs">+2hr · WRF Blend</span>
        </div>
        <div className="h-1.5 bg-brand-800 rounded-full overflow-hidden">
          <div className="h-full w-2/5 bg-gradient-to-r from-accent-teal via-accent-blue to-accent-indigo rounded-full" />
        </div>
      </div>

      {/* dBZ label */}
      <div className="absolute" style={{ top: '42%', left: '57%', transform: 'translate(-50%,-50%)' }}>
        <span className="text-[10px] font-black text-white font-mono bg-black/60 border border-white/10 px-2 py-0.5 rounded-md backdrop-blur">59 dBZ</span>
      </div>

      {/* Coordinates HUD — bottom left */}
      <div className="absolute bottom-16 left-3 font-mono text-[8px] text-slate-600">
        30.31°N &nbsp;78.03°E
      </div>
    </div>
    </div>
  );
}
