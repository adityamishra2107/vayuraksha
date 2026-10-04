"use client";

import { motion } from 'framer-motion';
import { ShieldAlert, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TopNav() {
  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full px-6 py-4 flex justify-between items-center bg-gradient-to-b from-brand-900/90 to-transparent pointer-events-auto"
    >
      <div className="flex items-center gap-6">
        <Link 
          href="/"
          className="p-2 glass-panel hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
        <div className="flex items-center gap-3">
          <img src="/vayuraksha-logo.png" alt="VayuRaksha" className="h-14 w-44 object-contain object-center" />
          <p className="hidden lg:block text-xs text-brand-500 font-medium tracking-widest uppercase">
            Command Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/alerts" className="glass-panel px-4 py-2 rounded-lg text-slate-300 hover:text-danger hover:border-danger/30 transition-all flex items-center gap-2 text-sm font-bold">
          <ShieldAlert size={18} />
          Active CAP Alerts
        </Link>
        <Link href="/settings" aria-label="Open settings" className="glass-panel p-2.5 rounded-lg text-slate-300 hover:text-white transition-all">
          <Settings size={20} />
        </Link>
      </div>
    </motion.header>
  );
}
