import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Zap, Layers, Activity, Cpu, Network } from 'lucide-react';

const LazyThreeDScene = lazy(() => import('../common/ThreeDScene'));
const LazyHero3DCanvas = lazy(() => import('./Hero3DCanvas'));

interface LandingHeroProps {
  onDiscoverClick: () => void;
  onOpenDemo: () => void;
  onOpenStudio: () => void;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onDiscoverClick,
  onOpenDemo,
  onOpenStudio
}) => {
  const [viewMode, setViewMode] = useState<'neural' | 'chaos'>('neural');
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Cinematic Typewriter Effect for Subtitle
  const fullSubtitle = "AI that discovers hidden business workflows inside messy natural language, SOP documents, and procedures — and transforms them into interactive process diagrams.";
  const [displayedSubtitle, setDisplayedSubtitle] = useState<string>('');
  const [isTypingDone, setIsTypingDone] = useState<boolean>(false);

  useEffect(() => {
    let charIndex = 0;
    setDisplayedSubtitle('');
    setIsTypingDone(false);

    const typingInterval = setInterval(() => {
      if (charIndex < fullSubtitle.length) {
        setDisplayedSubtitle(fullSubtitle.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTypingDone(true);
        clearInterval(typingInterval);
      }
    }, 18);

    return () => clearInterval(typingInterval);
  }, []);

  // Handle Button Click with Ripple + Particle Burst
  const handleDiscoverButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const rippleX = e.clientX - rect.left;
      const rippleY = e.clientY - rect.top;

      // Add ripple
      const rippleId = Date.now();
      setRipples((prev) => [...prev, { x: rippleX, y: rippleY, id: rippleId }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 700);

      // Trigger Confetti Particle Burst
      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: originX, y: originY },
        colors: ['#00d4ff', '#7c3aed', '#38bdf8', '#10b981', '#ec4899', '#ffffff'],
        ticks: 200,
        gravity: 1.2,
        scalar: 0.9,
        disableForReducedMotion: true
      });
    }

    // Trigger navigation after short micro-interaction tick
    setTimeout(() => {
      onDiscoverClick();
    }, 200);
  };

  return (
    <section className="relative pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Text Content with Motion Fade-In */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center max-w-4xl mx-auto space-y-6 mb-12"
      >
        {/* Big Leader Brand Heading */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00b4d8]/15 border border-[#00b4d8]/30 text-[#00b4d8] text-xs font-mono font-bold tracking-widest uppercase backdrop-blur-[20px] shadow-[0_0_20px_rgba(0,180,216,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00b4d8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00b4d8]" />
            </span>
            <span>NEXT-GEN AI PROCESS INTELLIGENCE</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight font-display bg-gradient-to-r from-[#00b4d8] via-[#38bdf8] to-[#7c3aed] bg-clip-text text-transparent animate-gradient-x drop-shadow-sm pb-1">
            FlowIntel<span className="text-[#00b4d8]">.AI</span>
          </h1>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f172a] dark:text-[#e8edf5] tracking-tight leading-[1.15] font-display">
            <span className="gradient-text-wave drop-shadow-sm">
              Turn Business Complexity Into Clarity
            </span>
          </h2>
        </div>

        {/* 2. Subtitle with Typing Cursor Effect */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans min-h-[56px] flex items-center justify-center">
          <span>
            {displayedSubtitle}
            <span
              className={`inline-block w-2 h-5 ml-1 bg-[#00d4ff] shadow-[0_0_10px_#00d4ff] align-middle ${
                isTypingDone ? 'animate-pulse' : 'animate-bounce'
              }`}
            />
          </span>
        </p>

        {/* 4. CTA Buttons with Ripple & Particle Burst */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleDiscoverButtonClick}
            className="relative overflow-hidden glass-button-primary button-scale px-8 py-4 rounded-2xl text-[#0a0e1a] font-extrabold text-sm sm:text-base flex items-center gap-2.5 cursor-pointer shadow-[0_0_25px_rgba(0,212,255,0.4)]"
          >
            {/* Ripple Wave Elements */}
            {ripples.map((r) => (
              <span
                key={r.id}
                style={{ left: r.x, top: r.y }}
                className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 bg-white/40 rounded-full pointer-events-none animate-ripple"
              />
            ))}

            <Sparkles className="w-4 h-4 fill-current relative z-10" />
            <span className="relative z-10">Discover a Workflow</span>
            <ArrowRight className="w-4 h-4 relative z-10" />
          </button>

          <button
            type="button"
            onClick={onOpenDemo}
            className="glass-card-interactive button-scale px-8 py-4 rounded-2xl text-[#00d4ff] font-bold text-sm sm:text-base flex items-center gap-2.5 cursor-pointer border border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
          >
            <Play className="w-4 h-4 fill-current text-[#00d4ff]" />
            <span>See AI in Action (68s Demo)</span>
          </button>
        </div>

        {/* 3. Glowing Border Animated KPI Stat Cards with Pulse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-xs font-mono">
          <div className="glass-card card-lift pulse-glow-card p-3.5 rounded-2xl text-center space-y-1 border border-[#00d4ff]/40 shadow-[0_0_20px_rgba(0,212,255,0.2)]">
            <div className="text-xl sm:text-2xl font-extrabold text-[#00d4ff] font-display">
              <AnimatedCounter value={100} suffix="%" durationMs={1400} />
            </div>
            <div className="text-[10px] text-slate-300">DAG Topology Pass</div>
          </div>

          <div className="glass-card card-lift pulse-glow-card p-3.5 rounded-2xl text-center space-y-1 border border-[#10b981]/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="text-xl sm:text-2xl font-extrabold text-[#10b981] font-display">
              <AnimatedCounter value={96} suffix="%" durationMs={1400} />
            </div>
            <div className="text-[10px] text-slate-300">Health Score Index</div>
          </div>

          <div className="glass-card card-lift pulse-glow-card p-3.5 rounded-2xl text-center space-y-1 border border-[#7c3aed]/40 shadow-[0_0_20px_rgba(124,58,237,0.2)]">
            <div className="text-xl sm:text-2xl font-extrabold text-[#a855f7] font-display">
              <AnimatedCounter value={94} prefix="-" suffix="%" durationMs={1400} />
            </div>
            <div className="text-[10px] text-slate-300">STP Latency Reduction</div>
          </div>

          <div className="glass-card card-lift pulse-glow-card p-3.5 rounded-2xl text-center space-y-1 border border-[#38bdf8]/40 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <div className="text-xl sm:text-2xl font-extrabold text-[#38bdf8] font-display">
              <AnimatedCounter value={0} suffix=" Hotspots" durationMs={1400} />
            </div>
            <div className="text-[10px] text-slate-300">Zero Latency Queue</div>
          </div>
        </div>

        {/* 3D Mode Switcher Tabs */}
        <div className="inline-flex items-center p-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl backdrop-blur-[20px]">
          <button
            type="button"
            onClick={() => setViewMode('neural')}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer button-scale ${
              viewMode === 'neural'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.25)]'
                : 'text-slate-400 hover:text-[#e8edf5]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Interactive 3D Neural AST Graph</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('chaos')}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer button-scale ${
              viewMode === 'chaos'
                ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_15px_rgba(0,212,255,0.25)]'
                : 'text-slate-400 hover:text-[#e8edf5]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Chaos-to-Order Physics Sandbox</span>
          </button>
        </div>
      </motion.div>

      {/* 3D Interactive Experience Canvas with Suspense */}
      <Suspense fallback={
        <div className="w-full h-[600px] rounded-3xl glass-card shimmer-effect flex items-center justify-center text-xs font-mono text-[#00d4ff]">
          Loading 3D Neural Engine...
        </div>
      }>
        {viewMode === 'neural' ? (
          <LazyThreeDScene />
        ) : (
          <LazyHero3DCanvas />
        )}
      </Suspense>
    </section>
  );
};
