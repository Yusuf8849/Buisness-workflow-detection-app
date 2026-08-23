import React, { useState } from 'react';
import { Workflow, AgentEditProposal } from '../../types/workflow';
import { api } from '../../services/api';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Loader2, GitBranch, Zap, Check } from 'lucide-react';

interface AgentEditModalProps {
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
  onApplyDraft: (updatedWorkflow: Workflow) => void;
}

export const AgentEditModal: React.FC<AgentEditModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onApplyDraft
}) => {
  if (!isOpen) return null;

  const [instruction, setInstruction] = useState<string>('Change Update Inventory so it only runs when stock_type is physical');
  const [isProposing, setIsProposing] = useState<boolean>(false);
  const [proposal, setProposal] = useState<AgentEditProposal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    setIsProposing(true);
    setError(null);

    try {
      const res = await api.agentEditWorkflow(workflow.id, instruction);
      setProposal(res);
    } catch (err: any) {
      setError(err.message || 'AI proposal generation failed');
    } finally {
      setIsProposing(false);
    }
  };

  const handleApply = async () => {
    if (!proposal || !proposal.updatedDraft) return;
    try {
      const applied = await api.applyAgentEdit(workflow.id, proposal.updatedDraft);
      onApplyDraft(applied);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to apply draft');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e1a]/85 backdrop-blur-[20px]">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.08] shadow-[0_0_50px_rgba(124,58,237,0.25)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto backdrop-blur-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#7c3aed]/15 text-[#7c3aed] border border-[#7c3aed]/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#7c3aed] font-bold">
                AI WORKFLOW EDITING ASSISTANT
              </span>
              <h3 className="text-base font-bold text-[#e8edf5] font-display">
                Natural Language Workflow Refinement
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handlePropose} className="space-y-3">
          <label className="block text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
            Enter Modification Request:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Change Update Inventory so it only runs when stock_type is physical"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#7c3aed] text-[#e8edf5] text-xs font-mono outline-none"
            />
            <button
              type="submit"
              disabled={isProposing || !instruction.trim()}
              className="px-5 py-2.5 rounded-2xl glass-button-purple text-white font-bold text-xs font-mono disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {isProposing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Propose</span>
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
          <span className="text-slate-500">Quick Prompts:</span>
          {[
            'Change Update Inventory so it only runs when stock_type is physical',
            'Add an approval step after Validate Request',
            'Replace Send Confirmation with SendOrderConfirmation'
          ].map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInstruction(promptText)}
              className="px-2.5 py-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-purple-300 hover:border-[#7c3aed] truncate max-w-[280px] cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-xs font-mono text-[#f43f5e]">
            {error}
          </div>
        )}

        {/* Proposed Diff Preview Card */}
        {proposal && (
          <div className="p-5 rounded-2xl bg-white/[0.04] border border-[#7c3aed]/40 space-y-4 text-xs font-mono backdrop-blur-[20px]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-purple-300 font-bold">PROPOSED CHANGE PREVIEW:</span>
              <span className="text-[#10b981] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% DAG VALIDATED
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] text-slate-200">
              {proposal.proposedChange}
            </div>

            {/* Patch items */}
            {proposal.patch && (
              <div className="space-y-1.5 text-[11px] text-slate-300">
                {proposal.patch.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-[#00d4ff] font-bold">↳</span>
                    <span>{p.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Safety Guarantee Notice */}
            <div className="p-2.5 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[10px] text-purple-200">
              🔒 <strong>FlowIntel Safety Guarantee:</strong> AI proposals are strictly validated and require explicit user approval before publishing or execution.
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="glass-card-interactive px-4 py-2 rounded-2xl text-slate-300 text-xs font-mono cursor-pointer"
          >
            Cancel
          </button>

          {proposal && (
            <button
              onClick={handleApply}
              className="glass-button-purple px-6 py-2.5 rounded-2xl font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Apply Draft to Studio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
