import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Zap, Database } from 'lucide-react';

export const TriggerNode = memo(({ data, selected }: NodeProps<any>) => {
  const label = data?.label || data?.title || 'Order Placed';
  const subtext = data?.subtext || data?.description || 'formCreate (orders)';
  const schema = data?.schema || 'orders';
  const isSyncPulsing = data?.isSyncPulsing;
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`trigger-node relative group rounded-2xl p-4 min-w-[240px] max-w-[280px] transition-all duration-300 backdrop-blur-[20px] border-2 border-white/50 bg-[#10b981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.5)] animate-node-drop ${
        selected ? 'ring-4 ring-white/60 shadow-[0_0_30px_rgba(16,185,129,0.7)]' : ''
      } ${isSyncPulsing ? 'connected-node-pulse ring-2 ring-[#00d4ff]' : ''}`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-mono font-bold text-white">
          <Zap className="w-3 h-3 text-white fill-current animate-pulse" />
          <span>TRIGGER NODE</span>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-white/15 px-2 py-0.5 rounded-full border border-white/30">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          ACTIVE
        </span>
      </div>

      {/* Main Title */}
      <h4 className="text-sm font-bold text-white transition-colors leading-snug mb-1 font-display">
        {label}
      </h4>

      {/* Small Subtext */}
      <div className="text-[11px] font-mono text-emerald-100 bg-black/20 px-2.5 py-1 rounded-xl border border-white/20 truncate mb-2">
        <span>{subtext}</span>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-100 pt-1 border-t border-white/20">
        <span className="flex items-center gap-1 text-white font-medium">
          <Database className="w-3 h-3 text-white" />
          <span>Schema: {schema}</span>
        </span>
        <span className="text-emerald-100">Initiator</span>
      </div>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-50 w-60 p-3 rounded-2xl bg-[#0a0e1a]/95 border border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.35)] backdrop-blur-[20px] text-xs font-mono space-y-1.5 pointer-events-none animate-node-pop text-left">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
            <span className="text-[#10b981] font-bold">TRIGGER EVENT</span>
            <span className="text-slate-400">Level 1</span>
          </div>
          <div className="text-[#e8edf5] font-sans font-bold">{label}</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400">Event Signature: </span>
            <span className="text-[#10b981] font-bold">{subtext}</span>
          </div>
        </div>
      )}

      {/* Output Port */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 !bg-white !border-2 !border-[#10b981] !rounded-full hover:!scale-125 !transition-transform !shadow-md"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
