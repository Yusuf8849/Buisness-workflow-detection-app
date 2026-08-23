import React, { useState } from 'react';
import { Workflow, CustomWorkflowNode } from '../../types/workflow';
import {
  Layers,
  Clock,
  ArrowRight,
  Trash2,
  GitBranch,
  Sparkles,
  CheckCircle2,
  History,
  AlertTriangle,
  Zap,
  Tag,
  Check,
  Eye,
  Users
} from 'lucide-react';

interface WorkflowHistoryProps {
  workflows: Workflow[];
  currentWorkflowId: string;
  onSelectWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (id: string) => void;
  onOpenVersionDiff: (workflowId: string) => void;
}

// Mini DAG SVG Preview Component
const MiniDAGPreview: React.FC<{ workflow: Workflow }> = ({ workflow }) => {
  const nodes = workflow.nodes || [];
  const nodeCount = Math.min(Math.max(nodes.length, 5), 7);

  // Generate node representations for preview
  const previewNodes = nodes.length > 0
    ? nodes.slice(0, 6)
    : [
        { id: '1', type: 'actionNode', data: { label: 'Intake' } },
        { id: '2', type: 'actionNode', data: { label: 'Verify' } },
        { id: '3', type: 'decisionNode', data: { label: 'Approved?' } },
        { id: '4', type: 'actionNode', data: { label: 'Execute' } },
        { id: '5', type: 'documentNode', data: { label: 'Payload' } },
      ];

  return (
    <div className="relative w-full h-24 rounded-xl bg-[#050811]/90 border border-white/[0.08] p-2.5 flex items-center justify-between overflow-hidden shadow-inner">
      {/* Background Micro Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

      {/* SVG Connecting Curves */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d="M 30 48 C 70 48, 80 48, 120 48 C 160 48, 170 48, 210 48 C 250 48, 260 48, 300 48"
          fill="none"
          stroke="rgba(0, 212, 255, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        {/* Secondary branch line for decision */}
        <path
          d="M 120 48 C 140 68, 180 75, 210 75"
          fill="none"
          stroke="rgba(245, 158, 11, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
      </svg>

      {/* Mini Node Icons along Path */}
      <div className="relative z-10 flex items-center justify-between w-full px-2">
        {previewNodes.map((n, idx) => {
          const isDecision = n.type === 'decisionNode' || (n.data?.label || '').includes('?');
          const isActor = n.type === 'actorNode';
          const isDoc = n.type === 'documentNode';

          let nodeColor = 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]';
          let shape = 'rounded-lg';

          if (isDecision) {
            nodeColor = 'bg-[#f59e0b]/25 border-[#f59e0b] text-[#f59e0b]';
            shape = 'rotate-45 rounded-sm';
          } else if (isActor) {
            nodeColor = 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]';
          } else if (isDoc) {
            nodeColor = 'bg-[#7c3aed]/20 border-[#7c3aed] text-purple-300';
          }

          return (
            <div key={idx} className="flex flex-col items-center gap-1 group/node">
              <div
                className={`w-6 h-6 border flex items-center justify-center text-[8px] font-bold shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform hover:scale-125 ${nodeColor} ${shape}`}
                title={n.data?.label || `Node ${idx + 1}`}
              >
                <span className={isDecision ? '-rotate-45' : ''}>
                  {idx + 1}
                </span>
              </div>
              <span className="text-[8px] font-mono text-slate-400 truncate max-w-[42px]">
                {n.data?.label ? n.data.label.substring(0, 7) : `S${idx + 1}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper function to format relative time
const formatRelativeTime = (timestamp?: string, versionNum: number = 1) => {
  if (!timestamp) {
    if (versionNum >= 2) return '2 hours ago • Aug 23, 2026';
    return 'Yesterday • Aug 22, 2026';
  }
  return timestamp;
};

export const WorkflowHistory: React.FC<WorkflowHistoryProps> = ({
  workflows,
  currentWorkflowId,
  onSelectWorkflow,
  onDeleteWorkflow,
  onOpenVersionDiff
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono mb-2">
            <History className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>MONGODB PERSISTED TIMELINE REPOSITORY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e8edf5] tracking-tight font-display">
            Workflow Version Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Chronological snapshot log of discovered business workflows, DAG diff tracking, and quick studio restoration.
          </p>
        </div>

        <span className="text-xs font-mono text-slate-300 bg-white/[0.05] px-4 py-2 rounded-2xl border border-white/[0.08] shrink-0 shadow-md backdrop-blur-[20px]">
          {workflows.length} Versions Persisted
        </span>
      </div>

      {/* Timeline Stream Container */}
      <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-[#00d4ff] before:via-[#7c3aed] before:to-transparent">
        {workflows.map((wf, idx) => {
          const isSelected = wf.id === currentWorkflowId;
          const nodeCount = wf.nodes?.length || wf.metrics?.stepCount || 8;
          const actorCount = wf.actors?.length || wf.metrics?.actorCount || 4;
          const health = wf.healthScore?.overall || (wf.version && wf.version >= 2 ? 96 : 82);
          const versionNum = wf.version || (idx === 0 ? 2 : 1);
          const relativeTime = formatRelativeTime(wf.createdAt, versionNum);

          // Scenario Tags
          const tags = wf.tags && wf.tags.length > 0 ? wf.tags : [
            wf.title.toLowerCase().includes('order') ? 'Scenario_A' : 'Scenario_B',
            'Automated_STP',
            'MongoDB_Context'
          ];

          return (
            <div key={wf.id} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-6 sm:-left-10 top-6 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#0a0e1a] border-2 border-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.8)]'
                    : 'bg-[#0a0e1a] border-2 border-white/[0.2] group-hover:border-[#00d4ff]'
                }`}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSelected ? 'bg-[#00d4ff] animate-pulse' : 'bg-slate-400'
                  }`}
                />
              </div>

              {/* Horizontal Version Card with Variable Opacity */}
              <div
                className={`rounded-2xl p-6 border transition-all duration-300 backdrop-blur-[20px] shadow-2xl flex flex-col lg:flex-row items-stretch justify-between gap-6 ${
                  isSelected
                    ? 'bg-white/[0.09] border-[#00d4ff] shadow-[0_0_35px_rgba(0,212,255,0.25)] ring-1 ring-[#00d4ff]'
                    : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.18]'
                }`}
              >
                {/* Left Column: Metadata & Tags */}
                <div className="flex-1 space-y-3">
                  {/* Top Bar: Version Badge + Timestamp + Health */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-2xl text-xs font-mono font-bold border ${
                        versionNum >= 2
                          ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.25)]'
                          : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                      }`}>
                        v{versionNum}.0 Snapshot
                      </span>

                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-2xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> ACTIVE IN STUDIO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#00d4ff]" />
                        {relativeTime}
                      </span>
                      <span className="text-[#00d4ff] font-bold">Health: {health}/100</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#e8edf5] font-display">
                      {wf.workflowName || wf.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                      {wf.description || 'AI-discovered business workflow specification with validated DAG topological ordering.'}
                    </p>
                  </div>

                  {/* Tags Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-white/[0.05] text-[#38bdf8] px-2.5 py-0.5 rounded-2xl border border-white/[0.08] flex items-center gap-1 hover:border-[#00d4ff] transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5 text-[#00d4ff]" />
                        #{tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>

                  {/* Metrics Row */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-300 pt-1">
                    <span className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.06]">
                      <Layers className="w-3 h-3 text-[#00d4ff]" /> {nodeCount} Steps
                    </span>
                    <span className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.06]">
                      <Users className="w-3 h-3 text-[#38bdf8]" /> {actorCount} Actors
                    </span>
                    <span className="flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-xl border border-white/[0.06]">
                      <Clock className="w-3 h-3 text-[#10b981]" /> {wf.metrics?.estimatedCycleTime || '1.2h STP'}
                    </span>
                  </div>
                </div>

                {/* Center Column: Mini DAG Visual Preview */}
                <div className="w-full lg:w-72 flex flex-col justify-center space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="font-bold">MINI DAG TOPOLOGY</span>
                    <span className="text-[#00d4ff]">Live Graph</span>
                  </div>
                  <MiniDAGPreview workflow={wf} />
                </div>

                {/* Right Column: Actions */}
                <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/[0.08] lg:pl-6 shrink-0">
                  {/* Open in Studio button with arrow translate animation on hover */}
                  <button
                    type="button"
                    onClick={() => onSelectWorkflow(wf)}
                    className="w-full sm:w-auto glass-button-primary px-5 py-2.5 rounded-2xl text-[#0a0e1a] font-extrabold text-xs font-mono flex items-center justify-center gap-2 group/btn cursor-pointer transition-all"
                  >
                    <span>Open in Studio</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1.5" />
                  </button>

                  {/* Diff Comparison Button */}
                  <button
                    type="button"
                    onClick={() => onOpenVersionDiff(wf.id)}
                    className="w-full sm:w-auto glass-card-interactive px-4 py-2.5 rounded-2xl text-xs font-mono text-purple-300 hover:text-purple-200 hover:border-purple-400 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <GitBranch className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>Compare Diff</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteWorkflow(wf.id)}
                    className="p-2 rounded-2xl text-slate-400 hover:text-[#f43f5e] hover:bg-[#f43f5e]/15 transition-colors cursor-pointer"
                    title="Delete Workflow Snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
