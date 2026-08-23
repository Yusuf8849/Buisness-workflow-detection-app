import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { GitFork, User, ShieldCheck } from 'lucide-react';

export const DecisionNode = memo(({ data, selected }: NodeProps<any>) => {
  const question = data?.conditionQuestion || data?.label || data?.title || 'Stock Type?';
  const actor = data?.actor || 'Automation Engine';
  const isSyncPulsing = data?.isSyncPulsing;
  const branches = data?.branches || [
    { label: 'Physical → Update Inv', targetId: '' },
    { label: 'Digital → Skip Bypass', targetId: '' }
  ];
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="decision-node relative group p-1 animate-node-drop"
    >
      {/* Main Node Card with Amber/Orange Gradient */}
      <div
        className={`relative w-[260px] rounded-2xl p-5 transition-all duration-300 backdrop-blur-[20px] border border-white/30 bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_8px_24px_rgba(245,158,11,0.5)] ${
          selected ? 'ring-4 ring-white/60 shadow-[0_0_30px_rgba(245,158,11,0.7)]' : ''
        } ${isSyncPulsing ? 'connected-node-pulse ring-2 ring-[#00d4ff]' : ''}`}
      >
        {/* Left Input Port */}
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3.5 !h-3.5 !bg-white !border-2 !border-[#f59e0b] !rounded-full hover:!scale-125 !transition-transform !shadow-md"
        />

        {/* Diamond Header Badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-mono font-bold text-white">
            <GitFork className="w-3.5 h-3.5 text-white" />
            <span>DECISION GATE</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-100 bg-black/20 px-2 py-0.5 rounded-full border border-white/20">
            <User className="w-3 h-3 text-white" />
            <span className="truncate max-w-[80px]">{actor}</span>
          </div>
        </div>

        {/* Decision Question */}
        <h4 className="text-sm font-bold text-white transition-colors leading-snug mb-3 font-display">
          {question}
        </h4>

        {/* Dual Branch Indicator Pills */}
        <div className="space-y-1.5 pt-2 border-t border-white/20 text-[10px] font-mono">
          <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-black/20 border border-white/20 text-white font-medium">
            <span className="font-bold">⚡ {branches[0]?.label || 'Physical → Update Inv'}</span>
            <span className="text-[9px] text-amber-100">Right Port →</span>
          </div>
          <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-black/20 border border-white/20 text-white font-medium">
            <span className="font-bold">⚡ {branches[1]?.label || 'Digital → Skip'}</span>
            <span className="text-[9px] text-amber-100">Bottom Port ↓</span>
          </div>
        </div>

        {/* Primary Output Handle (Right: Physical) */}
        <Handle
          type="source"
          position={Position.Right}
          id="physical"
          className="!w-3.5 !h-3.5 !bg-white !border-2 !border-[#10b981] !rounded-full hover:!scale-125 !transition-transform !shadow-md"
        />

        {/* Secondary Output Handle (Bottom: Digital) */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="digital"
          className="!w-3.5 !h-3.5 !bg-white !border-2 !border-[#d97706] !rounded-full hover:!scale-125 !transition-transform !shadow-md"
        />
      </div>

      {/* Detailed Hover Tooltip */}
      {showTooltip && (
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-50 w-64 p-3 rounded-2xl bg-[#0a0e1a]/95 border border-[#f59e0b]/50 shadow-[0_0_30px_rgba(245,158,11,0.35)] backdrop-blur-[20px] text-xs font-mono space-y-1.5 pointer-events-none animate-node-pop text-left">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
            <span className="text-amber-300 font-bold">DECISION GATE DETAILS</span>
            <span className="text-slate-400">Level 3</span>
          </div>
          <div className="text-[#e8edf5] font-sans font-bold">{question}</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400">Evaluates: </span>
            <span className="text-amber-300 font-bold">stock_type == "physical"</span>
          </div>
        </div>
      )}
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
