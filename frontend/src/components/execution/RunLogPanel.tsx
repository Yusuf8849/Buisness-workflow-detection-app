import React, { useState } from 'react';
import { WorkflowRun, StepResult } from '../../types/workflow';
import { CheckCircle2, XCircle, MinusCircle, Loader2, Clock, ChevronDown, ChevronRight, Terminal, Zap, ShieldCheck } from 'lucide-react';

interface RunLogPanelProps {
  run: WorkflowRun | null;
  isRunning?: boolean;
}

export const RunLogPanel: React.FC<RunLogPanelProps> = ({ run, isRunning }) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  if (!run) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-[20px] text-center space-y-2">
        <Terminal className="w-6 h-6 text-slate-500 mx-auto" />
        <h4 className="text-xs font-mono font-bold text-slate-300">No Execution Run Active</h4>
        <p className="text-[11px] font-mono text-slate-400">
          Click "Run Workflow" to execute the pipeline and stream live step outputs.
        </p>
      </div>
    );
  }

  const toggleExpand = (stepId: string) => {
    setExpandedStepId(expandedStepId === stepId ? null : stepId);
  };

  return (
    <div className="glass-card p-5 space-y-4 shadow-2xl">
      {/* Run Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00d4ff]" />
          <h3 className="text-xs font-mono font-bold text-[#e8edf5] uppercase tracking-wider font-display">
            WORKFLOW RUN LOG: <span className="text-[#00d4ff]">{run.id}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-[#00d4ff]" />
            <span>{run.totalDurationMs} ms</span>
          </div>

          <span
            className={`px-3 py-0.5 rounded-2xl font-bold uppercase text-[10px] ${
              run.status === 'success'
                ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                : run.status === 'running'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 animate-pulse'
                : 'bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/40'
            }`}
          >
            {run.status}
          </span>
        </div>
      </div>

      {/* Step Execution Timeline */}
      <div className="space-y-2 text-xs font-mono">
        {run.stepResults?.map((step, idx) => {
          const isExpanded = expandedStepId === step.stepId;
          const isSuccess = step.status === 'success';
          const isSkipped = step.status === 'skipped';
          const isFailed = step.status === 'failed';
          const isCurrentRunning = step.status === 'running';

          return (
            <div
              key={step.stepId || idx}
              className={`rounded-2xl border transition-all ${
                isSuccess
                  ? 'bg-white/[0.04] border-white/[0.08]'
                  : isSkipped
                  ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 opacity-80'
                  : isFailed
                  ? 'bg-[#f43f5e]/15 border-[#f43f5e]/40'
                  : isCurrentRunning
                  ? 'bg-[#00d4ff]/15 border-[#00d4ff]/50 shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                  : 'bg-white/[0.02] border-white/[0.06]'
              }`}
            >
              {/* Row Bar */}
              <div
                onClick={() => toggleExpand(step.stepId)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0" />
                  ) : isSkipped ? (
                    <MinusCircle className="w-4 h-4 text-[#f59e0b] shrink-0" />
                  ) : isFailed ? (
                    <XCircle className="w-4 h-4 text-[#f43f5e] shrink-0" />
                  ) : isCurrentRunning ? (
                    <Loader2 className="w-4 h-4 text-[#00d4ff] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400">{step.stepId}</span>
                    <span className="font-bold text-[#e8edf5] font-display">{step.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase">({step.actionType})</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-300">{step.durationMs} ms</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-2xl ${
                      isSuccess
                        ? 'text-[#10b981] bg-[#10b981]/15'
                        : isSkipped
                        ? 'text-[#f59e0b] bg-[#f59e0b]/15'
                        : isFailed
                        ? 'text-[#f43f5e] bg-[#f43f5e]/15'
                        : 'text-slate-300 bg-white/[0.05]'
                    }`}
                  >
                    {step.status.toUpperCase()}
                  </span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              {/* Expandable JSON Output Inspector */}
              {isExpanded && (
                <div className="p-3.5 border-t border-white/[0.08] bg-[#0a0e1a]/90 text-[11px] space-y-2 rounded-b-2xl">
                  {step.input && (
                    <div>
                      <span className="text-[#00d4ff] font-bold">Resolved Input Payload:</span>
                      <pre className="mt-1 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto text-slate-300">
                        {JSON.stringify(step.input, null, 2)}
                      </pre>
                    </div>
                  )}

                  {step.output && (
                    <div>
                      <span className="text-[#10b981] font-bold">Step Output / Execution Artifact:</span>
                      <pre className="mt-1 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto text-slate-300">
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    </div>
                  )}

                  {step.error && (
                    <div className="text-[#f43f5e] font-bold">
                      Error: {step.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
