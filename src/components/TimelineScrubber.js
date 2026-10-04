"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Brain, CloudLightning } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const TIME_STEPS = [
  { label: 'Now',    model: 'obs',     mins: 0   },
  { label: '+15m',   model: 'convlstm', mins: 15  },
  { label: '+30m',   model: 'convlstm', mins: 30  },
  { label: '+45m',   model: 'convlstm', mins: 45  },
  { label: '+1hr',   model: 'convlstm', mins: 60  },
  { label: '+1.5hr', model: 'blend',    mins: 90  },
  { label: '+2hr',   model: 'blend',    mins: 120 },
  { label: '+3hr',   model: 'wrf',      mins: 180 },
  { label: '+4hr',   model: 'wrf',      mins: 240 },
  { label: '+5hr',   model: 'wrf',      mins: 300 },
  { label: '+6hr',   model: 'wrf',      mins: 360 },
];

const MODEL_META = {
  obs:      { label: 'Live Observation',           color: '#14b8a6', icon: CloudLightning },
  convlstm: { label: 'ConvLSTM Radar Extrapolation', color: '#3b82f6', icon: Brain },
  blend:    { label: 'AI-NWP Blended Transition',  color: '#6366f1', icon: Brain },
  wrf:      { label: 'WRF High-Resolution Model',  color: '#8b5cf6', icon: Brain },
};

export default function TimelineScrubber({ currentIndex, onChange }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const step = TIME_STEPS[currentIndex];
  const meta = MODEL_META[step.model];
  const ModelIcon = meta.icon;

  const handlePlay = useCallback(() => setIsPlaying(p => !p), []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    onChange(0);
  }, [onChange]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onChange((prev) => {
        if (prev >= TIME_STEPS.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, onChange]);

  const progressPct = (currentIndex / (TIME_STEPS.length - 1)) * 100;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[78%] max-w-5xl pointer-events-auto z-20"
    >
      <div className="glass-panel-deep rounded-2xl border border-white/8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Model indicator bar at top */}
        <motion.div
          key={step.model}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-0.5 w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }}
        />

        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="w-8 h-8 rounded-lg bg-brand-800 hover:bg-brand-700 border border-white/8 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all"
                title="Reset"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={handlePlay}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                  boxShadow: `0 0 20px ${meta.color}55`,
                }}
              >
                {isPlaying
                  ? <Pause size={18} className="fill-white" />
                  : <Play size={18} className="fill-white ml-0.5" />
                }
              </button>

              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-100 leading-tight">Forecast Horizon</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={step.model}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="text-[10px] font-medium leading-tight flex items-center gap-1"
                    style={{ color: meta.color }}
                  >
                    <ModelIcon size={10} />
                    {meta.label}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Current time display */}
            <div className="text-right">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="text-3xl font-extrabold tracking-tight block"
                  style={{ color: meta.color }}
                >
                  {step.label}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Forecast ETA</span>
            </div>
          </div>

          {/* Progress track */}
          <div className="relative h-10 flex items-center">
            {/* Background track */}
            <div className="absolute left-0 right-0 h-1.5 bg-brand-800/80 rounded-full border border-black/30" />

            {/* Model zone coloring */}
            {/* ConvLSTM zone: steps 1-4 */}
            <div className="absolute h-1.5 rounded-full opacity-20"
              style={{ left: `${(1/10)*100}%`, width: `${(3/10)*100}%`, background: '#3b82f6' }} />
            {/* Blend zone: 5-6 */}
            <div className="absolute h-1.5 rounded-full opacity-20"
              style={{ left: `${(5/10)*100}%`, width: `${(1/10)*100}%`, background: '#6366f1' }} />
            {/* WRF zone: 7-10 */}
            <div className="absolute h-1.5 rounded-full opacity-20"
              style={{ left: `${(7/10)*100}%`, width: `${(3/10)*100}%`, background: '#8b5cf6' }} />

            {/* Active fill */}
            <motion.div
              className="absolute h-1.5 rounded-full shadow-md"
              style={{
                background: `linear-gradient(90deg, #14b8a6, #3b82f6, #6366f1, #8b5cf6)`,
                boxShadow: `0 0 8px ${meta.color}80`,
              }}
              animate={{ width: `${progressPct}%` }}
              transition={{ ease: 'easeInOut', duration: 0.3 }}
            />

            {/* Step nodes */}
            <div className="relative w-full flex justify-between z-10">
              {TIME_STEPS.map((s, idx) => {
                const isActive = idx === currentIndex;
                const isPast = idx < currentIndex;
                const nodeMeta = MODEL_META[s.model];

                return (
                  <button
                    key={s.label}
                    onClick={() => { onChange(idx); setIsPlaying(false); }}
                    className="group relative flex flex-col items-center focus:outline-none"
                  >
                    {/* Node circle */}
                    <div
                      className={`relative w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? 'scale-150 border-white shadow-lg'
                          : isPast
                          ? 'scale-110 border-transparent'
                          : 'bg-brand-700 border-brand-600 group-hover:border-slate-400 group-hover:scale-125'
                      }`}
                      style={
                        isActive
                          ? { background: nodeMeta.color, boxShadow: `0 0 12px ${nodeMeta.color}` }
                          : isPast
                          ? { background: nodeMeta.color, opacity: 0.7 }
                          : {}
                      }
                    >
                      {/* Ping ring on active */}
                      {isActive && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping opacity-60"
                          style={{ background: nodeMeta.color }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`absolute top-5 text-[9px] font-bold transition-all whitespace-nowrap ${
                        isActive ? 'text-slate-100 scale-110' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model zone legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
            {Object.entries(MODEL_META).map(([key, m]) => (
              <div key={key} className="flex items-center gap-1.5 text-[9px] text-slate-500 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                {m.label.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
