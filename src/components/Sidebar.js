"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Search, MapPin, CloudRain, Wind, Zap, AlertTriangle, ChevronRight } from 'lucide-react';
import HazardCard from './HazardCard';

// Spatio-temporal mock data. Each index maps to a 30-min forecast step.
const HAZARD_DATA = [
  { time: 0,  cloudburst: 10, hail: 5,  lightning: 40,  threatLevel: 'Moderate', radarEcho: 28, echoTop: 7,  msg: 'Convective initiation detected via INSAT-3DR 10.8μm cooling rates.', mesh: 0 },
  { time: 1,  cloudburst: 20, hail: 10, lightning: 60,  threatLevel: 'Elevated', radarEcho: 38, echoTop: 9,  msg: 'Rapid updraft growth. Lightning jump rate +50/min.', mesh: 12 },
  { time: 2,  cloudburst: 45, hail: 25, lightning: 80,  threatLevel: 'High',     radarEcho: 46, echoTop: 11, msg: 'Echo tops exceeding 11km. Heavy rainfall commencing.', mesh: 22 },
  { time: 3,  cloudburst: 75, hail: 50, lightning: 95,  threatLevel: 'Severe',   radarEcho: 54, echoTop: 13, msg: 'Peak storm intensity. Cloudburst risk imminent — rain rate >100mm/hr.', mesh: 40 },
  { time: 4,  cloudburst: 85, hail: 70, lightning: 100, threatLevel: 'Extreme',  radarEcho: 59, echoTop: 15, msg: 'MESH: 70mm. Large hail likely. Vertically integrated liquid >65 kg/m².', mesh: 70 },
  { time: 5,  cloudburst: 60, hail: 40, lightning: 70,  threatLevel: 'Severe',   radarEcho: 51, echoTop: 13, msg: 'Storm cell moving NE at 32 km/h. Ongoing intense precipitation.', mesh: 45 },
  { time: 6,  cloudburst: 40, hail: 20, lightning: 50,  threatLevel: 'High',     radarEcho: 44, echoTop: 11, msg: 'WRF model: secondary cell initiation along outflow boundary.', mesh: 20 },
  { time: 7,  cloudburst: 25, hail: 10, lightning: 30,  threatLevel: 'Moderate', radarEcho: 36, echoTop: 9,  msg: 'NWP blending active. Storm weakening forecast confirmed.', mesh: 10 },
  { time: 8,  cloudburst: 15, hail: 5,  lightning: 20,  threatLevel: 'Low',      radarEcho: 26, echoTop: 7,  msg: 'Dissipation phase. Stratiform light rain remains.', mesh: 0 },
  { time: 9,  cloudburst: 5,  hail: 0,  lightning: 10,  threatLevel: 'Minimal',  radarEcho: 18, echoTop: 5,  msg: 'Clearance expected within 45 minutes.', mesh: 0 },
  { time: 10, cloudburst: 0,  hail: 0,  lightning: 5,   threatLevel: 'Minimal',  radarEcho: 12, echoTop: 3,  msg: 'All clear. Residual moisture only.', mesh: 0 },
];

function getThreatBadgeStyle(level) {
  switch (level) {
    case 'Extreme': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    case 'Severe':  return 'bg-danger/20 text-danger border-danger/40';
    case 'High':    return 'bg-warning/20 text-warning border-warning/40';
    case 'Elevated':return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40';
    default:        return 'bg-accent-teal/20 text-accent-teal border-accent-teal/40';
  }
}

function getCloudburstSeverity(v) {
  if (v >= 80) return 'extreme';
  if (v >= 60) return 'severe';
  if (v >= 40) return 'high';
  return 'low';
}

function getHailSeverity(v) {
  if (v >= 60) return 'hail';
  if (v >= 30) return 'high';
  return 'low';
}

function getLightningSeverity(v) {
  if (v >= 90) return 'extreme';
  if (v >= 70) return 'severe';
  if (v >= 50) return 'high';
  return 'low';
}

