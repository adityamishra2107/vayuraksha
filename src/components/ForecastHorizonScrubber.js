"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

const STEPS = [
  { label: "Now",    model: "Live",     color: "#22d3ee" },
  { label: "+15m",   model: "Live",     color: "#22d3ee" },
  { label: "+30m",   model: "Live",     color: "#22d3ee" },
  { label: "+45m",   model: "ConvLSTM", color: "#818cf8" },
  { label: "+1hr",   model: "ConvLSTM", color: "#818cf8" },
  { label: "+1.5hr", model: "Blend",    color: "#a78bfa" },
  { label: "+2hr",   model: "Blend",    color: "#a78bfa" },
  { label: "+3hr",   model: "WRF",      color: "#f472b6" },
  { label: "+4hr",   model: "WRF",      color: "#f472b6" },
  { label: "+5hr",   model: "WRF",      color: "#f472b6" },
  { label: "+6hr",   model: "WRF",      color: "#f472b6" },
];

export default function ForecastHorizonScrubber({ activeIndex = 0, onChange }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [baseTime, setBaseTime] = useState(() => new Date());
  const intervalRef = useRef(null);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        onChange((prev) => {
          if (prev >= STEPS.length - 1) { setIsPlaying(false); return prev; }
          return prev + 1;
        });
      }, 900);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, onChange]);

  const activeStep = STEPS[activeIndex] || STEPS[0];
  const progressPct = (activeIndex / (STEPS.length - 1)) * 100;
  const getOffsetMinutes = (label) => {
    if (label === "Now") return 0;
    const value = Number.parseFloat(label.slice(1));
    return label.endsWith("hr") ? value * 60 : value;
  };
  const formatTime = (offsetMinutes) => {
    const time = new Date(baseTime.getTime() + offsetMinutes * 60 * 1000);
    return `${time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })} IST`;
  };
  const activeTime = formatTime(getOffsetMinutes(activeStep.label));
  const threatLabel = activeIndex >= 5 ? "Threat Extreme" : activeIndex >= 3 ? "Threat Severe" : "Threat Developing";

  useEffect(() => {
    const clock = setInterval(() => setBaseTime(new Date()), 60000);
    return () => clearInterval(clock);
  }, []);

  return (
    <div className="w-full px-4 pb-4">
      <div className="max-w-5xl mx-auto bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        
        {/* Top row — model label + time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Forecast Horizon</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.model}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                style={{ color: activeStep.color, borderColor: activeStep.color + "55", background: activeStep.color + "18" }}
              >
                {activeStep.model}
              </span>
              <div className="text-right">
                <span className="block text-white font-bold text-sm font-mono">{activeTime}</span>
                <span className="block text-[9px] font-medium uppercase tracking-wider text-slate-500">{threatLabel} · {activeStep.label}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="relative h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: `linear-gradient(90deg, #22d3ee, ${activeStep.color})` }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Step nodes */}
        <div className="flex items-center gap-1">
          {/* Controls */}
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0 mr-2"
          >
            {isPlaying
              ? <Pause size={13} className="text-white" />
              : <Play size={13} className="text-white ml-0.5" />
            }
          </button>
          <button
            onClick={() => { onChange(0); setIsPlaying(false); }}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0 mr-3"
          >
            <RotateCcw size={12} className="text-slate-400" />
          </button>

          {/* Node row */}
          <div className="flex items-center gap-1 flex-1 justify-between">
            {STEPS.map((step, i) => {
              const isActive  = i === activeIndex;
              const isPast    = i < activeIndex;
              return (
                <button
                  key={i}
                  onClick={() => { onChange(i); setIsPlaying(false); }}
                  className="flex flex-col items-center gap-1 group flex-1"
                >
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full border transition-all duration-200"
                    style={{
                      background: isActive ? step.color : isPast ? step.color + "99" : "transparent",
                      borderColor: isActive ? step.color : isPast ? step.color + "66" : "rgba(255,255,255,0.12)",
                      boxShadow: isActive ? `0 0 10px ${step.color}88` : "none",
                    }}
                    animate={isActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <span
                    className="text-[8px] font-medium hidden sm:block whitespace-nowrap transition-colors duration-200"
                    style={{ color: isActive ? step.color : isPast ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)" }}
                  >
                    <span className="block">{formatTime(getOffsetMinutes(step.label))}</span>
                    <span className="block opacity-70">{step.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model zone legend */}
        <div className="flex gap-4 mt-3 pt-2.5 border-t border-white/5 justify-center">
          {[["Live Obs", "#22d3ee"], ["ConvLSTM", "#818cf8"], ["AI Blend", "#a78bfa"], ["WRF Physics", "#f472b6"]].map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[9px] text-slate-500 font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
