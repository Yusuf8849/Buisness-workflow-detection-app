import React, { useState } from 'react';
import { ApprovalStatus } from '../../services/collaborationSocket';
import { CheckCircle2, Clock, AlertCircle, Sparkles, ChevronDown, ShieldCheck } from 'lucide-react';
import { soundFX } from '../../utils/audioEffects';

interface ApprovalWorkflowBadgeProps {
  status: ApprovalStatus;
  onStatusChange: (nextStatus: ApprovalStatus, note?: string) => void;
}

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; bg: string; border: string; icon: any }> = {
  draft: {
    label: 'Draft Stage',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.3)',
    icon: Clock
  },
  ready_for_review: {
    label: 'Ready for Review',
    color: '#00d4ff',
    bg: 'rgba(0, 212, 255, 0.15)',
    border: 'rgba(0, 212, 255, 0.4)',
    icon: Sparkles
  },
  in_review: {
    label: 'In Review',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    icon: AlertCircle
  },
  approved: {
    label: 'Approved & Signed',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.18)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: CheckCircle2
  }
};

export const ApprovalWorkflowBadge: React.FC<ApprovalWorkflowBadgeProps> = ({
  status = 'ready_for_review',
  onStatusChange
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ready_for_review;
  const Icon = cfg.icon;

  const handleSelect = (next: ApprovalStatus) => {
    soundFX.playClick();
    if (next === 'approved') soundFX.playCelebration();
    onStatusChange(next);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-sm text-xs font-mono font-bold"
        style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
        title="Change Workflow Review / Approval Stage"
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{cfg.label}</span>
        <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.12] shadow-2xl p-2 z-40 space-y-1 backdrop-blur-[24px] animate-node-pop">
          <div className="px-2 py-1 text-[10px] font-mono text-slate-400 font-bold uppercase border-b border-white/[0.08] mb-1">
            Approval Workflow State
          </div>

          {(['draft', 'ready_for_review', 'in_review', 'approved'] as ApprovalStatus[]).map((st) => {
            const itemCfg = STATUS_CONFIG[st];
            const ItemIcon = itemCfg.icon;
            const isSelected = st === status;

            return (
              <button
                key={st}
                type="button"
                onClick={() => handleSelect(st)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  isSelected ? 'bg-white/[0.1] font-bold' : 'hover:bg-white/[0.05] text-slate-300'
                }`}
                style={{ color: isSelected ? itemCfg.color : undefined }}
              >
                <div className="flex items-center gap-2">
                  <ItemIcon className="w-3.5 h-3.5" style={{ color: itemCfg.color }} />
                  <span>{itemCfg.label}</span>
                </div>
                {isSelected && <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
