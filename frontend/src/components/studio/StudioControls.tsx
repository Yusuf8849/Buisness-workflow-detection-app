import React, { useState } from 'react';
import { LayoutDirection } from '../../utils/layoutEngine';
import { CollaboratorUser, ApprovalStatus } from '../../services/collaborationSocket';
import { CollaboratorAvatars } from '../collaboration/CollaboratorAvatars';
import { ApprovalWorkflowBadge } from '../collaboration/ApprovalWorkflowBadge';
import {
  LayoutGrid,
  Zap,
  AlertTriangle,
  Plus,
  Download,
  GitBranch,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Save,
  RotateCcw,
  ArrowRight,
  ArrowDown,
  Grid,
  FileText,
  MessageSquare
} from 'lucide-react';

interface StudioControlsProps {
  currentLayout: LayoutDirection;
  onApplyLayout: (dir: LayoutDirection) => void;
  isBottleneckMode: boolean;
  onToggleBottleneckMode: () => void;
  onAddNode: (type: 'actionNode' | 'decisionNode' | 'actorNode' | 'documentNode') => void;
  onSaveVersion: () => void;
  onOptimize: () => void;
  onExport: () => void;
  onFitView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  collaborators?: CollaboratorUser[];
  commentsCount?: number;
  onOpenComments?: () => void;
  approvalStatus?: ApprovalStatus;
  onApprovalStatusChange?: (status: ApprovalStatus) => void;
}

export const StudioControls: React.FC<StudioControlsProps> = ({
  currentLayout,
  onApplyLayout,
  isBottleneckMode,
  onToggleBottleneckMode,
  onAddNode,
  onSaveVersion,
  onOptimize,
  onExport,
  onFitView,
  onZoomIn,
  onZoomOut,
  collaborators = [],
  commentsCount = 0,
  onOpenComments,
  approvalStatus = 'ready_for_review',
  onApprovalStatusChange
}) => {
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      {/* Left: Layout Switcher Tabs (Horizontal, Vertical, Swimlanes, Compact) */}
      <div className="flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.08] backdrop-blur-[20px]">
        <span className="text-[10px] font-mono text-slate-400 uppercase px-2 font-bold">Layout:</span>

        {/* Tab 1: Horizontal */}
        <button
          type="button"
          onClick={() => onApplyLayout('LR')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentLayout === 'LR'
              ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/60 shadow-[0_0_15px_rgba(0,212,255,0.25)] font-bold'
              : 'text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05]'
          }`}
          title="Horizontal Left-to-Right Flow"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Horizontal</span>
        </button>

        {/* Tab 2: Vertical */}
        <button
          type="button"
          onClick={() => onApplyLayout('TB')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentLayout === 'TB'
              ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/60 shadow-[0_0_15px_rgba(0,212,255,0.25)] font-bold'
              : 'text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05]'
          }`}
          title="Vertical Top-to-Bottom Flow"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>Vertical</span>
        </button>

        {/* Tab 3: Swimlanes */}
        <button
          type="button"
          onClick={() => onApplyLayout('SWIMLANE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
            currentLayout === 'SWIMLANE'
              ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/60 shadow-[0_0_15px_rgba(0,212,255,0.25)] font-bold'
              : 'text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05]'
          }`}
          title="Department Swimlane Matrix"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Swimlanes</span>
        </button>
      </div>

      {/* Center: Real-Time Team Presence Avatars & Approval Badge */}
      <div className="flex items-center gap-2.5">
        {/* Live Collaborators Presence */}
        <CollaboratorAvatars
          users={collaborators}
          onOpenTeamShareModal={onExport}
        />

        {/* Approval Workflow State Machine */}
        {onApprovalStatusChange && (
          <ApprovalWorkflowBadge
            status={approvalStatus}
            onStatusChange={onApprovalStatusChange}
          />
        )}
      </div>

      {/* Right: Actions, Comments, Versioning & Sharing */}
      <div className="flex items-center gap-2">
        {/* Toggle Bottleneck Heatmap */}
        <button
          type="button"
          onClick={onToggleBottleneckMode}
          className={`px-3 py-1.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isBottleneckMode
              ? 'bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              : 'glass-card-interactive text-slate-300 hover:text-[#f43f5e]'
          }`}
          title="Highlight Latency Bottlenecks"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Bottlenecks</span>
        </button>

        {/* Real-time Node Comments Drawer Button */}
        {onOpenComments && (
          <button
            type="button"
            onClick={onOpenComments}
            className="px-3 py-1.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.1] hover:border-[#00d4ff] text-slate-300 hover:text-[#00d4ff] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Open Collaborative Step Comments"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Comments</span>
            {commentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#00d4ff]/20 text-[#00d4ff] text-[10px]">
                {commentsCount}
              </span>
            )}
          </button>
        )}

        {/* Add Node Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-3.5 py-1.5 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono font-bold hover:bg-[#00d4ff]/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          {showAddMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.12] shadow-2xl p-2 z-30 space-y-1 backdrop-blur-[20px] animate-node-pop">
              <button
                type="button"
                onClick={() => { onAddNode('actionNode'); setShowAddMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-[#10b981] hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#10b981]" />
                <span>+ Action Node (Green)</span>
              </button>
              <button
                type="button"
                onClick={() => { onAddNode('decisionNode'); setShowAddMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-[#f59e0b] hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>+ Decision Diamond (Orange)</span>
              </button>
              <button
                type="button"
                onClick={() => { onAddNode('actorNode'); setShowAddMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-[#3b82f6] hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>+ Actor Role (Blue)</span>
              </button>
              <button
                type="button"
                onClick={() => { onAddNode('documentNode'); setShowAddMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-mono text-[#7c3aed] hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#7c3aed]" />
                <span>+ Artifact (Purple)</span>
              </button>
            </div>
          )}
        </div>

        {/* Save Version */}
        <button
          type="button"
          onClick={onSaveVersion}
          className="glass-card-interactive p-2 rounded-2xl text-slate-300 hover:text-[#00d4ff] text-xs transition-colors cursor-pointer"
          title="Save New Workflow Version"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* Share & Export */}
        <button
          type="button"
          onClick={onExport}
          className="px-3 py-1.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] hover:border-[#00d4ff] text-slate-200 hover:text-[#00d4ff] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title="Share Link, Embed Code, Social Share & Export (PNG/SVG/PDF/JSON)"
        >
          <Download className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span>Share & Export</span>
        </button>
      </div>
    </div>
  );
};
