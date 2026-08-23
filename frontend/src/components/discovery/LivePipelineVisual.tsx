import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, Cpu, GitMerge, HelpCircle, Network, LayoutGrid, Zap } from 'lucide-react';
import { PipelineStage } from '../../types/workflow';

interface LivePipelineVisualProps {
  currentStage: number; // 1 through 7
  stages?: PipelineStage[];
  isProcessing: boolean;
}

const DEFAULT_STAGES = [
  { step: 1, name: 'Reading Business Information', icon: Cpu },
  { step: 2, name: 'Detecting Entities & Actors', icon: Sparkles },
  { step: 3, name: 'Identifying Actions & Verbs', icon: Zap },
  { step: 4, name: 'Finding Decision Gates', icon: HelpCircle },
  { step: 5, name: 'Inferring Relationships & Links', icon: GitMerge },
  { step: 6, name: 'Constructing Workflow DAG', icon: Network },
  { step: 7, name: 'Generating Interactive Diagram', icon: LayoutGrid },
];

export const LivePipelineVisual: React.FC<LivePipelineVisualProps> = ({
  currentStage,
  stages,
  isProcessing
}) => {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-ping" />
          <h3 className="text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider font-display">
            AI PROCESSING PIPELINE
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Stage {Math.min(7, currentStage)} of 7
        </span>
      </div>

      {/* Vertical / Horizontal Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
        {DEFAULT_STAGES.map((s) => {
          const isDone = currentStage > s.step;
          const isCurrent = currentStage === s.step;
          const isPending = currentStage < s.step;
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[90px] backdrop-blur-[20px] ${
                isDone
                  ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]'
                  : isCurrent
                  ? 'bg-[#00d4ff]/15 border-[#00d4ff] text-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.3)] ring-1 ring-[#00d4ff]'
                  : 'bg-white/[0.03] border-white/[0.06] text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold">0{s.step}</span>
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-700" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                    {s.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
