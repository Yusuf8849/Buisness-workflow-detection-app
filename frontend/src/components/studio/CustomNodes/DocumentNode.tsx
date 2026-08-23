import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileText, Database, Layers, CheckCircle2 } from 'lucide-react';

export const DocumentNode = memo(({ data, selected }: NodeProps<any>) => {
  const docType = data?.docType || data?.label || 'Business Artifact';
  const format = data?.format || 'PDF / Digital Payload';
  const schema = data?.schema || 'MongoDB Document';
  const isSyncPulsing = data?.isSyncPulsing;
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative group rounded-2xl p-4 min-w-[230px] max-w-[270px] transition-all duration-300 backdrop-blur-[20px] border border-[#7c3aed]/40 bg-[#7c3aed]/10 shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:border-[#7c3aed] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] animate-node-drop ${
        selected ? 'ring-2 ring-[#7c3aed] shadow-[0_0_35px_rgba(124,58,237,0.6)]' : ''
      } ${isSyncPulsing ? 'connected-node-pulse ring-2 ring-[#00d4ff]' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3.5 h-3.5 bg-[#7c3aed] border-2 border-[#0a0e1a] rounded-full hover:scale-125 transition-transform"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/40">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#e8edf5] font-display truncate group-hover:text-[#7c3aed] transition-colors">{docType}</h4>
            <span className="text-[10px] text-purple-300 font-mono">{format}</span>
          </div>
        </div>

        <span className="text-[10px] font-mono text-purple-300 bg-[#7c3aed]/15 px-2 py-0.5 rounded-2xl border border-[#7c3aed]/30">
          ARTIFACT
        </span>
      </div>

      <div className="mt-1 text-[10px] font-mono text-slate-400 pt-1.5 border-t border-white/[0.06] flex items-center justify-between">
        <span>Schema: {schema}</span>
        <span className="text-purple-300">Payload</span>
      </div>

      {/* Detailed Hover Tooltip */}
      {showTooltip && (
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-50 w-60 p-3 rounded-2xl bg-[#0a0e1a]/95 border border-[#7c3aed]/50 shadow-[0_0_30px_rgba(124,58,237,0.35)] backdrop-blur-[20px] text-xs font-mono space-y-1.5 pointer-events-none animate-node-pop">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
            <span className="text-purple-300 font-bold">ARTIFACT DETAILS</span>
            <span className="text-slate-400">Document</span>
          </div>
          <div className="text-[#e8edf5] font-sans font-bold">{docType}</div>
          <div className="text-[11px] text-slate-300">
            <span className="text-slate-400">Format: </span>
            <span className="text-purple-300">{format}</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/[0.06]">
            Drag node to re-link data flow
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3.5 h-3.5 bg-[#7c3aed] border-2 border-[#0a0e1a] rounded-full hover:scale-125 transition-transform"
      />
    </div>
  );
});

DocumentNode.displayName = 'DocumentNode';
