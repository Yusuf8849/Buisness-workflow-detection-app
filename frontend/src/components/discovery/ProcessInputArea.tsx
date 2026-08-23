import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Terminal, Database, Zap, Loader2, ArrowRight, CheckCircle2, Play, Cpu, RefreshCw, Layers } from 'lucide-react';
import { WorkflowTemplate } from '../../types/workflow';
import { INITIAL_DEMO_TEXT } from '../../services/mockData';

interface ProcessInputAreaProps {
  onAnalyze: (text: string, projectName: string) => Promise<void>;
  templates: WorkflowTemplate[];
  isAnalyzing: boolean;
  selectedProjectName: string;
  onProjectChange: (projectName: string) => void;
}

const TERMINAL_LOG_STEPS = [
  '► Ingesting business description into FlowIntel AST parser...',
  '► Resolving schemas from MongoDB collections (orders, invoices, asset_requests)...',
  '► Matching custom functions & candidate operations from project context...',
  '► Isolating conditional routing rules (e.g. stock_type == physical)...',
  '► Synthesizing DAG topology & calculating auto-layout coordinates...',
  '► Validating Directed Acyclic Graph — 0 cycles detected [100% DAG PASS]...',
  '► Workflow IR generated and ready for interactive canvas inspection.'
];

export const ProcessInputArea: React.FC<ProcessInputAreaProps> = ({
  onAnalyze,
  templates,
  isAnalyzing,
  selectedProjectName,
  onProjectChange
}) => {
  const [inputText, setInputText] = useState<string>(INITIAL_DEMO_TEXT);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('scenario-a-order-placed');
  
  // Terminal log streaming state
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [currentTypingLine, setCurrentTypingLine] = useState<string>('');
  const logIndexRef = useRef<number>(0);
  const typingTimerRef = useRef<any>(null);

  // Compute character and word count
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;

  // Stream terminal logs when analyzing
  useEffect(() => {
    if (isAnalyzing) {
      setVisibleLogs([]);
      setCurrentTypingLine('');
      logIndexRef.current = 0;

      const streamNextLog = () => {
        if (logIndexRef.current < TERMINAL_LOG_STEPS.length) {
          const fullLine = TERMINAL_LOG_STEPS[logIndexRef.current];
          let charIdx = 0;

          // Typewriter effect for each line
          const charInterval = setInterval(() => {
            charIdx += 2;
            if (charIdx <= fullLine.length) {
              setCurrentTypingLine(fullLine.substring(0, charIdx));
            } else {
              clearInterval(charInterval);
              setVisibleLogs((prev) => [...prev, fullLine]);
              setCurrentTypingLine('');
              logIndexRef.current += 1;
              typingTimerRef.current = setTimeout(streamNextLog, 220);
            }
          }, 14);
        }
      };

      streamNextLog();
    } else {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    }

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [isAnalyzing]);

  const handleTemplateSelect = (tpl: WorkflowTemplate) => {
    setSelectedTemplateId(tpl.id);
    setInputText(tpl.rawInput);
    if (tpl.projectName) {
      onProjectChange(tpl.projectName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAnalyze(inputText, selectedProjectName);
  };

  return (
    <div className="glass-card p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Top Banner & Project Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono backdrop-blur-[20px]">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
            <span className="font-bold tracking-wider">AI DISCOVERY HERO ENGINE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#e8edf5] tracking-tight font-display">
            Business Process Detection
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Paste natural language procedures. AI automatically discovers schemas, actions, conditions, and DAG topology.
          </p>
        </div>

        {/* MongoDB Project Context Selector */}
        <div className="flex items-center gap-2.5 bg-white/[0.05] border border-white/[0.08] p-3 rounded-2xl shrink-0 backdrop-blur-[20px]">
          <Database className="w-4 h-4 text-[#00d4ff] shrink-0 ml-1" />
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              MONGODB CONTEXT
            </span>
            <select
              value={selectedProjectName}
              onChange={(e) => onProjectChange(e.target.value)}
              className="bg-transparent text-xs font-mono text-[#00d4ff] font-bold outline-none cursor-pointer pr-2"
            >
              <option value="sample-flow" className="bg-[#0a0e1a] text-[#e8edf5]">
                sample-flow (E-Commerce)
              </option>
              <option value="enterprise-hr" className="bg-[#0a0e1a] text-[#e8edf5]">
                enterprise-hr (HR Provisioning)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Textarea Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Large Centered Text Area */}
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            placeholder="Paste your business workflow description here..."
            className="w-full p-5 sm:p-6 rounded-2xl bg-[#0a0e1a]/90 border border-white/[0.08] focus:border-[#00d4ff] focus:ring-4 focus:ring-[#00d4ff]/20 focus:shadow-[0_0_35px_rgba(0,212,255,0.35)] text-[#e8edf5] text-sm sm:text-base font-mono leading-relaxed transition-all duration-300 placeholder:text-slate-500 outline-none resize-y"
          />

          {/* Dynamic Character & Word Counter Chip */}
          <div className="absolute bottom-4 right-4 text-[11px] font-mono text-slate-300 bg-white/[0.06] backdrop-blur-[20px] px-3 py-1 rounded-2xl border border-white/[0.08] shadow-md pointer-events-none">
            <span className="text-[#00d4ff] font-bold">{charCount}</span> characters • <span className="text-[#38bdf8] font-bold">{wordCount}</span> words
          </div>
        </div>

        {/* Quick Scenario Buttons (Chips) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px]">
              QUICK TEST SCENARIOS (1-CLICK LOAD):
            </span>
            <span className="text-[#00d4ff] text-[10px]">Enterprise Spec</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {templates.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              const isScenarioA = tpl.id.includes('scenario-a');
              const isScenarioB = tpl.id.includes('scenario-b');

              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tpl)}
                  className={`px-4 py-2 rounded-2xl text-xs font-mono font-medium transition-all duration-200 border flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00d4ff]/20 border-[#00d4ff] text-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.3)] font-bold'
                      : 'bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-[#e8edf5] hover:border-white/[0.2] hover:bg-white/[0.07]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-[#00d4ff] animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span>
                    {isScenarioA ? 'Scenario A (E-Commerce Fulfillment)' : isScenarioB ? 'Scenario B (Asset Request)' : tpl.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls: Large AI DETECT Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00d4ff]" />
            <span>Resolves custom functions, schemas, operations & conditional DAGs</span>
          </div>

          {/* Large Breathing AI DETECT Button */}
          <button
            type="submit"
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#00d4ff] via-[#38bdf8] to-[#7c3aed] text-[#0a0e1a] font-extrabold text-sm sm:text-base font-mono tracking-wider uppercase shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:shadow-[0_0_45px_rgba(124,58,237,0.6)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#0a0e1a]" />
                <span>AI DETECTING & SYNTHESIZING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-current text-[#0a0e1a]" />
                <span>AI DETECT WORKFLOW</span>
                <ArrowRight className="w-5 h-5 text-[#0a0e1a]" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Terminal-Style Streaming Log Component */}
      <div className="rounded-2xl bg-[#050811]/95 border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-[20px]">
        {/* Terminal Window Top Bar */}
        <div className="px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]/80" />
            <span className="ml-2 text-[11px] font-mono text-slate-400 font-bold">
              flowintel-engine ~ nlp-stream.log
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span className={isAnalyzing ? 'text-[#00d4ff] font-bold animate-pulse' : 'text-slate-400'}>
              {isAnalyzing ? 'STREAMING ACTIVE' : 'ENGINE READY'}
            </span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed space-y-2 min-h-[140px] max-h-[220px] overflow-y-auto">
          {visibleLogs.length === 0 && !currentTypingLine && (
            <div className="text-slate-500 flex items-center gap-2 py-4">
              <span className="text-[#00d4ff] font-bold">►</span>
              <span>[STANDBY] Ready to ingest business requirement. Click "AI DETECT WORKFLOW" to stream execution AST.</span>
              <span className="inline-block w-2 h-4 bg-[#00d4ff] animate-pulse" />
            </div>
          )}

          {visibleLogs.map((log, index) => (
            <div key={index} className="text-[#00d4ff] flex items-start gap-2">
              <span className="text-slate-500 shrink-0">[{String(index + 1).padStart(2, '0')}]</span>
              <span className={log.includes('DAG PASS') ? 'text-[#10b981] font-bold' : 'text-[#e8edf5]'}>
                {log}
              </span>
            </div>
          ))}

          {currentTypingLine && (
            <div className="text-[#00d4ff] flex items-start gap-2">
              <span className="text-slate-500 shrink-0">[{String(visibleLogs.length + 1).padStart(2, '0')}]</span>
              <span className="text-[#e8edf5] font-semibold">{currentTypingLine}</span>
              <span className="inline-block w-2 h-3.5 bg-[#00d4ff] animate-pulse shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
