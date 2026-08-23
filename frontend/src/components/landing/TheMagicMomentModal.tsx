import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Award,
  Layers,
  Cpu,
  ArrowRight,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  TrendingDown,
  Clock,
  Download,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../../utils/audioEffects';

interface TheMagicMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

export const TheMagicMomentModal: React.FC<TheMagicMomentModalProps> = ({
  isOpen,
  onClose,
  onOpenStudio
}) => {
  const [phase, setPhase] = useState<'explosion' | 'assembly' | 'certified'>('explosion');
  const [progress, setProgress] = useState<number>(0);
  const [stepCount, setStepCount] = useState<number>(0);
  const [actorCount, setActorCount] = useState<number>(0);
  const [decisionCount, setDecisionCount] = useState<number>(0);
  const [latencySaved, setLatencySaved] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Trigger Full Climactic Sequence on Open
  useEffect(() => {
    if (!isOpen) return;

    setPhase('explosion');
    setProgress(0);
    setStepCount(0);
    setActorCount(0);
    setDecisionCount(0);
    setLatencySaved(0);

    if (!soundMuted) {
      soundFX.playWhoosh();
    }

    // 1. Progress Bar Filling 0% to 100%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 40);

    // 2. Iron Man Style Assembly Transition (after 700ms)
    const assemblyTimer = setTimeout(() => {
      setPhase('assembly');
      if (!soundMuted) {
        soundFX.playClick();
      }
    }, 800);

    // 3. Final Climactic Certified Stamp & Confetti Reveal (after 1800ms)
    const certifiedTimer = setTimeout(() => {
      setPhase('certified');
      if (!soundMuted) {
        soundFX.playCelebration();
      }

      // Tasteful Gold & Cyan Confetti Burst from Completion Node
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#00d4ff', '#f59e0b', '#38bdf8', '#10b981', '#7c3aed', '#ffffff'],
          ticks: 200,
          gravity: 0.9,
          scalar: 1.1
        });
      } catch (e) {}

      // Digital Metric Count-Up Animations
      const countInterval = setInterval(() => {
        setStepCount((prev) => (prev < 17 ? prev + 1 : 17));
        setActorCount((prev) => (prev < 6 ? prev + 1 : 6));
        setDecisionCount((prev) => (prev < 4 ? prev + 1 : 4));
        setLatencySaved((prev) => (prev < 94 ? prev + 3 : 94));
      }, 40);

      setTimeout(() => clearInterval(countInterval), 1500);
    }, 1900);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(assemblyTimer);
      clearTimeout(certifiedTimer);
    };
  }, [isOpen, soundMuted]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Deep Backdrop with Animated Radial Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0a0e1a]/90 backdrop-blur-[24px]"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          className="relative w-full max-w-2xl rounded-2xl glass-card border border-[#00d4ff]/40 bg-[#0a0e1a]/95 shadow-[0_0_80px_rgba(0,212,255,0.35)] p-6 sm:p-8 space-y-6 overflow-hidden z-10"
        >
          {/* Ambient Multi-Chroma Shockwave Glow Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#00d4ff]/20 blur-[80px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#7c3aed]/20 blur-[80px] animate-pulse" />
          </div>

          {/* Top Control Bar: Audio & Close */}
          <div className="flex items-center justify-between relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>THE MAGIC EUREKA MOMENT</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundMuted(!soundMuted)}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#00d4ff]" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 1. 3D Exploding Particle Shockwave Visualization */}
          <div className="relative h-44 rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden flex items-center justify-center p-4">
            {/* Shockwave Radial Rings */}
            <div className={`absolute w-36 h-36 rounded-full border border-[#00d4ff]/60 ${phase === 'explosion' ? 'scale-150 opacity-100' : 'scale-100 opacity-30'} transition-all duration-700`} />
            <div className={`absolute w-56 h-56 rounded-full border border-[#7c3aed]/40 ${phase === 'explosion' ? 'scale-150 opacity-100' : 'scale-100 opacity-20'} transition-all duration-1000`} />

            {/* 2. Iron Man Suit Assembly: Nodes Fly from Edges into Clean Horizontal DAG */}
            <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 w-full">
              {/* Trigger Node */}
              <motion.div
                initial={{ x: -120, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
                className="p-2.5 rounded-xl bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.4)] text-center min-w-[70px]"
              >
                <Zap className="w-4 h-4 mx-auto mb-1 animate-pulse" />
                <span className="text-[9px] font-mono font-bold block">TRIGGER</span>
              </motion.div>

              <div className="h-0.5 flex-1 bg-gradient-to-r from-[#10b981] to-[#3b82f6] shadow-[0_0_8px_#00d4ff]" />

              {/* Action Node */}
              <motion.div
                initial={{ y: -80, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.25, type: 'spring' }}
                className="p-2.5 rounded-xl bg-[#3b82f6]/20 border border-[#3b82f6]/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] text-center min-w-[70px]"
              >
                <Layers className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[9px] font-mono font-bold block">ACTIONS</span>
              </motion.div>

              <div className="h-0.5 flex-1 bg-gradient-to-r from-[#3b82f6] to-[#f59e0b] shadow-[0_0_8px_#00d4ff]" />

              {/* Decision Gate */}
              <motion.div
                initial={{ y: 80, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
                className="p-2.5 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] text-center min-w-[70px]"
              >
                <Cpu className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[9px] font-mono font-bold block">DECISION</span>
              </motion.div>

              <div className="h-0.5 flex-1 bg-gradient-to-r from-[#f59e0b] to-[#7c3aed] shadow-[0_0_8px_#00d4ff]" />

              {/* Completion Node */}
              <motion.div
                initial={{ x: 120, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.55, type: 'spring' }}
                className="p-2.5 rounded-xl bg-[#7c3aed]/25 border border-[#7c3aed]/50 text-purple-200 shadow-[0_0_20px_rgba(124,58,237,0.5)] text-center min-w-[70px]"
              >
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-[#10b981]" />
                <span className="text-[9px] font-mono font-bold block">COMPLETE</span>
              </motion.div>
            </div>
          </div>

          {/* 4. Real-time Gradient Progress Bar (0% to 100%) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <Cpu className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" />
                <span>DAG Topology Reconstruction & STP Synthesis</span>
              </span>
              <span className="text-[#00d4ff] font-bold text-sm">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-white/[0.06] h-2.5 rounded-full overflow-hidden p-0.5 border border-white/[0.1]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#10b981] transition-all duration-150 shadow-[0_0_15px_#00d4ff]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 6. "Workflow Successfully Reconstructed" Holographic Certificate with Stamp Animation */}
          {phase === 'certified' && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-[#0a0e1a] border border-[#10b981]/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] space-y-4"
            >
              {/* Gold / Green Certified Stamp Badge */}
              <div className="absolute top-4 right-4 rotate-12">
                <div className="px-3 py-1.5 rounded-xl bg-[#10b981]/25 border-2 border-[#10b981] text-[#10b981] font-mono text-[11px] font-black tracking-widest uppercase shadow-[0_0_20px_#10b981]">
                  ✓ CERTIFIED 0-CYCLES
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Enterprise Process Intelligence Certificate
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#e8edf5] font-display">
                  Workflow Successfully Reconstructed
                </h3>
                <p className="text-xs text-slate-300 font-mono">
                  Full natural language requirements synthesized into deterministic Straight-Through Processing DAG.
                </p>
              </div>

              {/* 7. Digital Metrics Count-Up Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/[0.08]">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-xl sm:text-2xl font-black font-display text-[#00d4ff]">
                    {stepCount}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Steps Mapped</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-xl sm:text-2xl font-black font-display text-purple-300">
                    {actorCount}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Actors Isolated</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-xl sm:text-2xl font-black font-display text-amber-300">
                    {decisionCount}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Decision Gates</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <div className="text-xl sm:text-2xl font-black font-display text-[#10b981]">
                    -{latencySaved}%
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Cycle Latency</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setPhase('explosion');
                setProgress(0);
                setStepCount(0);
                setActorCount(0);
                setDecisionCount(0);
                setLatencySaved(0);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay Magic Reveal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenStudio) onOpenStudio();
              }}
              className="w-full sm:w-auto glass-button-primary button-scale px-6 py-3 rounded-xl text-[#0a0e1a] font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.4)] cursor-pointer"
            >
              <span>Explore Reconstructed Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
