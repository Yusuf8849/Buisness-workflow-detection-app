import React, { useState, useEffect } from 'react';
import { Workflow, ProcessComparison } from '../../types/workflow';
import { api } from '../../services/api';
import { MOCK_COMPARISON_DATA } from '../../services/mockData';
import { X, Sparkles, Zap, ArrowRight, CheckCircle2, TrendingUp, Clock, Users, Layers, ShieldCheck } from 'lucide-react';

interface ProcessCompareModalProps {
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
  onApplyOptimized: (optimizedWorkflow: Workflow) => void;
}

export const ProcessCompareModal: React.FC<ProcessCompareModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onApplyOptimized
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState<boolean>(true);
  const [comparison, setComparison] = useState<ProcessComparison>(MOCK_COMPARISON_DATA);
  const [optimizedWf, setOptimizedWf] = useState<Workflow | null>(null);

  useEffect(() => {
    const fetchOpt = async () => {
      setLoading(true);
      try {
        const res = await api.getOptimization(workflow.id);
        setComparison(res.comparison);
        setOptimizedWf(res.optimizedWorkflow);
      } catch (e) {
        setComparison(MOCK_COMPARISON_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchOpt();
  }, [workflow.id]);

  const handleApply = () => {
    if (optimizedWf) {
      onApplyOptimized(optimizedWf);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e1a]/85 backdrop-blur-[20px]">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.08] shadow-[0_0_60px_rgba(124,58,237,0.25)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto backdrop-blur-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#7c3aed]/15 text-[#7c3aed] border border-[#7c3aed]/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#7c3aed] uppercase tracking-wider">
                FLOWINTEL AI PROCESS OPTIMIZATION
              </span>
              <h3 className="text-xl font-extrabold text-[#e8edf5] font-display">
                Current (As-Is) vs AI-Optimized (To-Be)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Improvements Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {comparison.improvements.map((imp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center space-y-1 shadow-md"
            >
              <span className="text-xs text-slate-300 font-medium">{imp.metric}</span>
              <div className="text-xl sm:text-2xl font-extrabold text-[#10b981] font-display">{imp.delta}</div>
              <span className="inline-block px-2.5 py-0.5 rounded-2xl bg-[#10b981]/15 text-[#10b981] text-[10px] font-mono font-bold">
                {imp.percent} Gain
              </span>
            </div>
          ))}
        </div>

        {/* Side-by-Side As-Is vs To-Be Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* As-Is Card */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-xs font-mono font-bold text-[#f43f5e]">AS-IS CURRENT PROCESS</span>
              <span className="px-2.5 py-0.5 rounded-2xl bg-[#f43f5e]/15 text-[#f43f5e] text-[10px] font-mono">
                Manual Intensive
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08]">
                <span className="text-slate-400">Total Steps:</span>
                <span className="font-bold text-[#e8edf5]">{comparison.asIs.stepCount} Steps</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08]">
                <span className="text-slate-400">Manual Department Handoffs:</span>
                <span className="font-bold text-[#f43f5e]">{comparison.asIs.manualHandoffs} Handoffs</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08]">
                <span className="text-slate-400">Approval Queues:</span>
                <span className="font-bold text-[#e8edf5]">{comparison.asIs.approvalStages} Stages</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08]">
                <span className="text-slate-400">Estimated Cycle Latency:</span>
                <span className="font-bold text-[#f59e0b]">{comparison.asIs.estimatedCycleTime}</span>
              </div>
            </div>
          </div>

          {/* To-Be Card */}
          <div className="p-6 rounded-2xl bg-white/[0.05] border border-[#7c3aed]/40 space-y-4 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
            <div className="flex items-center justify-between border-b border-[#7c3aed]/30 pb-3">
              <span className="text-xs font-mono font-bold text-purple-300">AI-OPTIMIZED TO-BE</span>
              <span className="px-2.5 py-0.5 rounded-2xl bg-[#7c3aed]/20 text-purple-200 text-[10px] font-mono font-bold">
                88% Automated STP
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-[#7c3aed]/30">
                <span className="text-slate-400">Optimized Steps:</span>
                <span className="font-bold text-[#10b981]">{comparison.toBe.stepCount} Steps</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-[#7c3aed]/30">
                <span className="text-slate-400">Automated Handoffs:</span>
                <span className="font-bold text-[#10b981]">{comparison.toBe.manualHandoffs} Exception Desk</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-[#7c3aed]/30">
                <span className="text-slate-400">Automated Approvals:</span>
                <span className="font-bold text-[#10b981]">Straight-Through Processing</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#0a0e1a] border border-[#7c3aed]/30">
                <span className="text-slate-400">Estimated Cycle Latency:</span>
                <span className="font-bold text-[#10b981]">{comparison.toBe.estimatedCycleTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transformation Rationale Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Key Architectural Redesigns:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {comparison.transformationPoints.map((tp, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
                <div className="font-bold text-purple-300 flex items-center gap-1.5 font-display">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#7c3aed] shrink-0" />
                  <span>{tp.stage}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-[#f43f5e] font-mono">Before: </span>
                  {tp.before}
                </div>
                <div className="text-[11px] text-slate-300">
                  <span className="text-[#10b981] font-mono">After: </span>
                  {tp.after}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="glass-card-interactive px-5 py-2.5 rounded-2xl text-slate-300 text-xs font-mono cursor-pointer"
          >
            Close Comparison
          </button>

          <button
            onClick={handleApply}
            className="glass-button-purple px-6 py-3 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            <span>Apply AI-Optimized Workflow to Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
