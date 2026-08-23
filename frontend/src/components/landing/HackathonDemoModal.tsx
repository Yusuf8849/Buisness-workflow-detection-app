import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Cpu,
  Layers,
  ArrowRight,
  ArrowLeft,
  Zap,
  GitBranch,
  Clock,
  Check,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Activity,
  Download,
  Share2,
  Twitter,
  Linkedin,
  FileText,
  Image,
  Code2,
  Volume2,
  VolumeX,
  Loader2,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../../utils/audioEffects';

interface HackathonDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

interface TourStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  narratorText: string;
  targetBadge: string;
  tooltipText: string;
  durationSeconds: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: 'Ingesting Messy Business Description',
    subtitle: 'Standard enterprise procedure written in informal, unstructured prose.',
    narratorText: '🧠 Watch as I analyze your business process... isolating actors, actions, and conditional gate branches from raw SOP prose.',
    targetBadge: 'HERO NLP INGESTION',
    tooltipText: 'The AI AST parser ingests messy natural language and isolates operations, stakeholders, and conditional routing.',
    durationSeconds: 16
  },
  {
    stepNumber: 2,
    title: 'AI Discovery State: Synthesizing Topology...',
    subtitle: 'Extracting candidate schemas from MongoDB and calculating Directed Acyclic Graph coordinates.',
    narratorText: '⚡ Found 4 hidden bottlenecks & 12 schema relationships! Synthesizing DAG graph coordinates with 0 cyclic deadlocks...',
    targetBadge: 'NEURAL TOPOLOGY ENGINE',
    tooltipText: 'Resolving database collections (orders, invoices, asset_requests) and synthesizing DAG hierarchy with 0 cycles.',
    durationSeconds: 18
  },
  {
    stepNumber: 3,
    title: 'Workflow Successfully Reconstructed',
    subtitle: '17 Steps • 6 Actors • 4 Decision Gates • 21 Links • 100% DAG Verified.',
    narratorText: '✨ Optimizing workflow for maximum efficiency! Reconstructed straight-through paths with a verified 94% cycle reduction.',
    targetBadge: 'AUTOMATION PIPELINE CERTIFIED',
    tooltipText: 'All business logic validated against project schemas with automatic straight-through processing fallback.',
    durationSeconds: 16
  },
  {
    stepNumber: 4,
    title: 'Ready for Production',
    subtitle: 'Interactive DAG Studio ready for simulation, versioning, and live dynamic execution.',
    narratorText: '🚀 Production DAG deployed! You can now execute live parameterized dry-runs, collaborate with AI agents, or export compliance packages.',
    targetBadge: 'WORKFLOW STUDIO CANVAS',
    tooltipText: 'Fully executable DAG deployed to MongoDB and ready for dynamic parameter mapping and live dry-runs.',
    durationSeconds: 18
  }
];

interface ExplodedNodeData {
  id: string;
  name: string;
  role: string;
  type: string;
  schema: string;
  upstream: string[];
  downstream: string[];
  latency: string;
  optimization: string;
}

const DEMO_HOTSPOTS: Record<string, ExplodedNodeData> = {
  'intake': {
    id: 'step-001',
    name: 'Customer Application Intake',
    role: 'Customer Applicant',
    type: 'Action / Ingestion',
    schema: 'orders (Customer Intake)',
    upstream: ['User Form Submission'],
    downstream: ['Document Verification Desk'],
    latency: '1.8 hrs (Human) → 0.15 hrs (AI)',
    optimization: 'Direct API ingestion with live format schema validation'
  },
  'kyc': {
    id: 'step-002',
    name: 'KYC & Identity Verification',
    role: 'Operations Desk',
    type: 'Decision / Verification',
    schema: 'invoices (ID & Tax Records)',
    upstream: ['Customer Application Intake'],
    downstream: ['Credit Risk Scoring', 'SMS Exception Loop'],
    latency: '4.5 hrs (Queue) → 0.20 hrs (OCR)',
    optimization: 'Automated AI OCR document extraction with 98% STP confidence'
  },
  'risk': {
    id: 'step-003',
    name: 'Credit Risk Scoring Engine',
    role: 'Underwriting System',
    type: 'Action / Computation',
    schema: 'asset_requests (Risk Evaluation)',
    upstream: ['KYC & Identity Verification'],
    downstream: ['Manager Sign-off Gate'],
    latency: '2.6 hrs → 0.30 hrs',
    optimization: 'Real-time score calculation API with instant credit bureau lookup'
  },
  'approval': {
    id: 'step-004',
    name: 'Executive Sign-Off Gate',
    role: 'Finance Desk Manager',
    type: 'Decision Gate (Score > 650)',
    schema: 'workflow_runs (Approval Log)',
    upstream: ['Credit Risk Scoring Engine'],
    downstream: ['Wire Disbursement API', 'Risk Committee Review'],
    latency: '3.8 hrs → 0.25 hrs',
    optimization: 'Conditional auto-approval straight-through rule for score > 650'
  },
  'disburse': {
    id: 'step-005',
    name: 'Automated Wire Disbursement',
    role: 'Core Banking API',
    type: 'Action / STP Execution',
    schema: 'orders (Disbursement Receipt)',
    upstream: ['Executive Sign-Off Gate'],
    downstream: ['Process Completed (End)'],
    latency: '1.5 hrs → 0.10 hrs',
    optimization: 'Straight-Through ACH / Fedwire automated settlement'
  }
};

