import React from 'react';
import { ProjectContext } from '../../types/workflow';
import { Database, Zap, Layers, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProjectContextPanelProps {
  context: ProjectContext;
}

export const ProjectContextPanel: React.FC<ProjectContextPanelProps> = ({ context }) => {
  if (!context) return null;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#00d4ff]" />
          <h3 className="text-xs font-mono font-bold text-[#e8edf5] uppercase tracking-wider font-display">
            MONGODB PROJECT CONTEXT: <span className="text-[#00d4ff]">{context.projectName}</span>
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/15 px-2.5 py-0.5 rounded-2xl border border-[#10b981]/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          CONNECTED TO DB
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        {/* Schemas */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold text-[#e8edf5]">Form Schemas</span>
            <span className="text-[#00d4ff] font-bold">{context.schemas?.length || 0}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {context.schemas?.map((s) => (
              <span key={s.name} className="px-2 py-0.5 rounded-2xl bg-[#0a0e1a]/80 text-[10px] text-[#00d4ff] border border-white/[0.08] truncate max-w-[100px]">
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Custom Functions */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold text-[#e8edf5]">Custom Functions</span>
            <span className="text-[#7c3aed] font-bold">{context.functions?.length || 0}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {context.functions?.slice(0, 3).map((f) => (
              <span key={f.name} className="px-2 py-0.5 rounded-2xl bg-[#0a0e1a]/80 text-[10px] text-[#7c3aed] border border-white/[0.08] truncate max-w-[120px]">
                {f.name}
              </span>
            ))}
          </div>
        </div>

        {/* Buttons / Operations */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold text-[#e8edf5]">Buttons & Operations</span>
            <span className="text-purple-400 font-bold">{context.buttons?.length || 0}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {context.buttons?.map((b) => (
              <span key={b.id} className="px-2 py-0.5 rounded-2xl bg-[#0a0e1a]/80 text-[10px] text-purple-300 border border-white/[0.08] truncate max-w-[120px]">
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
