import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData, ActionType } from '../../../types/workflow';
import { Clock, User, CheckCircle2, XCircle, MinusCircle, Loader2, Zap, FileText, Database, GitBranch, Layers } from 'lucide-react';

export const ActionNode = memo(({ data, selected }: NodeProps<any>) => {
  const isBottleneck = data?.isBottleneck;
  const status = data?.status || 'idle';
  const isSyncPulsing = data?.isSyncPulsing;
  const actionType: ActionType = data?.actionType || 'function';
  const stepId = data?.stepId || data?.id || 'step-001';
  const condition = data?.condition;
  const targetCandidate = data?.functionName || data?.schema || data?.buttonId || data?.candidate || data?.subtext || data?.target;
  const duration = data?.duration || '50ms';
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // Status Badge Logic
  let statusBadge = null;
  let runningRing = '';

  if (status === 'running') {
    runningRing = 'ring-4 ring-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.6)] animate-pulse';
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
        <Loader2 className="w-3 h-3 animate-spin text-white" /> RUNNING
      </span>
    );
  } else if (status === 'success') {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-200 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-400/40">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SUCCESS
      </span>
    );
  } else if (status === 'failed') {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-200 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-400/40">
        <XCircle className="w-3 h-3 text-rose-400" /> FAILED
      </span>
    );
  } else if (status === 'skipped') {
    statusBadge = (
      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-200 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-400/40">
        <MinusCircle className="w-3 h-3 text-amber-400" /> SKIPPED
      </span>
    );
  }

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`action-node relative group rounded-2xl p-4 min-w-[240px] max-w-[280px] transition-all duration-300 backdrop-blur-[20px] border border-white/30 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_24px_rgba(59,130,246,0.5)] animate-node-drop ${
        selected ? 'ring-4 ring-white/60 shadow-[0_0_30px_rgba(59,130,246,0.7)]' : ''
      } ${runningRing} ${isSyncPulsing ? 'connected-node-pulse ring-2 ring-[#00d4ff]' : ''}`}
    >
      {/* Input Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-white !border-2 !border-[#3b82f6] !rounded-full hover:!scale-125 !transition-transform !shadow-md"
      />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-mono font-bold text-white">
          <Zap className="w-3 h-3 text-white" />
          <span className="uppercase">{actionType}</span>
        </div>

        {statusBadge || (
          <span className="text-[10px] font-mono text-blue-100 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
            {duration}
          </span>
        )}
      </div>

      {/* Main Title */}
      <h4 className="text-sm font-bold text-white transition-colors leading-snug mb-1 font-display">
        {data?.label || data?.name || 'Action Step'}
      </h4>

      {/* Subtext Target Identifier */}
      <div className="text-[11px] font-mono text-blue-100 bg-black/20 px-2.5 py-1 rounded-xl border border-white/20 truncate mb-2">
        <span>{targetCandidate ? String(targetCandidate) : 'Step Function'}</span>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[10px] font-mono text-blue-100 pt-1 border-t border-white/20">
        <span className="flex items-center gap-1 text-white">
          <Clock className="w-3 h-3 text-white" />
          <span>{data?.executionLatencyMs || 50}ms</span>
        </span>
        <span className="text-blue-100">Step {stepId}</span>
      </div>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-50 w-64 p-3 rounded-2xl bg-[#0a0e1a]/95 border border-[#3b82f6]/50 shadow-[0_0_30px_rgba(59,130,246,0.35)] backdrop-blur-[20px] text-xs font-mono space-y-1.5 pointer-events-none animate-node-pop text-left">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
            <span className="text-[#3b82f6] font-bold">ACTION DETAILS</span>
            <span className="text-slate-400">{stepId}</span>
          </div>
          <div className="text-[#e8edf5] font-sans font-bold">{data?.label || data?.name}</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400">Target Signature: </span>
            <span className="text-[#00d4ff] font-bold">{String(targetCandidate || 'standard')}</span>
          </div>
        </div>
      )}

      {/* Output Source Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-white !border-2 !border-[#2563eb] !rounded-full hover:!scale-125 !transition-transform !shadow-md"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';
