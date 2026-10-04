"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/**
 * HazardCard — animated glassmorphic metric card.
 * Uses Framer Motion spring physics for number animation.
 * Applies dynamic glow CSS class based on severity.
 */
export default function HazardCard({ title, value, unit = "%", icon, severity = "low", description }) {
  const springValue = useSpring(0, { stiffness: 80, damping: 18 });
  const displayValue = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  const getGlowClass = () => {
    if (severity === "extreme") return "threat-card-extreme bg-danger/10";
    if (severity === "severe") return "threat-card-severe bg-danger/7";
    if (severity === "high") return "threat-card-high bg-warning/7";
    if (severity === "hail") return "threat-card-hail bg-purple-500/10";
    return ""; // low — no glow
  };

  const getAccentColor = () => {
    if (severity === "extreme" || severity === "severe") return "text-danger";
    if (severity === "high") return "text-warning";
    if (severity === "hail") return "text-purple-400";
    return "text-accent-teal";
  };

  const getBgDot = () => {
    if (severity === "extreme" || severity === "severe") return "bg-danger/20";
    if (severity === "high") return "bg-warning/15";
    if (severity === "hail") return "bg-purple-500/15";
    return "bg-accent-blue/10";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      className={`relative overflow-hidden rounded-xl p-4 border border-white/10 backdrop-blur-xl transition-all duration-500 cursor-default ${getGlowClass()}`}
      style={{ background: "rgba(15, 23, 42, 0.6)" }}
    >
      {/* Background radial flair */}
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl pointer-events-none ${getBgDot()}`} />

      {/* Severity left bar */}
      {(severity === "extreme" || severity === "severe") && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-danger via-danger/50 to-transparent rounded-l-xl" />
      )}
      {severity === "high" && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-warning via-warning/40 to-transparent rounded-l-xl" />
      )}
      {severity === "hail" && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-purple-500/40 to-transparent rounded-l-xl" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase mb-3">
        <span className="text-slate-400 flex items-center gap-1.5">
          {title}
        </span>
        <span className={getAccentColor()}>{icon}</span>
      </div>

      {/* Animated Value */}
      <div className="flex items-baseline gap-1.5">
        <motion.span className={`text-3xl font-extrabold tracking-tight metric-value ${getAccentColor()}`}>
          {displayValue}
        </motion.span>
        <span className="text-sm font-semibold text-slate-400">{unit}</span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-[11px] text-slate-500 mt-2 leading-snug">{description}</p>
      )}
    </motion.div>
  );
}
