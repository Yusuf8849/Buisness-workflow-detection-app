import React, { useState, useEffect } from 'react';
import { Workflow } from '../../types/workflow';
import { X, Play, Zap, ShieldCheck, Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface TriggerPanelModalProps {
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
  onRunWorkflow: (payload: Record<string, any>, dryRun: boolean) => Promise<void>;
  isRunning: boolean;
}

export const TriggerPanelModal: React.FC<TriggerPanelModalProps> = ({
  workflow,
  isOpen,
  onClose,
  onRunWorkflow,
  isRunning
}) => {
  if (!isOpen) return null;

  const schema = workflow.triggerEvent?.schema || 'orders';

  // Dynamic state generator based on schema
  const getDefaultPayload = () => {
    if (schema === 'orders') {
      return {
        orderId: 'ORD-2026-9812',
        vendorId: 'VEND-8821',
        totalAmount: 499.50,
        stock_type: 'physical',
        customerEmail: 'alex.buyer@enterprise.com'
      };
    } else if (schema === 'asset_requests') {
      return {
        requestId: 'REQ-ASSET-402',
        assetType: 'MacBook Pro M3 Max',
        approver_response: 'approved',
        employeeId: 'EMP-7712'
      };
    } else {
      return {
        id: `rec_${Date.now()}`,
        status: 'active',
        priority: 'high'
      };
    }
  };

  const [payload, setPayload] = useState<Record<string, any>>(getDefaultPayload());

  useEffect(() => {
    setPayload(getDefaultPayload());
  }, [workflow.id, schema]);

  const handleChange = (key: string, value: any) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const handleExecute = (dryRun: boolean) => {
    onRunWorkflow(payload, dryRun);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e1a]/85 backdrop-blur-[20px]">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.08] shadow-[0_0_50px_rgba(0,212,255,0.2)] p-6 sm:p-8 space-y-6 backdrop-blur-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#00d4ff] font-bold">WORKFLOW EXECUTOR</span>
              <h3 className="text-base font-bold text-[#e8edf5] font-display">
                Trigger {workflow.workflowName || workflow.title}
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

        {/* Trigger Event Header Pill */}
        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300">Trigger Event:</span>
          <span className="font-bold text-[#00d4ff]">
            {workflow.triggerEvent?.type} ({schema})
          </span>
        </div>

        {/* Dynamically Generated Form Fields */}
        <div className="space-y-3.5 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <span>Trigger Payload Input Fields:</span>
            <button
              type="button"
              onClick={() => setPayload(getDefaultPayload())}
              className="text-[#00d4ff] hover:underline flex items-center gap-1 normal-case cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset Sample Data
            </button>
          </div>

          {Object.entries(payload).map(([key, val]) => (
            <div key={key}>
              <label className="block text-slate-300 mb-1 font-medium">{key}</label>
              {key === 'stock_type' ? (
                <select
                  value={val}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-mono outline-none cursor-pointer"
                >
                  <option value="physical">physical (Condition TRUE → Executes Step 3)</option>
                  <option value="digital">digital (Condition FALSE → Skips Step 3)</option>
                </select>
              ) : key === 'approver_response' ? (
                <select
                  value={val}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-mono outline-none cursor-pointer"
                >
                  <option value="approved">approved (Branches to Step 3 & 4)</option>
                  <option value="rejected">rejected (Branches to Step 5 Reject & Notify)</option>
                </select>
              ) : (
                <input
                  type={typeof val === 'number' ? 'number' : 'text'}
                  value={val}
                  onChange={(e) => handleChange(key, typeof val === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-mono outline-none"
                />
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
          {/* Dry Run Button */}
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleExecute(true)}
            className="w-full sm:w-auto glass-card-interactive px-4 py-2.5 rounded-2xl text-slate-300 font-mono text-xs hover:text-[#00d4ff] disabled:opacity-50 transition-colors cursor-pointer"
          >
            Dry Run (Simulation)
          </button>

          {/* Live Run Button */}
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleExecute(false)}
            className="w-full sm:w-auto glass-button-primary px-6 py-2.5 rounded-2xl text-[#0a0e1a] font-extrabold text-xs font-mono disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Steps...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Run Workflow (POST /workflow/trigger)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
