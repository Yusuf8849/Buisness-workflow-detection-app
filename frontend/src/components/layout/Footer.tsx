import React from 'react';
import { Zap, Shield, Cpu, Database, Layout, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0a0e1a]/80 backdrop-blur-[20px] py-12 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center text-[#00d4ff]">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#e8edf5] font-display">
              FlowIntel<span className="text-[#00d4ff] font-mono">.AI</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Autonomous Business Process Intelligence & Diagram Generation
            </p>
          </div>
        </div>

        {/* Center: Tech Stack Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-300">
          <span className="px-3 py-1 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 backdrop-blur-[20px]">
            <Layout className="w-3 h-3 text-[#00d4ff]" /> React.js
          </span>
          <span className="px-3 py-1 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 backdrop-blur-[20px]">
            <Cpu className="w-3 h-3 text-[#10b981]" /> Node.js Express
          </span>
          <span className="px-3 py-1 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 backdrop-blur-[20px]">
            <Database className="w-3 h-3 text-[#10b981]" /> MongoDB
          </span>
          <span className="px-3 py-1 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 backdrop-blur-[20px]">
            <Sparkles className="w-3 h-3 text-[#7c3aed]" /> Three.js 3D
          </span>
          <span className="px-3 py-1 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5 backdrop-blur-[20px]">
            <Zap className="w-3 h-3 text-[#38bdf8]" /> React Flow
          </span>
        </div>

        {/* Right: Copyright */}
        <div className="text-xs text-slate-400 font-mono text-center md:text-right">
          Production AI Hackathon Suite • 100% DAG Verified
        </div>
      </div>
    </footer>
  );
};