export const HackathonDemoModal: React.FC<HackathonDemoModalProps> = ({
  isOpen,
  onClose,
  onOpenStudio
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0);
  const [typedText, setTypedText] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<ExplodedNodeData | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const currentStep = TOUR_STEPS[currentStepIdx];
  const totalTourDuration = 68;

  // Sound trigger wrapper
  const triggerAudio = (fn: () => void) => {
    if (soundEnabled) {
      fn();
    }
  };

  // Step 1: Typewriter effect for messy business description
  useEffect(() => {
    if (!isOpen) return;

    if (currentStepIdx === 0) {
      const fullText = "Customer submits loan application along with KYC documents and tax records. Operations Team verifies document authenticity. If documents are incomplete, customer is contacted immediately via SMS. Otherwise, application routes to Underwriting for real-time credit scoring. If credit score > 650, Manager approves wire disbursement; otherwise routes to Senior Risk Committee for exception review.";
      setTypedText('');
      let idx = 0;
      const typeSpeed = 20 / playbackSpeed;

      const typeInterval = setInterval(() => {
        if (idx < fullText.length) {
          setTypedText(fullText.substring(0, idx + 1));
          idx++;
        } else {
          clearInterval(typeInterval);
        }
      }, typeSpeed);

      return () => clearInterval(typeInterval);
    }
  }, [isOpen, currentStepIdx, playbackSpeed]);

  // Trigger celebration sounds & confetti on Step 3
  useEffect(() => {
    if (isOpen && currentStepIdx === 2) {
      triggerAudio(() => soundFX.playSuccessChord());
      setTimeout(() => triggerAudio(() => soundFX.playChime()), 300);

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#00d4ff', '#10b981', '#7c3aed', '#f59e0b']
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00d4ff', '#10b981']
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#7c3aed', '#00d4ff']
          });
        }, 400);
      } catch (e) {}
    } else if (isOpen) {
      triggerAudio(() => soundFX.playWhoosh());
    }
  }, [isOpen, currentStepIdx]);

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const intervalMs = 100;
    const stepDurationMs = (currentStep.durationSeconds * 1000) / playbackSpeed;
    const totalTicks = stepDurationMs / intervalMs;
    let currentTick = 0;

    const timer = setInterval(() => {
      currentTick += 1;
      const pct = (currentTick / totalTicks) * 100;
      setProgress(pct);

      if (currentTick >= totalTicks) {
        if (currentStepIdx < TOUR_STEPS.length - 1) {
          setCurrentStepIdx(prev => prev + 1);
          setProgress(0);
        } else {
          setIsPlaying(false);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, currentStepIdx, currentStep.durationSeconds, playbackSpeed]);

  if (!isOpen) return null;

  const handleNext = () => {
    triggerAudio(() => soundFX.playClick());
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    triggerAudio(() => soundFX.playClick());
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleSkipToReveal = () => {
    triggerAudio(() => soundFX.playClick());
    setCurrentStepIdx(TOUR_STEPS.length - 1);
    setProgress(100);
    setIsPlaying(false);
  };

  const handleRestart = () => {
    triggerAudio(() => soundFX.playClick());
    setCurrentStepIdx(0);
    setProgress(0);
    setIsPlaying(true);
  };

  // 4. One-Click Export Handler
  const handleExportDownload = (format: 'PDF' | 'PNG' | 'JSON') => {
    triggerAudio(() => soundFX.playClick());
    setDownloadingFormat(format);

    setTimeout(() => {
      triggerAudio(() => soundFX.playChime());
      setDownloadingFormat(null);
      setDownloadSuccess(format);

      // Create synthetic download file for demo
      const blob = new Blob([JSON.stringify(DEMO_HOTSPOTS, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FlowIntel_Workflow_Spec.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 900);
  };

  // Social share helpers
  const shareOnTwitter = () => {
    triggerAudio(() => soundFX.playClick());
    const text = encodeURIComponent("Just discovered hidden business workflows and synthesized 0-cycle DAG diagrams in seconds with FlowIntel AI! 🚀 #AI #Workflow #ProcessIntelligence");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=https://flowintel.ai`, '_blank');
  };

  const shareOnLinkedIn = () => {
    triggerAudio(() => soundFX.playClick());
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=https://flowintel.ai', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0a0e1a]/90 backdrop-blur-[24px]">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.08] shadow-[0_0_80px_rgba(0,212,255,0.25)] overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-[20px] animate-node-pop">
        {/* Top Header Bar with J.A.R.V.I.S. Audio Toggle & 68s Walkthrough Indicator */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30 shadow-[0_0_15px_rgba(0,212,255,0.3)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[#00d4ff] uppercase tracking-wider">
                  J.A.R.V.I.S. GUIDED TOUR • STEP 0{currentStep.stepNumber} OF 04
                </span>
                <span className="px-2.5 py-0.5 rounded-2xl bg-[#00d4ff]/15 text-[#00d4ff] text-[10px] font-mono font-bold border border-[#00d4ff]/30">
                  {totalTourDuration}s WALKTHROUGH
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#e8edf5] font-display">
                {currentStep.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-[#00d4ff] transition-all cursor-pointer"
              title={soundEnabled ? 'Mute J.A.R.V.I.S. Sound FX' : 'Enable J.A.R.V.I.S. Sound FX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00d4ff]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. J.A.R.V.I.S. Narrator Voice Banner */}
        <div className="px-6 py-3 bg-[#00d4ff]/10 border-b border-[#00d4ff]/20 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#00d4ff]/20 border border-[#00d4ff] flex items-center justify-center text-[#00d4ff] shrink-0 shadow-[0_0_10px_rgba(0,212,255,0.4)]">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
          </div>
          <p className="text-xs font-mono font-semibold text-[#00d4ff] truncate">
            {currentStep.narratorText}
          </p>
        </div>

        {/* Global Walkthrough Top Progress Bar */}
        <div className="w-full bg-[#0a0e1a] h-2 overflow-hidden flex">
          {TOUR_STEPS.map((s, idx) => {
            const isPassed = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={idx} className="flex-1 h-full bg-white/[0.05] relative border-r border-[#0a0e1a]">
                <div
                  className={`h-full transition-all duration-100 ${
                    isPassed
                      ? 'w-full bg-[#10b981]'
                      : isCurrent
                      ? 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]'
                      : 'w-0'
                  }`}
                  style={{ width: isCurrent ? `${progress}%` : isPassed ? '100%' : '0%' }}
                />
              </div>
            );
          })}
        </div>

        {/* Center Stage with Highlighted UI Element & Interactive Hotspots */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto min-h-[380px] flex flex-col justify-center space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Ingesting Messy Business Description */}
            {currentStepIdx === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 relative"
              >
                {/* Highlighted UI Target Element */}
                <div className="relative rounded-2xl p-5 bg-[#0a0e1a] border-2 border-[#00d4ff] shadow-[0_0_35px_rgba(0,212,255,0.35)] ring-4 ring-[#00d4ff]/20">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-3 text-xs font-mono text-slate-400">
                    <span className="text-[#00d4ff] font-bold">► INPUT PROSE BUFFER (NLP STREAM)</span>
                    <span className="text-slate-300">Live Typewriter</span>
                  </div>

                  <p className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed min-h-[90px]">
                    {typedText}
                    <span className="inline-block w-2 h-4 bg-[#00d4ff] ml-1 animate-pulse" />
                  </p>
                </div>

                {/* Tooltip Bubble with Pointer Arrow */}
                <div className="relative p-4 rounded-2xl bg-white/[0.06] border border-[#00d4ff]/50 shadow-[0_0_25px_rgba(0,212,255,0.2)] backdrop-blur-[20px] text-xs font-mono text-slate-300 space-y-1">
                  <div className="flex items-center gap-2 text-[#00d4ff] font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>AI PARSER DISCOVERY</span>
                  </div>
                  <p>{currentStep.tooltipText}</p>
                </div>
              </motion.div>
            )}

            {/* Step 2: AI Discovery State: Synthesizing Topology (With Interactive Hotspots) */}
            {currentStepIdx === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Highlighted UI Target: Topology Synthesis */}
                <div className="relative rounded-2xl p-6 bg-white/[0.04] border-2 border-[#7c3aed] shadow-[0_0_35px_rgba(124,58,237,0.35)] ring-4 ring-[#7c3aed]/20 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-purple-300 font-bold">
                      <Cpu className="w-4 h-4 text-[#7c3aed] animate-spin" />
                      <span>SYNTHESIZING DAG GRAPH TOPOLOGY • CLICK ANY NODE TO EXPLODE</span>
                    </div>
                    <span className="text-[#00d4ff] font-mono font-bold">0 CYCLES DETECTED</span>
                  </div>

                  {/* 2. Interactive Hotspots: Clickable Nodes that Explode into Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
                    <button
                      type="button"
                      onClick={() => {
                        triggerAudio(() => soundFX.playClick());
                        setSelectedHotspot(DEMO_HOTSPOTS['intake']);
                      }}
                      className="p-3 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/40 text-[#00d4ff] hover:scale-105 hover:bg-[#00d4ff]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                    >
                      <div className="font-bold">orders (Intake)</div>
                      <div className="text-[10px] text-slate-400">Click to Inspect 🔍</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerAudio(() => soundFX.playClick());
                        setSelectedHotspot(DEMO_HOTSPOTS['kyc']);
                      }}
                      className="p-3 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/40 text-[#10b981] hover:scale-105 hover:bg-[#10b981]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    >
                      <div className="font-bold">VerifyKYC()</div>
                      <div className="text-[10px] text-slate-400">Click to Inspect 🔍</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerAudio(() => soundFX.playClick());
                        setSelectedHotspot(DEMO_HOTSPOTS['approval']);
                      }}
                      className="p-3 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/40 text-[#f59e0b] hover:scale-105 hover:bg-[#f59e0b]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      <div className="font-bold">Score &gt; 650</div>
                      <div className="text-[10px] text-slate-400">Click to Inspect 🔍</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerAudio(() => soundFX.playClick());
                        setSelectedHotspot(DEMO_HOTSPOTS['disburse']);
                      }}
                      className="p-3 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/40 text-purple-300 hover:scale-105 hover:bg-[#7c3aed]/20 transition-all cursor-pointer shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                    >
                      <div className="font-bold">DisburseWire</div>
                      <div className="text-[10px] text-slate-400">Click to Inspect 🔍</div>
                    </button>
                  </div>
                </div>

                {/* Tooltip Bubble with Pointer Arrow */}
                <div className="relative p-4 rounded-2xl bg-white/[0.06] border border-[#7c3aed]/50 shadow-[0_0_25px_rgba(124,58,237,0.2)] backdrop-blur-[20px] text-xs font-mono text-slate-300 space-y-1">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Activity className="w-4 h-4 text-[#7c3aed]" />
                    <span>GRAPH SYNTHESIS ENGINE</span>
                  </div>
                  <p>{currentStep.tooltipText}</p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Workflow Successfully Reconstructed (3. Magic Moment Celebration) */}
            {currentStepIdx === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5 text-center"
              >
                {/* Highlighted UI Target: Celebration Certificate */}
                <div className="relative rounded-2xl p-6 bg-gradient-to-b from-[#10b981]/15 via-[#10b981]/5 to-transparent border-2 border-[#10b981] shadow-[0_0_55px_rgba(16,185,129,0.45)] ring-4 ring-[#10b981]/20 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#10b981]/20 border border-[#10b981] text-[#10b981] font-mono text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    <span>✨ MAGIC MOMENT: PROCESS RECONSTRUCTED & OPTIMIZED</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#e8edf5] font-display">
                    100% DAG Topology Verified (0 Cycles)
                  </h3>

                  {/* Metric Chips Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/40 text-[#00d4ff]">
                      <div className="text-xl font-bold">17 Steps</div>
                      <div className="text-[10px] text-slate-400">Action Nodes</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/40 text-[#38bdf8]">
                      <div className="text-xl font-bold">6 Actors</div>
                      <div className="text-[10px] text-slate-400">Department Roles</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/40 text-[#f59e0b]">
                      <div className="text-xl font-bold">4 Decisions</div>
                      <div className="text-[10px] text-slate-400">Diamond Gates</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/40 text-[#10b981]">
                      <div className="text-xl font-bold">-94% Latency</div>
                      <div className="text-[10px] text-slate-400">STP Savings</div>
                    </div>
                  </div>
                </div>

                {/* Tooltip Bubble */}
                <div className="relative p-4 rounded-2xl bg-white/[0.06] border border-[#10b981]/50 shadow-[0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-[20px] text-xs font-mono text-slate-300 space-y-1 text-left">
                  <div className="flex items-center gap-2 text-[#10b981] font-bold">
                    <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                    <span>PRODUCTION RECONSTRUCTION CERTIFICATE</span>
                  </div>
                  <p>{currentStep.tooltipText}</p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Ready for Production & 4. One-Click Export & Sharing */}
            {currentStepIdx === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-center"
              >
                {/* Highlighted UI Target: Final DAG Studio & Export Panel */}
                <div className="relative rounded-2xl p-6 bg-white/[0.04] border-2 border-[#00d4ff] shadow-[0_0_40px_rgba(0,212,255,0.35)] ring-4 ring-[#00d4ff]/20 space-y-5">
                  <div className="flex items-center justify-between text-xs font-mono border-b border-white/[0.08] pb-3">
                    <span className="text-[#00d4ff] font-bold">INTERACTIVE WORKFLOW STUDIO & EXPORT HUB</span>
                    <span className="text-[#10b981] font-bold">STP Execution Ready</span>
                  </div>

                  {/* 4. One-Click Export Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleExportDownload('PDF')}
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:border-[#00d4ff] flex items-center justify-center gap-2 text-slate-200 hover:text-[#00d4ff] transition-all cursor-pointer"
                    >
                      {downloadingFormat === 'PDF' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#00d4ff]" />
                      ) : downloadSuccess === 'PDF' ? (
                        <Check className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <FileText className="w-4 h-4 text-[#00d4ff]" />
                      )}
                      <span>{downloadingFormat === 'PDF' ? 'Generating...' : downloadSuccess === 'PDF' ? 'Downloaded!' : 'Export PDF Report'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportDownload('PNG')}
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:border-[#10b981] flex items-center justify-center gap-2 text-slate-200 hover:text-[#10b981] transition-all cursor-pointer"
                    >
                      {downloadingFormat === 'PNG' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#10b981]" />
                      ) : downloadSuccess === 'PNG' ? (
                        <Check className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <Image className="w-4 h-4 text-[#10b981]" />
                      )}
                      <span>{downloadingFormat === 'PNG' ? 'Rendering...' : downloadSuccess === 'PNG' ? 'Downloaded!' : 'Export PNG Diagram'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportDownload('JSON')}
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:border-[#7c3aed] flex items-center justify-center gap-2 text-slate-200 hover:text-purple-300 transition-all cursor-pointer"
                    >
                      {downloadingFormat === 'JSON' ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                      ) : downloadSuccess === 'JSON' ? (
                        <Check className="w-4 h-4 text-[#10b981]" />
                      ) : (
                        <Code2 className="w-4 h-4 text-[#7c3aed]" />
                      )}
                      <span>{downloadingFormat === 'JSON' ? 'Packaging...' : downloadSuccess === 'JSON' ? 'Downloaded!' : 'Export JSON Spec'}</span>
                    </button>
                  </div>

                  {/* 4. Social Sharing Row (LinkedIn & Twitter) */}
                  <div className="pt-1 flex items-center justify-center gap-3">
                    <span className="text-xs font-mono text-slate-400">Share Results:</span>
                    <button
                      type="button"
                      onClick={shareOnTwitter}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#00d4ff] text-slate-300 hover:text-[#00d4ff] text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                      <span>Post on X / Twitter</span>
                    </button>
                    <button
                      type="button"
                      onClick={shareOnLinkedIn}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#3b82f6] text-slate-300 hover:text-[#3b82f6] text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>Share on LinkedIn</span>
                    </button>
                  </div>

                  {/* Open Studio Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        triggerAudio(() => soundFX.playClick());
                        onClose();
                        if (onOpenStudio) onOpenStudio();
                      }}
                      className="glass-button-primary px-8 py-3.5 rounded-2xl text-[#0a0e1a] font-extrabold text-sm flex items-center gap-2 mx-auto cursor-pointer shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:scale-105 transition-all"
                    >
                      <span>Open in Interactive Workflow Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. Hotspot Exploded Node Detail Modal Overlay */}
        {selectedHotspot && (
          <div className="absolute inset-0 z-40 bg-[#0a0e1a]/90 backdrop-blur-[24px] p-6 flex items-center justify-center animate-node-pop">
            <div className="w-full max-w-lg rounded-2xl bg-[#0a0e1a]/95 border border-[#00d4ff]/50 shadow-[0_0_50px_rgba(0,212,255,0.3)] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#00d4ff] font-bold uppercase">{selectedHotspot.id} • {selectedHotspot.type}</span>
                  <h4 className="text-base font-bold text-[#e8edf5] font-display">{selectedHotspot.name}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedHotspot(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400">Assigned Actor: </span>
                  <span className="text-[#00d4ff] font-bold">{selectedHotspot.role}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400">Target Schema: </span>
                  <span className="text-purple-300 font-bold">{selectedHotspot.schema}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-slate-400">Latency Delta: </span>
                  <span className="text-[#10b981] font-bold">{selectedHotspot.latency}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 text-emerald-200">
                  <span className="font-bold">✨ AI STP Optimization: </span>
                  <span>{selectedHotspot.optimization}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] text-slate-400">Upstream:</div>
                    <div className="text-[#00d4ff] text-[11px] truncate">{selectedHotspot.upstream.join(', ')}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] text-slate-400">Downstream:</div>
                    <div className="text-[#10b981] text-[11px] truncate">{selectedHotspot.downstream.join(', ')}</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHotspot(null)}
                className="w-full py-2 rounded-xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 text-[#00d4ff] font-mono text-xs font-bold hover:bg-[#00d4ff]/30 cursor-pointer"
              >
                Close Hotspot Inspector
              </button>
            </div>
          </div>
        )}

        {/* Bottom Control Bar with Play/Pause, Speed Controls, and Step Navigation */}
        <div className="p-5 border-t border-white/[0.08] bg-white/[0.03] flex flex-wrap items-center justify-between gap-4">
          {/* Left: Play/Pause & Speed Selector */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                triggerAudio(() => soundFX.playClick());
                setIsPlaying(!isPlaying);
              }}
              className="px-4 py-2 rounded-2xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 text-[#00d4ff] text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[#00d4ff]/30 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            {/* Speed Selector (1x, 1.5x, 2x) */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
              {[1.0, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => {
                    triggerAudio(() => soundFX.playClick());
                    setPlaybackSpeed(spd);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="glass-card-interactive p-2 rounded-2xl text-slate-300 text-xs transition-colors cursor-pointer"
              title="Restart Guided Tour"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center: Step Dots Indicator */}
          <div className="flex items-center gap-2">
            {TOUR_STEPS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  triggerAudio(() => soundFX.playClick());
                  setCurrentStepIdx(i);
                  setProgress(0);
                }}
                className={`transition-all cursor-pointer flex items-center justify-center ${
                  i === currentStepIdx
                    ? 'w-7 h-2.5 bg-[#00d4ff] rounded-full shadow-[0_0_10px_rgba(0,212,255,0.6)]'
                    : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-600 rounded-full'
                }`}
                title={`Step ${s.stepNumber}: ${s.title}`}
              />
            ))}
          </div>

          {/* Right: Step Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentStepIdx === 0}
              onClick={handlePrev}
              className="glass-card-interactive px-3.5 py-1.5 rounded-2xl text-slate-300 text-xs font-mono disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              type="button"
              disabled={currentStepIdx === TOUR_STEPS.length - 1}
              onClick={handleNext}
              className="glass-card-interactive px-3.5 py-1.5 rounded-2xl text-slate-300 text-xs font-mono disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleSkipToReveal}
              className="glass-card-interactive px-3.5 py-1.5 rounded-2xl text-[#00d4ff] hover:text-cyan-200 text-xs font-mono font-bold cursor-pointer"
            >
              Skip to Reveal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
