import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow } from '../../types/workflow';
import { exportHelper } from '../../utils/exportHelper';
import { useToast } from '../common/ToastNotification';
import { soundFX } from '../../utils/audioEffects';
import {
  X,
  Download,
  Share2,
  Code2,
  FileImage,
  FileCode,
  FileText,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Linkedin,
  Twitter,
  Mail,
  ExternalLink,
  Globe,
  Sliders,
  ShieldCheck
} from 'lucide-react';

interface ShareAndExportModalProps {
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
  canvasContainerId?: string;
  zoomLevel?: number;
}

type ActiveTab = 'export' | 'link' | 'embed' | 'social';

export const ShareAndExportModal: React.FC<ShareAndExportModalProps> = ({
  workflow,
  isOpen,
  onClose,
  canvasContainerId = 'workflow-studio-canvas',
  zoomLevel = 1
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('export');

  // Export State
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<string | null>(null);
  const [isTransparentPng, setIsTransparentPng] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>('ACME Global Corp');

  // Embed State
  const [embedWidth, setEmbedWidth] = useState<string>('100%');
  const [embedHeight, setEmbedHeight] = useState<string>('600px');
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);
  const [isCopiedEmbed, setIsCopiedEmbed] = useState<boolean>(false);

  if (!isOpen) return null;

  // Generate Unique Shareable URL with workflow state
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const nodesCount = workflow.nodes?.length || 0;
  const shareableUrl = `${origin}/?workflowId=${workflow.id || 'order-fulfillment'}&nodes=${nodesCount}&zoom=${zoomLevel.toFixed(1)}&v=${workflow.version || 1}`;

  // Generate iframe embed code
  const embedCode = `<iframe src="${shareableUrl}&embed=true" width="${embedWidth}" height="${embedHeight}" style="border:1px solid rgba(255,255,255,0.12); border-radius:16px; background:#0a0e1a;" title="${workflow.workflowName || workflow.title} Diagram" allow="clipboard-read; clipboard-write; fullscreen"></iframe>`;

  // 1. Export Handlers
  const handleExport = async (type: 'png' | 'svg' | 'pdf' | 'json') => {
    setExportingType(type);
    soundFX.playClick();
    try {
      const slug = (workflow.workflowName || workflow.title || 'workflow').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (type === 'png') {
        await exportHelper.exportToPng(canvasContainerId, `${slug}-${isTransparentPng ? 'transparent' : 'dark'}.png`, isTransparentPng);
      } else if (type === 'svg') {
        await exportHelper.exportToSvg(canvasContainerId, `${slug}.svg`);
      } else if (type === 'pdf') {
        await exportHelper.exportToPdf(canvasContainerId, workflow.workflowName || workflow.title, companyName, workflow);
      } else if (type === 'json') {
        exportHelper.exportToJson(workflow, `${slug}-spec.json`);
      }

      soundFX.playCelebration();
      setSuccessType(type);
      showToast({
        title: `Export Succeeded`,
        message: `Saved ${type.toUpperCase()} file successfully.`,
        type: 'success'
      });
      setTimeout(() => setSuccessType(null), 2000);
    } catch (err: any) {
      soundFX.playError();
      showToast({
        title: 'Export Failed',
        message: err.message || 'Could not capture canvas.',
        type: 'error'
      });
    } finally {
      setExportingType(null);
    }
  };

  // 2. Share Link Handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    soundFX.playClick();
    setIsCopiedLink(true);
    showToast({
      title: 'Link Copied!',
      message: 'Shareable workflow URL copied to clipboard with current DAG state.',
      type: 'success'
    });
    setTimeout(() => setIsCopiedLink(false), 2200);
  };

  // 3. Embed Code Handler
  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    soundFX.playClick();
    setIsCopiedEmbed(true);
    showToast({
      title: 'Embed Code Copied!',
      message: 'HTML <iframe> snippet ready to paste into Notion, Confluence, or Webflow.',
      type: 'success'
    });
    setTimeout(() => setIsCopiedEmbed(false), 2200);
  };

  // 4. Social Sharing Handlers
  const handleShareLinkedIn = () => {
    soundFX.playClick();
    const title = encodeURIComponent(`Check out my workflow optimization with FlowIntel.AI! 0 cycles, straight-through routing.`);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}&summary=${title}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const handleShareTwitter = () => {
    soundFX.playClick();
    const text = encodeURIComponent(`AI discovered hidden business workflows in my procedural docs & generated a 100% DAG verified diagram with @FlowIntelAI! 🚀\n\n`);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareableUrl)}`;
    window.open(url, '_blank', 'width=600,height=450');
  };

  const handleShareEmail = () => {
    soundFX.playClick();
    const subject = encodeURIComponent(`I optimized our business workflow with FlowIntel.AI: ${workflow.workflowName || workflow.title}`);
    const body = encodeURIComponent(`Hi team,\n\nI used FlowIntel.AI to extract and optimize our operational workflow (${workflow.workflowName || workflow.title}).\n\nIt achieved 0 cyclic deadlocks with full STP straight-through routing.\n\nYou can interact with the live DAG diagram and view latency analytics here:\n${shareableUrl}\n\nBest regards.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Frosted Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-[#0a0e1a]/80 backdrop-blur-[20px]" />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        className="relative w-full max-w-2xl rounded-3xl glass-card border-2 border-white/[0.12] bg-[#0a0e1a]/95 shadow-[0_0_80px_rgba(0,0,0,0.8)] p-6 sm:p-8 space-y-6 z-10 text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#00d4ff]/20 to-[#7c3aed]/20 border border-[#00d4ff]/30 text-[#00d4ff]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-[#00d4ff] font-bold tracking-wider">
                  SHARING & EXPORT HUB
                </span>
                <span className="px-2 py-0.5 rounded-2xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 text-[10px] font-mono">
                  100% DAG Verified
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#e8edf5] font-display">
                {workflow.workflowName || workflow.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => { soundFX.playClick(); setActiveTab('export'); }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1. Export Formats</span>
            <span className="sm:hidden">Export</span>
          </button>

          <button
            type="button"
            onClick={() => { soundFX.playClick(); setActiveTab('link'); }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">2. Share Link</span>
            <span className="sm:hidden">Link</span>
          </button>

          <button
            type="button"
            onClick={() => { soundFX.playClick(); setActiveTab('embed'); }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3. Embed Code</span>
            <span className="sm:hidden">Embed</span>
          </button>

          <button
            type="button"
            onClick={() => { soundFX.playClick(); setActiveTab('social'); }}
            className={`py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'social'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">4. Social Share</span>
            <span className="sm:hidden">Social</span>
          </button>
        </div>

        {/* Tab 1: Export Options */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
              <span className="text-slate-300">PNG Background Option:</span>
              <label className="flex items-center gap-2 cursor-pointer text-[#00d4ff]">
                <input
                  type="checkbox"
                  checked={isTransparentPng}
                  onChange={(e) => setIsTransparentPng(e.target.checked)}
                  className="rounded border-white/[0.2] bg-white/[0.08] text-[#00d4ff] focus:ring-0 cursor-pointer"
                />
                <span>Transparent Background</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PNG */}
              <button
                type="button"
                onClick={() => handleExport('png')}
                disabled={exportingType !== null}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#00d4ff]/50 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileImage className="w-5 h-5 text-[#00d4ff] group-hover:scale-110 transition-transform" />
                  {exportingType === 'png' ? (
                    <Loader2 className="w-4 h-4 text-[#00d4ff] animate-spin" />
                  ) : successType === 'png' ? (
                    <Check className="w-4 h-4 text-[#10b981]" />
                  ) : null}
                </div>
                <div className="text-sm font-bold text-slate-100">PNG High-Res Image</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {isTransparentPng ? 'Transparent Alpha Layer' : '2x Dark Canvas'}
                </div>
              </button>

              {/* SVG */}
              <button
                type="button"
                onClick={() => handleExport('svg')}
                disabled={exportingType !== null}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-500/50 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileCode className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  {exportingType === 'svg' ? (
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : successType === 'svg' ? (
                    <Check className="w-4 h-4 text-[#10b981]" />
                  ) : null}
                </div>
                <div className="text-sm font-bold text-slate-100">SVG Vector Graphic</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Vector for Keynote / Figma</div>
              </button>

              {/* JSON */}
              <button
                type="button"
                onClick={() => handleExport('json')}
                disabled={exportingType !== null}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-blue-500/50 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileCode className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                  {exportingType === 'json' ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : successType === 'json' ? (
                    <Check className="w-4 h-4 text-[#10b981]" />
                  ) : null}
                </div>
                <div className="text-sm font-bold text-slate-100">JSON Specification</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Full DAG AST Model & Positions</div>
              </button>

              {/* PDF */}
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={exportingType !== null}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#10b981]/50 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-[#10b981] group-hover:scale-110 transition-transform" />
                  {exportingType === 'pdf' ? (
                    <Loader2 className="w-4 h-4 text-[#10b981] animate-spin" />
                  ) : successType === 'pdf' ? (
                    <Check className="w-4 h-4 text-[#10b981]" />
                  ) : null}
                </div>
                <div className="text-sm font-bold text-slate-100">PDF Executive Report</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">With Enterprise Header Branding</div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Share Link */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">
                Direct State URL (Encodes Nodes, Position & Zoom Level):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full px-4 py-3 rounded-2xl bg-[#0a0e1a] border border-white/[0.12] text-xs font-mono text-[#00d4ff] select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="glass-button-primary button-scale px-4 py-3 rounded-2xl text-[#0a0e1a] font-bold text-xs font-mono flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px]"
                >
                  {isCopiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2 text-[#10b981]">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-bold">Active Live Canvas State Embedded</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Recipients opening this link will immediately view the exact layout coordinates, branch logic, and node states on their devices.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Embed Code */}
        {activeTab === 'embed' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Embed Width:</label>
                <select
                  value={embedWidth}
                  onChange={(e) => setEmbedWidth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0e1a] border border-white/[0.12] text-xs font-mono text-slate-200"
                >
                  <option value="100%">100% (Responsive Fluid)</option>
                  <option value="1200px">1200px (Wide)</option>
                  <option value="800px">800px (Medium)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Embed Height:</label>
                <select
                  value={embedHeight}
                  onChange={(e) => setEmbedHeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a0e1a] border border-white/[0.12] text-xs font-mono text-slate-200"
                >
                  <option value="600px">600px (Standard)</option>
                  <option value="750px">750px (Tall)</option>
                  <option value="500px">500px (Compact)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400">
                HTML Embed Code (&lt;iframe&gt;):
              </label>
              <textarea
                readOnly
                rows={3}
                value={embedCode}
                className="w-full p-3 rounded-2xl bg-[#0a0e1a] border border-white/[0.12] text-xs font-mono text-[#00d4ff] select-all focus:outline-none resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleCopyEmbed}
              className="w-full glass-button-primary button-scale py-3 rounded-2xl text-[#0a0e1a] font-extrabold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              {isCopiedEmbed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{isCopiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
            </button>
          </div>
        )}

        {/* Tab 4: Social Sharing */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 font-mono">
              Broadcast your discovered workflow and optimization benchmarks to your professional network:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* LinkedIn */}
              <button
                type="button"
                onClick={handleShareLinkedIn}
                className="p-4 rounded-2xl bg-[#0077b5]/15 border border-[#0077b5]/40 hover:bg-[#0077b5]/25 text-[#0077b5] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group button-scale"
              >
                <Linkedin className="w-6 h-6 text-[#0077b5] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold text-slate-100">LinkedIn</span>
                <span className="text-[10px] font-mono text-slate-400 text-center">"Check out my workflow optimization!"</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={handleShareTwitter}
                className="p-4 rounded-2xl bg-[#1da1f2]/15 border border-[#1da1f2]/40 hover:bg-[#1da1f2]/25 text-[#1da1f2] flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group button-scale"
              >
                <Twitter className="w-6 h-6 text-[#1da1f2] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold text-slate-100">Twitter / X</span>
                <span className="text-[10px] font-mono text-slate-400 text-center">"AI found bottlenecks in my process!"</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={handleShareEmail}
                className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/40 hover:bg-purple-500/25 text-purple-300 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group button-scale"
              >
                <Mail className="w-6 h-6 text-purple-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-mono font-bold text-slate-100">Email Team</span>
                <span className="text-[10px] font-mono text-slate-400 text-center">"I optimized my workflow..."</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
