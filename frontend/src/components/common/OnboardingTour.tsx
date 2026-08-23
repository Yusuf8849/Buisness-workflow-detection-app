import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Zap,
  Search,
  LayoutGrid,
  BarChart3,
  Bot,
  Layers,
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { soundFX } from '../../utils/audioEffects';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'overview' | 'studio' | 'discover' | 'analytics' | 'history') => void;
  onTriggerDemoDiscovery?: () => void;
}

interface StepData {
  stepNumber: number;
  badge: string;
  title: string;
  description: string;
  highlightText: string;
  icon: any;
  targetArea: string;
  actionButtonLabel: string;
}

const TUTORIAL_STEPS: StepData[] = [
  {
    stepNumber: 1,
    badge: 'STEP 1 OF 3 • WELCOME TO FLOWINTEL.AI',
    title: 'Discover Workflows Buried in Business Documents',
    description: 'FlowIntel.AI uses autonomous neural AST parsers to extract hidden operational steps, stakeholders, and validation decision gates from informal SOPs, emails, and procedural text.',
    highlightText: 'Turn chaotic enterprise documentation into mathematical, cycle-free Directed Acyclic Graphs in seconds.',
    icon: Sparkles,
    targetArea: 'Overview & 3D Neural Ingestion',
    actionButtonLabel: 'Next: Try It Yourself →'
  },
  {
    stepNumber: 2,
    badge: 'STEP 2 OF 3 • TRY IT YOURSELF',
    title: 'Real-Time Natural Language AI Detection',
    description: 'Paste any unstructured business description or select one of our enterprise templates (Loan Approvals, IT Asset Provisioning, KYC Verification). Click "AI Detect Workflow" with pulse animation to watch the 7-stage AST pipeline synthesize schemas in real-time.',
    highlightText: 'Watch entity extraction, cycle checks, and STP straight-through routing synthesize live.',
    icon: Search,
    targetArea: 'Discover & Detect Workspace',
    actionButtonLabel: 'Next: Explore Results →'
  },
  {
    stepNumber: 3,
    badge: 'STEP 3 OF 3 • EXPLORE YOUR RESULTS',
    title: 'Interactive DAG Studio & AI Process Partner',
    description: 'Drag and inspect your interactive DAG diagram with snap-to-grid alignment. Jump to Process Analytics for latency breakdown, and chat with your floating AI Process Partner asking: "Need help understanding this workflow?"',
    highlightText: '100% DAG Verified • 0 Cyclic Deadlocks • Instant One-Click STP Optimization.',
    icon: LayoutGrid,
    targetArea: 'Studio Canvas & AI Companion',
    actionButtonLabel: 'Finish Tour & Explore Studio 🚀'
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onTriggerDemoDiscovery
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      soundFX.playWhoosh();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIdx];
  const StepIcon = currentStep.icon;

  const handleNext = () => {
    soundFX.playClick();
    if (currentStepIdx < TUTORIAL_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);

      // Contextual navigation preview based on step
      if (nextIdx === 1) {
        onNavigateTab('discover');
      } else if (nextIdx === 2) {
        onNavigateTab('studio');
      }
    } else {
      soundFX.playCelebration();
      localStorage.setItem('flowintel_tutorial_completed', 'true');
      onNavigateTab('studio');
      onClose();
    }
  };

  const handlePrev = () => {
    soundFX.playClick();
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      if (prevIdx === 0) onNavigateTab('overview');
      if (prevIdx === 1) onNavigateTab('discover');
    }
  };

  const handleSkip = () => {
    soundFX.playClick();
    localStorage.setItem('flowintel_tutorial_completed', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Subtle Frosted Dimming Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkip}
          className="fixed inset-0 bg-[#0a0e1a]/85 backdrop-blur-[20px]"
        />

        {/* Floating Spotlight Card Container */}
        <motion.div
          key={currentStep.stepNumber}
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: -25 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          className="relative w-full max-w-xl rounded-3xl glass-card border-2 border-[#00d4ff]/50 bg-[#0a0e1a]/95 shadow-[0_0_80px_rgba(0,212,255,0.35)] p-6 sm:p-8 space-y-6 overflow-hidden z-10 text-left"
        >
          {/* Ambient Glow Aura */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#00d4ff]/20 blur-[70px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#7c3aed]/20 blur-[70px] pointer-events-none" />

          {/* Top Control Bar: Progress Pill & Close */}
          <div className="flex items-center justify-between relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono font-bold">
              <StepIcon className="w-3.5 h-3.5 text-[#00d4ff]" />
              <span>{currentStep.badge}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Skip Tour
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Graphic Preview Card */}
          <div className="relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3 overflow-hidden">
            {currentStep.stepNumber === 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-[#00d4ff] font-bold">Unstructured Natural Language</span>
                  <span className="text-[#10b981]">──► 100% DAG Topology</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0e1a]/90 border border-white/[0.06] text-xs font-mono text-slate-300">
                  "Applicant emails loan form. Ops conducts KYC manual check. If complete, underwriter evaluates risk..."
                </div>
              </div>
            )}

            {currentStep.stepNumber === 2 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    AI AST Extraction
                  </span>
                  <span className="text-slate-400">7-Stage Pipeline</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-1 rounded-lg bg-[#00d4ff]/20 text-[#00d4ff] font-bold border border-[#00d4ff]/40">
                    ⚡ FormCreate
                  </span>
                  <span>──►</span>
                  <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                    Notify Vendor
                  </span>
                  <span>──►</span>
                  <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                    Decision Gate
                  </span>
                </div>
              </div>
            )}

            {currentStep.stepNumber === 3 && (
              <div className="flex items-center justify-between gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] flex-1 text-center font-bold">
                  ✓ Interactive Studio
                </div>
                <div className="p-3 rounded-xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] flex-1 text-center font-bold">
                  📊 Analytics
                </div>
                <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex-1 text-center font-bold flex items-center justify-center gap-1">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Partner</span>
                </div>
              </div>
            )}
          </div>

          {/* Main Title & Description */}
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#e8edf5] font-display">
              {currentStep.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {currentStep.description}
            </p>
            <div className="p-3 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-xs font-mono text-[#00d4ff]">
              💡 {currentStep.highlightText}
            </div>
          </div>

          {/* 3-Step Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCurrentStepIdx(idx);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIdx
                    ? 'w-8 bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]'
                    : idx < currentStepIdx
                    ? 'w-3 bg-[#10b981]'
                    : 'w-3 bg-white/[0.15]'
                }`}
                title={`Jump to Step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="glass-button-primary button-scale px-6 py-2.5 rounded-xl text-[#0a0e1a] font-extrabold text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.4)] cursor-pointer"
            >
              <span>{currentStep.actionButtonLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
