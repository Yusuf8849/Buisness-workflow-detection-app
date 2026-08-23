import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Play,
  Pause,
  Layers,
  Clock,
  TrendingDown,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { soundFX } from '../../utils/audioEffects';

export const BeforeAfterViewer: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAutoLoaded, setIsAutoLoaded] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<any>(null);

  // 4. Onload / InView Animation: Starts at 0% (After), smoothly sweeps to 100% (Before), then settles at 50% (Split)
  useEffect(() => {
    if (isAutoLoaded) return;

    const startTimer = setTimeout(() => {
      let current = 0;
      let phase = 1; // 1: 0->100, 2: 100->50

      const interval = setInterval(() => {
        if (phase === 1) {
          current += 3;
          if (current >= 100) {
            current = 100;
            phase = 2;
          }
        } else if (phase === 2) {
          current -= 2;
          if (current <= 50) {
            current = 50;
            clearInterval(interval);
            setIsAutoLoaded(true);
            soundFX.playClick();
          }
        }
        setSliderPosition(current);
      }, 25);
    }, 400);

    return () => clearTimeout(startTimer);
  }, [isAutoLoaded]);

  // 7. Auto-play sweep animation on "SEE THE TRANSFORMATION" click
  const handleToggleAutoPlay = () => {
    soundFX.playWhoosh();
    if (isPlaying) {
      setIsPlaying(false);
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    } else {
      setIsPlaying(true);
      let pos = sliderPosition;
      let forward = pos < 50;

      autoPlayIntervalRef.current = setInterval(() => {
        if (forward) {
          pos += 2;
          if (pos >= 100) forward = false;
        } else {
          pos -= 2;
          if (pos <= 0) {
            forward = true;
            setIsPlaying(false);
            clearInterval(autoPlayIntervalRef.current);
            setSliderPosition(50);
            soundFX.playChime();
          }
        }
        setSliderPosition(pos);
      }, 24);
    }
  };

  // Dragging calculation (Full 0% to 100% range)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || isPlaying) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pct);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono backdrop-blur-[20px] shadow-[0_0_20px_rgba(0,212,255,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" />
          <span>INSTANT TRANSFORMATION ENGINE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#e8edf5] tracking-tight font-display">
          From Process Chaos to Process Clarity
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Drag the interactive split slider to see how FlowIntel AI reconstructs buried, unstructured SOP text into a verified Straight-Through Processing DAG.
        </p>

        {/* Action Controls & Preset Mode Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleToggleAutoPlay}
            className="glass-button-primary button-scale px-6 py-2.5 rounded-2xl text-[#0a0e1a] font-extrabold text-xs font-mono flex items-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.4)] cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'PAUSE TRANSFORMATION' : 'SEE THE TRANSFORMATION'}</span>
          </button>

          {/* Quick Preset Buttons */}
          <div className="inline-flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl backdrop-blur-[20px] text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSliderPosition(100);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                sliderPosition >= 95 ? 'bg-[#f43f5e]/25 text-[#f43f5e] font-bold border border-[#f43f5e]/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Before (100%)
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSliderPosition(50);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                sliderPosition > 5 && sliderPosition < 95 ? 'bg-[#00d4ff]/25 text-[#00d4ff] font-bold border border-[#00d4ff]/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              50/50 Split
            </button>
            <button
              type="button"
              onClick={() => {
                soundFX.playClick();
                setSliderPosition(0);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                sliderPosition <= 5 ? 'bg-[#10b981]/25 text-[#10b981] font-bold border border-[#10b981]/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Full After (100%)
            </button>
          </div>
        </div>
      </div>

      {/* 5. Floating Stats Banner Above Slider: "4.5hrs → 0.2hrs" with Arrow Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* Stat 1: Latency */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">CYCLE LATENCY</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-[#f43f5e] line-through">4.5 hrs</span>
              <ArrowRight className="w-4 h-4 text-[#00d4ff] animate-pulse" />
              <span className="text-base font-display font-black text-[#10b981]">0.2 hrs</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-xs font-mono font-bold">
            -95%
          </span>
        </div>

        {/* Stat 2: Manual Handoffs */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">MANUAL HANDOFFS</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-[#f43f5e]">4 Handoffs</span>
              <ArrowRight className="w-4 h-4 text-[#00d4ff] animate-pulse" />
              <span className="text-base font-display font-black text-[#10b981]">0 (100% STP)</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded-xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 text-[#00d4ff] text-xs font-mono font-bold">
            0-Friction
          </span>
        </div>

        {/* Stat 3: Health Grade */}
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">PROCESS HEALTH</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono font-bold text-[#f43f5e]">Grade D+ (48%)</span>
              <ArrowRight className="w-4 h-4 text-[#00d4ff] animate-pulse" />
              <span className="text-base font-display font-black text-[#10b981]">Grade A- (96%)</span>
            </div>
          </div>
          <span className="px-2 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
            +48 Pts
          </span>
        </div>
      </div>

      {/* 3. Full-Coverage Draggable Split Slider Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative w-full h-[520px] rounded-2xl overflow-hidden border-2 border-white/[0.12] bg-[#0a0e1a] shadow-[0_0_60px_rgba(0,0,0,0.8)] select-none cursor-ew-resize touch-none"
      >
        {/* ========================================================= */}
        {/* 2. AFTER LAYER (Cool Blue/Green Tones: Full Width 100%)    */}
        {/* ========================================================= */}
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-[#0a0e1a] via-[#0a1628] to-[#00d4ff]/10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-4 h-4" />
              <span>AFTER: STRUCTURED DAG CLARITY (100% STP)</span>
            </div>
            <span className="text-xs font-mono text-slate-400">100% DAG Verified</span>
          </div>

          {/* Clean DAG Visualization Mock */}
          <div className="p-6 rounded-2xl bg-[#0a0e1a]/95 border border-[#00d4ff]/40 shadow-[0_0_40px_rgba(0,212,255,0.2)] space-y-4 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <span className="text-xs font-mono text-[#00d4ff] font-bold">TOPOLOGY CERTIFIED</span>
              <span className="text-[11px] font-mono text-[#10b981] bg-[#10b981]/15 px-2.5 py-0.5 rounded-xl font-bold border border-[#10b981]/30">
                0 CYCLES • 100% STP COMPLIANT
              </span>
            </div>

            {/* Visual Mini DAG */}
            <div className="flex items-center justify-between gap-2 text-xs font-mono">
              <div className="px-3 py-2 rounded-xl bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] text-center font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                ⚡ Order Placed
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-[#10b981] to-[#3b82f6] shadow-[0_0_6px_#00d4ff]" />
              <div className="px-3 py-2 rounded-xl bg-[#3b82f6]/20 border border-[#3b82f6]/50 text-blue-300 text-center font-bold">
                Notify Vendor
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-[#3b82f6] to-[#f59e0b] shadow-[0_0_6px_#00d4ff]" />
              <div className="px-3 py-2 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/50 text-amber-300 text-center font-bold">
                Stock Type?
              </div>
              <div className="h-0.5 flex-1 bg-gradient-to-r from-[#f59e0b] to-[#7c3aed] shadow-[0_0_6px_#00d4ff]" />
              <div className="px-3 py-2 rounded-xl bg-[#7c3aed]/25 border border-[#7c3aed]/50 text-purple-200 text-center font-bold shadow-[0_0_10px_rgba(124,58,237,0.4)]">
                ✓ Confirm
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-[#10b981]">
                <Check className="w-3.5 h-3.5" />
                <span>Deterministic Context Passing</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#00d4ff]">
                <Check className="w-3.5 h-3.5" />
                <span>Auto-Disbursement STP APIs</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Deterministic Execution: ~240ms Turnaround</span>
            <span className="text-[#10b981] font-bold">💡 12.5 Hours Saved / Week</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. BEFORE LAYER (Warm Red Tones: Full Width with ClipPath) */}
        {/* ========================================================= */}
        <div
          className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-[#1e0a12] via-[#12080c] to-[#0a0e1a] z-10"
          style={{
            clipPath: `inset(0 calc(100% - ${sliderPosition}%) 0 0)`
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#f43f5e]/25 border border-[#f43f5e]/50 text-[#f43f5e] text-xs font-mono font-bold shadow-[0_0_15px_rgba(244,63,94,0.35)]">
              <Flame className="w-4 h-4 animate-pulse" />
              <span>BEFORE: UNSTRUCTURED CHAOS & DEADLOCKS</span>
            </div>
            <span className="text-xs font-mono text-rose-300/80">0% DAG Visibility</span>
          </div>

          {/* Chaotic Text & Disconnected Floating Cards */}
          <div className="p-6 rounded-2xl bg-[#0a0e1a]/95 border border-[#f43f5e]/40 shadow-[0_0_40px_rgba(244,63,94,0.25)] space-y-3.5 max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between border-b border-[#f43f5e]/20 pb-2">
              <span className="text-xs font-mono text-[#f43f5e] font-bold">SOP v4_final_draft.docx</span>
              <span className="text-[11px] font-mono text-[#f43f5e] bg-[#f43f5e]/20 px-2 py-0.5 rounded-xl animate-pulse font-bold border border-[#f43f5e]/30">
                ⚠️ CRITICAL DELAYS & LOOPS
              </span>
            </div>

            {/* Messy Document Text with Strikethroughs */}
            <p className="text-xs font-mono text-slate-300 leading-relaxed">
              "Customer emails PDF form. Ops manually verifies files. If signature missing, ops emails back. <span className="text-[#f43f5e] bg-[#f43f5e]/20 px-1 rounded font-bold">Tickets pile up in inbox (+4.5hr queue)</span>. Once approved, manager signs off when available..."
            </p>

            {/* Red Warning Callouts */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-rose-200 text-[11px] font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f43f5e] shrink-0" />
                <span><strong>Single Point of Failure:</strong> Manager approval halts throughput.</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-rose-200 text-[11px] font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f43f5e] shrink-0" />
                <span><strong>Unmapped Exception:</strong> Rejected loans loop with no status SLA.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-[#f43f5e]">Latency: 3.5 - 5 Days</span>
            <span className="text-[#f43f5e] font-bold">4 Manual Handoffs Required</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DRAGGABLE SPLITTER BAR & GLOWING HANDLE                 */}
        {/* ========================================================= */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-[#f43f5e] via-[#00d4ff] to-[#10b981] shadow-[0_0_20px_#00d4ff] flex items-center justify-center pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Glowing Splitter Handle Pill */}
          <div className="px-2.5 py-1 rounded-full bg-[#0a0e1a] border-2 border-[#00d4ff] shadow-[0_0_20px_#00d4ff] flex items-center gap-1 text-[11px] font-black text-[#00d4ff] backdrop-blur-[20px]">
            <span>◀</span>
            <span className="w-0.5 h-2.5 bg-[#00d4ff] rounded-full" />
            <span>▶</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