export default function Sidebar({ timeIndex }) {
  const data = HAZARD_DATA[Math.min(timeIndex, HAZARD_DATA.length - 1)];
  const isNWP = timeIndex > 4; // Beyond +2hr we're in NWP territory

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full h-full glass-panel-deep rounded-2xl flex flex-col overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.6)] border border-white/8"
    >
      {/* Header — Location & Search */}
      <div className="p-4 border-b border-white/8 bg-brand-900/70 backdrop-blur sticky top-0 z-20 flex-shrink-0">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search district or geohash..."
            className="w-full bg-brand-800/60 border border-white/8 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50 transition-all"
          />
        </div>

        {/* Location + Threat Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MapPin size={14} className="text-accent-blue" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-teal" />
            </div>
            <span className="text-sm font-semibold text-slate-200">Dehradun, UK</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getThreatBadgeStyle(data.threatLevel)}`}>
            {data.threatLevel}
          </span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
        {/* AI Insight Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={timeIndex}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl p-3 border border-accent-blue/25 bg-accent-blue/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-blue/10 rounded-full blur-2xl pointer-events-none" />
            <div className="text-[10px] text-accent-blue uppercase tracking-widest mb-1.5 flex items-center gap-1.5 font-bold">
              <Activity size={11} className="animate-pulse" />
              AI Insight · {isNWP ? 'WRF-Blended' : 'ConvLSTM'}
            </div>
            <p className="text-xs font-medium text-slate-300 leading-relaxed">{data.msg}</p>
          </motion.div>
        </AnimatePresence>

        {/* Radar State Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Max dBZ" value={data.radarEcho} unit="dBZ" warn={data.radarEcho > 50} />
          <MiniStat label="Echo Top" value={data.echoTop} unit=" km" warn={data.echoTop > 12} />
        </div>

        {/* Section: Hazard Metrics */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 flex items-center gap-2">
            Hazard Risk Matrix
            <span className="h-px flex-1 bg-white/5" />
          </h3>
          <div className="flex flex-col gap-2.5">
            <HazardCard
              title="Cloudburst Risk"
              value={data.cloudburst}
              unit="%"
              severity={getCloudburstSeverity(data.cloudburst)}
              icon={<CloudRain size={16} />}
              description={data.cloudburst > 60 ? "Rain rate >100 mm/hr over focused area" : "Monitoring echo-top growth"}
            />
            <HazardCard
              title="Hail (MESH)"
              value={data.mesh}
              unit="mm"
              severity={getHailSeverity(data.hail)}
              icon={<Wind size={16} />}
              description={data.hail > 50 ? `VIL: ${data.radarEcho - 10}+ kg/m² — large hail likely` : "Below MESH threshold"}
            />
            <HazardCard
              title="Lightning Density"
              value={data.lightning}
              unit="/min"
              severity={getLightningSeverity(data.lightning)}
              icon={<Zap size={16} />}
              description={data.lightning > 80 ? "Lightning jump rate critical" : "Monitoring flash rate trend"}
            />
          </div>
        </div>

        {/* CAP Alert Trigger Preview */}
        {data.threatLevel === 'Extreme' || data.threatLevel === 'Severe' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-3 border border-danger/30 bg-danger/8 flex items-start gap-2.5"
          >
            <AlertTriangle size={16} className="text-danger mt-0.5 flex-shrink-0 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-danger mb-1">CAP Alert Triggered</div>
              <p className="text-[11px] text-slate-400 leading-snug">PostGIS intersection detected — Dehradun valley geofence active. NDMA CAP payload dispatched.</p>
            </div>
          </motion.div>
        ) : null}

        {/* Storm Trajectory */}
        {timeIndex > 0 && (
          <div className="rounded-xl p-3 border border-white/5 bg-brand-900/40">
            <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-2 font-bold">Storm Motion Vector</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 text-xs">Direction</span>
              <span className="font-bold text-slate-200">NNE 32 km/h</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1.5">
              <span className="text-slate-400 text-xs">Affected Area ETA</span>
              <span className="font-bold text-accent-teal text-xs">~{45 - timeIndex * 4} mins</span>
            </div>
            {/* Mini motion vector bar */}
            <div className="mt-3 h-1.5 bg-brand-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-teal to-accent-blue rounded-full"
                animate={{ width: `${(timeIndex / 10) * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-600 mt-1">
              <span>Initiation</span><span>Landfall</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 bg-brand-900/60 flex-shrink-0">
        <button className="w-full flex items-center justify-between text-xs text-accent-blue hover:text-blue-300 transition-colors font-medium">
          <span>View Full Threat Report</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function MiniStat({ label, value, unit, warn }) {
  return (
    <div className={`rounded-lg p-2.5 border text-center ${warn ? 'border-warning/30 bg-warning/5' : 'border-white/5 bg-brand-900/40'}`}>
      <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-extrabold metric-value ${warn ? 'text-warning' : 'text-slate-200'}`}>
        {value}<span className="text-xs font-normal text-slate-500 ml-0.5">{unit}</span>
      </div>
    </div>
  );
}
