import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Users, Briefcase, Shield, Mail } from 'lucide-react';

export const ActorNode = memo(({ data, selected }: NodeProps<any>) => {
  const actor = data?.actor || data?.label || 'Stakeholder';
  const role = data?.department || data?.role || 'Process Participant';
  const isSyncPulsing = data?.isSyncPulsing;
  const responsibilities = data?.responsibilities || ['Executes assigned workflow operations'];
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative group rounded-2xl p-4 min-w-[240px] max-w-[280px] transition-all duration-300 backdrop-blur-[20px] border border-[#3b82f6]/40 bg-[#3b82f6]/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:border-[#3b82f6] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] animate-node-drop ${
        selected ? 'ring-2 ring-[#3b82f6] shadow-[0_0_35px_rgba(59,130,246,0.6)]' : ''
      } ${isSyncPulsing ? 'connected-node-pulse ring-2 ring-[#00d4ff]' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#3b82f6] border-2 border-[#0a0e1a] rounded-full hover:scale-125 transition-transform"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#e8edf5] font-display group-hover:text-[#3b82f6] transition-colors">{actor}</h4>
            <span className="text-[10px] text-[#3b82f6] font-mono font-medium">{role}</span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-[#3b82f6] bg-[#3b82f6]/15 px-2 py-0.5 rounded-2xl border border-[#3b82f6]/30">
          ACTOR
        </span>
      </div>

      <div className="mt-2 space-y-1 pt-1.5 border-t border-white/[0.06]">
        {responsibilities.slice(0, 2).map((resp: string, i: number) => (
          <div key={i} className="text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] shrink-0" />
            <span className="truncate">{resp}</span>
          </div>
        ))}
      </div>

      {/* Detailed Hover Tooltip */}
      {showTooltip && (
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-50 w-60 p-3 rounded-2xl bg-[#0a0e1a]/95 border border-[#3b82f6]/50 shadow-[0_0_30px_rgba(59,130,246,0.35)] backdrop-blur-[20px] text-xs font-mono space-y-1.5 pointer-events-none animate-node-pop">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
            <span className="text-[#3b82f6] font-bold">ACTOR DETAILS</span>
            <span className="text-slate-400">Stakeholder</span>
          </div>
          <div className="text-[#e8edf5] font-sans font-bold">{actor}</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400">Department: </span>
            <span className="text-[#3b82f6]">{role}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/[0.06]">
            Drag node to re-align department flow
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-[#3b82f6] border-2 border-[#0a0e1a] rounded-full hover:scale-125 transition-transform"
      />
    </div>
  );
});

ActorNode.displayName = 'ActorNode';
