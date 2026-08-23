import React from 'react';
import { Workflow } from '../../types/workflow';
import { Sparkles, Layers, ArrowRight, CheckCircle2, AlertTriangle, GitBranch, Zap, ShieldCheck } from 'lucide-react';

interface MultiWorkflowCardsProps {
  workflows: Workflow[];
  selectedWorkflowId: string;
  onSelectWorkflow: (workflow: Workflow) => void;
  onAcceptAndOpenStudio: (workflow: Workflow) => void;
}

export const MultiWorkflowCards: React.FC<MultiWorkflowCardsProps> = ({
  workflows,
  selectedWorkflowId,
  onSelectWorkflow,
  onAcceptAndOpenStudio
}) => {
  if (!workflows || workflows.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] animate-ping" />
          <h3 className="text-xs font-mono font-bold text-[#00d4ff] uppercase tracking-wider font-display">
            DETECTED WORKFLOW DRAFTS ({workflows.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Independent Execution Chains
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((wf, idx) => {
          const isSelected = wf.id === selectedWorkflowId;
          const stepsCount = wf.steps?.length || wf.detectedSteps?.length || 4;
          const confidencePct = Math.round((wf.confidence || 0.92) * 100);
          const warningsCount = wf.warnings?.length || 0;

          return (
            <article
              key={wf.id || idx}
              onClick={() => onSelectWorkflow(wf)}
              className={`rounded-2xl p-6 border transition-all duration-300 backdrop-blur-[20px] flex flex-col justify-between space-y-4 cursor-pointer ${
                isSelected
                  ? 'bg-white/[0.08] border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.25)] ring-1 ring-[#00d4ff]'
                  : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.16]'
              }`}
            >
              {/* Top Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold text-[#00d4ff] bg-[#00d4ff]/15 border border-[#00d4ff]/30 px-2.5 py-0.5 rounded-2xl">
                    WORKFLOW #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#10b981]">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span>Confidence: {confidencePct}%</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-[#e8edf5] font-display">
                  {wf.workflowName || wf.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {wf.description || `Trigger: ${wf.triggerEvent?.type} on ${wf.triggerEvent?.schema}`}
                </p>
              </div>

              {/* Trigger & Steps Summary Pill */}
              <div className="p-3.5 rounded-2xl bg-[#0a0e1a]/80 border border-white/[0.08] text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Trigger:</span>
                  <span className="font-bold text-[#00d4ff]">
                    {wf.triggerEvent?.type} ({wf.triggerEvent?.schema})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Pipeline Steps:</span>
                  <span className="font-bold text-[#e8edf5]">{stepsCount} Orchestrated Steps</span>
                </div>
              </div>

              {/* Warnings Pill */}
              {warningsCount > 0 && (
                <div className="flex items-center gap-1.5 p-2.5 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-[11px] font-mono text-[#f59e0b]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                  <span className="truncate">{wf.warnings?.[0]}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWorkflow(wf);
                  }}
                  className="text-xs font-mono text-slate-400 hover:text-[#00d4ff] transition-colors"
                >
                  Review Details
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptAndOpenStudio(wf);
                  }}
                  className="glass-button-primary px-4 py-2 rounded-2xl text-[#0a0e1a] font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Accept & Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
