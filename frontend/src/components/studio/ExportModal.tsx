import React, { useState } from 'react';
import { Workflow } from '../../types/workflow';
import { exportHelper } from '../../utils/exportHelper';
import { X, Download, FileImage, FileCode, FileText, Check, Loader2 } from 'lucide-react';

interface ExportModalProps {
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
  canvasContainerId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  workflow,
  isOpen,
  onClose,
  canvasContainerId = 'workflow-studio-canvas'
}) => {
  if (!isOpen) return null;

  const [exportingType, setExportingType] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<string | null>(null);

  const handleExport = async (type: 'png' | 'svg' | 'pdf' | 'json') => {
    setExportingType(type);
    try {
      if (type === 'png') {
        await exportHelper.exportToPng(canvasContainerId, `${workflow.title.toLowerCase().replace(/\s+/g, '-')}.png`);
      } else if (type === 'svg') {
        await exportHelper.exportToSvg(canvasContainerId, `${workflow.title.toLowerCase().replace(/\s+/g, '-')}.svg`);
      } else if (type === 'pdf') {
        await exportHelper.exportToPdf(canvasContainerId, workflow.title);
      } else if (type === 'json') {
        exportHelper.exportToJson(workflow, `${workflow.title.toLowerCase().replace(/\s+/g, '-')}.json`);
      }

      setSuccessType(type);
      setTimeout(() => setSuccessType(null), 1500);
    } catch (err: any) {
      console.error('Export error:', err);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">EXPORT WORKFLOW</span>
              <h3 className="text-base font-bold text-slate-100">{workflow.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* PNG */}
          <button
            onClick={() => handleExport('png')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-cyan-500/50 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileImage className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              {exportingType === 'png' ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : successType === 'png' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : null}
            </div>
            <div className="text-sm font-bold text-slate-200">PNG Image</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">High-DPI 2x Raster</div>
          </button>

          {/* SVG */}
          <button
            onClick={() => handleExport('svg')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-purple-500/50 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              {exportingType === 'svg' ? (
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              ) : successType === 'svg' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : null}
            </div>
            <div className="text-sm font-bold text-slate-200">SVG Vector</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Infinite Resolution</div>
          </button>

          {/* PDF */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              {exportingType === 'pdf' ? (
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              ) : successType === 'pdf' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : null}
            </div>
            <div className="text-sm font-bold text-slate-200">PDF Report</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Executive Presentation</div>
          </button>

          {/* JSON */}
          <button
            onClick={() => handleExport('json')}
            disabled={exportingType !== null}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-blue-500/50 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileCode className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              {exportingType === 'json' ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : successType === 'json' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : null}
            </div>
            <div className="text-sm font-bold text-slate-200">JSON Spec</div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">BPMN / DAG Schema</div>
          </button>
        </div>

        <div className="pt-2 text-center text-xs font-mono text-slate-500">
          Exports are generated client-side with complete metadata.
        </div>
      </div>
    </div>
  );
};
