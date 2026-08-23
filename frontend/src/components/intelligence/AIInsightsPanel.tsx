import React from 'react';
import { Workflow, Insight, Bottleneck, HealthScore } from '../../types/workflow';
import { ShieldCheck, AlertTriangle, GitFork, Users, Zap, ArrowUpRight, Activity } from 'lucide-react';

interface AIInsightsPanelProps {
  workflow: Workflow;
  onHighlightNode: (nodeId: string) => void;
  onOpenOptimizeModal: () => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  workflow,
  onHighlightNode,
  onOpenOptimizeModal
}) => {
  const health = workflow.healthScore || {
    overall: 82,
    clarity: 91,
    decisionComplexity: 74,
    manualDependency: 68,
    efficiency: 83,
    ownershipClarity: 92
  };

  const insights = workflow.insights || [];
  const bottlenecks = workflow.bottlenecks || [];

  return (
    <aside aria-label="AI Intelligence and Insights" className="space-y-6">
      {/* 1. Workflow Health Score Card */}
      <section className="glass-card p-6 space-y-4" aria-label="Workflow Health Index">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-mono font-bold text-[#e8edf5] uppercase tracking-wider font-display">
              WORKFLOW HEALTH INDEX
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-[11px] font-mono font-bold">
            GRADE A-
          </span>
        </div>

        {/* Big Radial/Score Display */}
        <div className="flex items-center gap-6 my-4 p-4 rounded-2xl bg-[#0a0e1a]/80 border border-white/[0.08]">
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            {/* SVG Circular Progress Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/[0.08]"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#00d4ff]"
                strokeDasharray={`${health.overall}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-display text-[#e8edf5] leading-none">
                {health.overall}%
              </span>
              <span className="text-[9px] font-mono text-slate-400">Score</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold text-[#e8edf5]">Analyzed Quality</div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Topology validated with 0 cyclic dependencies.
            </p>
          </div>
        </div>

        {/* Factor Progress Bars */}
        <div className="space-y-2.5 pt-2 border-t border-white/[0.06] font-mono">
          {[
            { label: 'Clarity Index', score: health.clarity, color: 'bg-[#00d4ff]' },
            { label: 'Ownership', score: health.ownershipClarity, color: 'bg-[#3b82f6]' },
            { label: 'Efficiency', score: health.efficiency, color: 'bg-[#10b981]' },
            { label: 'Automation', score: 88, color: 'bg-[#7c3aed]' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-slate-300 text-[11px]">
                <span>{item.label}</span>
                <span className="font-bold text-[#e8edf5]">{item.score}%</span>
              </div>
              <div className="w-full bg-[#0a0e1a] h-1.5 rounded-full overflow-hidden border border-white/[0.08]">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Detected Bottlenecks Section */}
      <section className="glass-card p-6 space-y-4" aria-label="Bottleneck Risks">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="text-sm font-mono font-bold text-[#e8edf5] uppercase tracking-wider font-display">
              BOTTLENECK RISKS ({bottlenecks.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#f59e0b]">LATENCY HOTSPOTS</span>
        </div>

        <div className="space-y-3">
          {bottlenecks.map((btn, i) => (
            <div
              key={i}
              onClick={() => onHighlightNode(btn.nodeId)}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-[#f59e0b]/40 hover:border-[#f59e0b] cursor-pointer transition-all space-y-2 group shadow-sm backdrop-blur-[20px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
                  <span className="text-xs font-bold text-[#e8edf5] group-hover:text-[#f59e0b] transition-colors">
                    {btn.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#f43f5e] bg-[#f43f5e]/15 px-2.5 py-0.5 rounded-2xl border border-[#f43f5e]/30">
                  {btn.impact}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {btn.reason}
              </p>

              <div className="p-2.5 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[10px] text-amber-200 font-mono flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#f59e0b] shrink-0" />
                <span className="truncate">Fix: {btn.suggestedFix}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Actionable AI Insights */}
      <section className="glass-card p-6 space-y-4" aria-label="Actionable AI Insights">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-mono font-bold text-[#e8edf5] uppercase tracking-wider font-display">
              AI PROCESS INSIGHTS
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">CLICK TO LOCATE</span>
        </div>

        <div className="space-y-3">
          {insights.map((ins) => (
            <div
              key={ins.id}
              onClick={() => {
                if (ins.relatedNodeIds && ins.relatedNodeIds.length > 0) {
                  onHighlightNode(ins.relatedNodeIds[0]);
                }
              }}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#00d4ff]/50 cursor-pointer transition-all space-y-1.5 group backdrop-blur-[20px]"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-[#00d4ff] transition-colors">
                  {ins.title}
                </h4>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00d4ff] transition-colors" />
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {ins.description}
              </p>

              <div className="text-[10px] text-[#00d4ff] font-mono">
                💡 {ins.recommendation}
              </div>
            </div>
          ))}
        </div>

        {/* AI Auto-Optimize CTA Banner */}
        <button
          type="button"
          onClick={onOpenOptimizeModal}
          className="w-full glass-button-purple button-scale py-3 px-4 rounded-2xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          <span>Launch AI Process Optimization (To-Be)</span>
        </button>
      </section>
    </aside>
  );
};
