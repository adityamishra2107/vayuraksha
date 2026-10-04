"use client";

import { motion } from 'framer-motion';
import { Layers, Map, Eye, EyeOff } from 'lucide-react';

export default function RightPanel({ viewMode, setViewMode, activeLayers, toggleLayer }) {
  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full glass-panel rounded-l-3xl flex flex-col border-r-0 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] border-t border-b border-l border-white/10"
    >
      <div className="p-5 border-b border-white/10 bg-brand-900/90 backdrop-blur z-20">
        <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          <Layers size={16} className="text-accent-indigo" />
          Map Controls
        </h2>
      </div>

      <div className="p-5 flex flex-col gap-6 flex-1 overflow-y-auto">
        {/* View Mode */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dimension</span>
          <div className="flex bg-brand-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setViewMode('2d')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${viewMode === '2d' ? 'bg-accent-blue text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Map size={16} />
              2D Radar
            </button>
            <button 
              onClick={() => setViewMode('3d')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${viewMode === '3d' ? 'bg-accent-indigo text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Layers size={16} />
              3D Topo
            </button>
          </div>
        </div>

        {/* Data Layers */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data Layers</span>
          
          <LayerToggle 
            label="Radar Reflectivity" 
            active={activeLayers.radar} 
            onChange={() => toggleLayer('radar')} 
            color="bg-accent-blue"
          />
          <LayerToggle 
            label="Satellite IR (Cloud Top)" 
            active={activeLayers.satellite} 
            onChange={() => toggleLayer('satellite')} 
            color="bg-purple-500"
          />
          <LayerToggle 
            label="Lightning Strikes" 
            active={activeLayers.lightning} 
            onChange={() => toggleLayer('lightning')} 
            color="bg-warning"
          />
          <LayerToggle 
            label="3D Terrain Extrusion" 
            active={activeLayers.terrain} 
            onChange={() => toggleLayer('terrain')} 
            color="bg-slate-400"
          />
        </div>

        {/* Legend */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Reflectivity (dBZ) Legend</span>
          <div className="h-4 w-full rounded-full bg-gradient-to-r from-accent-teal via-yellow-400 to-danger shadow-inner mb-2" />
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>20 (Light)</span>
            <span>40 (Mod)</span>
            <span className="text-danger">55+ (Severe)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function LayerToggle({ label, active, onChange, color }) {
  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${active ? 'bg-white/5 border-white/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}
      onClick={onChange}
    >
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${active ? color : 'bg-slate-600'}`} />
        <span className={`text-sm font-medium ${active ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
      </div>
      {active ? <Eye size={16} className="text-slate-300" /> : <EyeOff size={16} className="text-slate-600" />}
    </div>
  );
}
