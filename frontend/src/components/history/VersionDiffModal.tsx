import React, { useState, useEffect } from 'react';
import { WorkflowVersion } from '../../types/workflow';
import { api } from '../../services/api';
import { X, GitBranch, Clock, CheckCircle2, ArrowRight, RotateCcw, Layers, PlusCircle, MinusCircle, Check, Zap } from 'lucide-react';

interface VersionDiffModalProps {
  workflowId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion?: (version: WorkflowVersion) => void;
}

export const VersionDiffModal: React.FC<VersionDiffModalProps> = ({
  workflowId,
  isOpen,
  onClose,
  onRestoreVersion
}) => {
  if (!isOpen || !workflowId) return null;

  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVersions = async () => {
      setLoading(true);
      try {
        const list = await api.getVersions(workflowId);
        if (list && list.length > 0) {
          setVersions(list);
        } else {
          setVersions([
            {
              id: 'ver_mock_2',
              workflowId,
              versionNumber: 2,
              title: 'v2.0 — Automated OCR Integration & Branch Optimization',
              changeSummary: 'Replaced manual document verification with AI OCR and added direct-through auto-approval gateway.',
              nodes: [],
              edges: [],
              changes: [
                { type: 'added_step', description: '+ [ADDED] Real-time AI Document OCR & Verification (15s latency)' },
                { type: 'added_step', description: '+ [ADDED] Straight-Through-Processing (STP) Auto-Approval Gateway' },
                { type: 'changed_owner', description: '~ [MODIFIED] Re-routed Exception Desk to Senior Underwriting specialist' },
                { type: 'modified_edge', description: '~ [ROUTING] Parallelized AML Compliance check with Credit Scoring' },
                { type: 'removed_step', description: '- [REMOVED] 4.5-Hour Manual Document Verification Queue' }
              ],
              createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'ver_mock_1',
              workflowId,
              versionNumber: 1,
              title: 'v1.0 — Initial AI Process Discovery Baseline',
              changeSummary: 'Synthesized from natural language SOP description with 4 actors and 2 decision gates.',
              nodes: [],
              edges: [],
              changes: [
                { type: 'added_step', description: '+ [BASELINE] Initial graph synthesized from natural language SOP description' }
              ],
              createdAt: new Date(Date.now() - 86400000).toISOString()
            }
          ]);
        }
      } catch (e) {
        console.warn('Failed to load versions');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [workflowId]);

  const activeVer = versions[selectedVersionIdx] || versions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e1a]/85 backdrop-blur-[20px]">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.08] shadow-[0_0_60px_rgba(124,58,237,0.25)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto backdrop-blur-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#7c3aed]/15 text-[#7c3aed] border border-[#7c3aed]/30">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#7c3aed] font-bold">VERSION DIFF & GRAPH DELTAS</span>
              <h3 className="text-base font-bold text-[#e8edf5] font-display">Workflow Evolution Inspector</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {versions.map((ver, idx) => (
            <button
              key={ver.id || idx}
              onClick={() => setSelectedVersionIdx(idx)}
              className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                selectedVersionIdx === idx
                  ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-purple-200 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-[#e8edf5]'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              <span>v{ver.versionNumber || (idx === 0 ? 2 : 1)}.0 Snapshot</span>
            </button>
          ))}
        </div>

        {/* Active Version Overview Card */}
        {activeVer && (
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3 backdrop-blur-[20px]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#e8edf5] font-display">
                {activeVer.title}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#00d4ff]" />
                {new Date(activeVer.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeVer.changeSummary}
            </p>
          </div>
        )}

        {/* Green/Red Diff Visualization Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold uppercase tracking-wider">
              TOPOLOGICAL DIFF (ADDITIONS & DELETIONS):
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-[#10b981]">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Additions
              </span>
              <span className="flex items-center gap-1 text-[#f43f5e]">
                <span className="w-2 h-2 rounded-full bg-[#f43f5e]" /> Deletions
              </span>
              <span className="flex items-center gap-1 text-[#00d4ff]">
                <span className="w-2 h-2 rounded-full bg-[#00d4ff]" /> Modifications
              </span>
            </div>
          </div>

          {/* Change Items List */}
          <div className="space-y-2 font-mono text-xs">
            {activeVer?.changes && activeVer.changes.length > 0 ? (
              activeVer.changes.map((c, i) => {
                const desc = c.description || '';
                const isAdded = desc.includes('+') || c.type === 'added_step';
                const isRemoved = desc.includes('-') || c.type === 'removed_step';
                const isModified = desc.includes('~') || c.type === 'modified_edge' || c.type === 'changed_owner';

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                      isAdded
                        ? 'bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]'
                        : isRemoved
                        ? 'bg-[#f43f5e]/15 border-[#f43f5e]/40 text-[#f43f5e] line-through'
                        : 'bg-[#00d4ff]/15 border-[#00d4ff]/40 text-[#00d4ff]'
                    }`}
                  >
                    {isAdded ? (
                      <PlusCircle className="w-4 h-4 shrink-0 text-[#10b981] mt-0.5" />
                    ) : isRemoved ? (
                      <MinusCircle className="w-4 h-4 shrink-0 text-[#f43f5e] mt-0.5" />
                    ) : (
                      <Zap className="w-4 h-4 shrink-0 text-[#00d4ff] mt-0.5" />
                    )}
                    <span className="font-semibold">{desc}</span>
                  </div>
                );
              })
            ) : (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-slate-400 text-center">
                Initial baseline snapshot with zero divergence.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="glass-card-interactive px-5 py-2.5 rounded-2xl text-slate-300 text-xs font-mono cursor-pointer"
          >
            Close Diff Inspector
          </button>

          {activeVer && onRestoreVersion && (
            <button
              onClick={() => {
                onRestoreVersion(activeVer);
                onClose();
              }}
              className="glass-button-purple px-6 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Snapshot to Studio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
