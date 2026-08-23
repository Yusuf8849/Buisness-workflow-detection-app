import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, CheckCircle2, Flag } from 'lucide-react';

export const MilestoneNode = memo(({ data, selected }: NodeProps<any>) => {
  const isStart = data?.label?.toLowerCase().includes('start') || data?.status === 'active';
  const label = data?.label || (isStart ? 'Process Start' : 'Process Completed');
  const isSyncPulsing = data?.isSyncPulsing;

  return (
    <div
      className={`relative rounded-2xl px-5 py-3 min-w-[180px] max-w-[220px] transition-all backdrop-blur-[20px] text-center animate-node-drop ${
        selected
          ? isStart
            ? 'ring-2 ring-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.6)] bg-[#0a0e1a]/95'
            : 'ring-2 ring-[#10b981] shadow-[0_0_30px_rgba(16,185,129,0.6)] bg-[#0a0e1a]/95'
          : isStart
          ? 'border-2 border-[#00d4ff]/60 bg-[#00d4ff]/10 shadow-[0_0_20px_rgba(0,212,255,0.25)] hover:border-[#00d4ff]'
          : 'border-2 border-[#10b981]/60 bg-[#10b981]/10 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:border-[#10b981]'
      } ${isSyncPulsing ? 'connected-node-pulse ring-2 ring-[#00d4ff]' : ''}`}
    >
      {!isStart && (
        <Handle type="target" position={Position.Left} className="w-3.5 h-3.5 bg-[#10b981] border-2 border-[#0a0e1a] rounded-full hover:scale-125 transition-transform" />
      )}

      <div className="flex items-center justify-center gap-2">
        <div className={`p-1.5 rounded-full ${isStart ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
          {isStart ? <Play className="w-3.5 h-3.5 fill-current" /> : <CheckCircle2 className="w-4 h-4" />}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider font-mono ${isStart ? 'text-[#00d4ff]' : 'text-[#10b981]'}`}>
          {label}
        </span>
      </div>

      {isStart && (
        <Handle type="source" position={Position.Right} className="w-3.5 h-3.5 bg-[#00d4ff] border-2 border-[#0a0e1a] rounded-full hover:scale-125 transition-transform" />
      )}
    </div>
  );
});

MilestoneNode.displayName = 'MilestoneNode';
