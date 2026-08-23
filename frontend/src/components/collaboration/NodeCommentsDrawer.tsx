import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeComment } from '../../services/collaborationSocket';
import { Workflow } from '../../types/workflow';
import { MessageSquare, Send, X, CheckCircle2, Clock, User, Filter, Sparkles } from 'lucide-react';
import { soundFX } from '../../utils/audioEffects';

interface NodeCommentsDrawerProps {
  workflow: Workflow;
  comments: NodeComment[];
  selectedNodeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (nodeId: string, text: string) => void;
  onSelectNode: (nodeId: string) => void;
}

export const NodeCommentsDrawer: React.FC<NodeCommentsDrawerProps> = ({
  workflow,
  comments,
  selectedNodeId,
  isOpen,
  onClose,
  onAddComment,
  onSelectNode
}) => {
  const [commentText, setCommentText] = useState<string>('');
  const [filterNodeId, setFilterNodeId] = useState<string | null>(selectedNodeId);

  if (!isOpen) return null;

  const filteredComments = filterNodeId
    ? comments.filter((c) => c.nodeId === filterNodeId)
    : comments;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const targetNode = filterNodeId || selectedNodeId || (workflow.nodes?.[0]?.id || 'root');
    soundFX.playClick();
    onAddComment(targetNode, commentText.trim());
    setCommentText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0a0e1a]/95 border-l border-white/[0.1] shadow-2xl backdrop-blur-[24px] flex flex-col justify-between">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-display">
                Real-Time Node Comments ({comments.length})
              </h3>
              <p className="text-[10px] font-mono text-slate-400">
                Collaborative process review and annotations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Filter Selector */}
        <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Filter by Step:</span>
          <select
            value={filterNodeId || 'all'}
            onChange={(e) => setFilterNodeId(e.target.value === 'all' ? null : e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-[#0a0e1a] border border-white/[0.12] text-xs font-mono text-[#00d4ff] max-w-[200px]"
          >
            <option value="all">All Steps ({comments.length})</option>
            {workflow.nodes?.map((n) => (
              <option key={n.id} value={n.id}>
                {n.data?.label || n.data?.name || n.id}
              </option>
            ))}
          </select>
        </div>

        {/* Comments Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredComments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-slate-400">
                <MessageSquare className="w-5 h-5 text-slate-500" />
              </div>
              <p className="text-xs font-mono text-slate-400">No comments on this step yet.</p>
              <p className="text-[11px] text-slate-500">Leave a review note or bottleneck suggestion below.</p>
            </div>
          ) : (
            filteredComments.map((cmt) => {
              const nodeObj = workflow.nodes?.find((n) => n.id === cmt.nodeId);
              const nodeLabel = nodeObj?.data?.label || nodeObj?.data?.name || cmt.nodeId;

              return (
                <div
                  key={cmt.id}
                  onClick={() => onSelectNode(cmt.nodeId)}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#00d4ff]/40 transition-all space-y-2 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center text-xs">
                        <span>{cmt.avatar || '👤'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 font-mono">{cmt.author}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-1.5">({cmt.role})</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans pl-8">
                    {cmt.text}
                  </p>

                  <div className="pt-1 pl-8 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded-lg border border-[#00d4ff]/20">
                      Step: {nodeLabel}
                    </span>
                    <span className="text-emerald-400 group-hover:underline">
                      Click to Focus Node →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* New Comment Input Box */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.08] bg-[#0a0e1a] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Commenting on:</span>
            <span className="text-[#00d4ff] font-bold">
              {workflow.nodes?.find((n) => n.id === (filterNodeId || selectedNodeId))?.data?.label || 'General Step'}
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Suggest an optimization or point out a bottleneck..."
              className="w-full p-3 pr-12 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-xs font-sans text-slate-200 placeholder-slate-500 focus:border-[#00d4ff] focus:outline-none resize-none"
            />

            <button
              type="submit"
              disabled={!commentText.trim()}
              className="absolute right-2.5 bottom-3 p-2 rounded-xl bg-[#00d4ff] text-[#0a0e1a] disabled:opacity-40 transition-opacity cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </AnimatePresence>
  );
};
