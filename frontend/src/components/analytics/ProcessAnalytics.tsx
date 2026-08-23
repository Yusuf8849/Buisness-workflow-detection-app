import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow } from '../../types/workflow';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip
} from 'recharts';
import {
  Activity,
  Users,
  Clock,
  AlertTriangle,
  Layers,
  GitFork,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Flame,
  Search,
  Check,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface ProcessAnalyticsProps {
  workflow: Workflow;
  onFocusNode?: (nodeId: string) => void;
}

export const ProcessAnalytics: React.FC<ProcessAnalyticsProps> = ({ workflow, onFocusNode }) => {
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [isResolvedMode, setIsResolvedMode] = useState<boolean>(false);
  const [activeDimensionIndex, setActiveDimensionIndex] = useState<number>(0);
  const [selectedBottleneckId, setSelectedBottleneckId] = useState<string | null>(null);
  const [gradeText, setGradeText] = useState<string>('');

  // Target Health Score: 96%
  const targetScore = isResolvedMode ? 98 : (workflow.healthScore?.overall || 96);

  // Grade typewriter effect
  useEffect(() => {
    const fullGrade = targetScore >= 95 ? 'A-' : targetScore >= 90 ? 'A' : 'B+';
    setGradeText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullGrade.length) {
        setGradeText(fullGrade.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 120);
    return () => clearInterval(timer);
  }, [targetScore]);

  // Animate Gauge Arc count-up on load/change
  useEffect(() => {
    setAnimatedScore(0);
    const duration = 1200;
    const steps = 40;
    const increment = targetScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [targetScore]);

  // Stagger lighting up radar dimensions sequentially
  useEffect(() => {
    const dimTimer = setInterval(() => {
      setActiveDimensionIndex((prev) => (prev + 1) % 5);
    }, 1600);
    return () => clearInterval(dimTimer);
  }, []);

  // Metrics
  const metrics = workflow.metrics || {
    stepCount: 10,
    actorCount: 6,
    decisionCount: 2,
    relationshipCount: 11,
    estimatedCycleTime: '3.5 days',
    manualHandoffs: 4
  };

  // 5 Radar Dimensions
  const radarData = [
    { subject: 'Clarity', score: 94, fullMark: 100, desc: 'Unambiguous action semantics' },
    { subject: 'Ownership', score: 96, fullMark: 100, desc: 'Clear stakeholder mapping' },
    { subject: 'Efficiency', score: isResolvedMode ? 98 : 91, fullMark: 100, desc: 'Minimal latency queues' },
    { subject: 'Automation', score: isResolvedMode ? 95 : 88, fullMark: 100, desc: 'Straight-through APIs' },
    { subject: 'Decision Complexity', score: 82, fullMark: 100, desc: 'Deterministic branch rules' },
  ];

  // Latency Comparison Data with Crumble Animation
  const latencySteps = [
    { id: 'step-001', name: 'Document Intake', asIsHours: 1.8, toBeHours: 0.15, reduction: '-92%', isBottleneck: false },
    { id: 'step-002', name: 'KYC & Verification', asIsHours: 4.5, toBeHours: 0.2, reduction: '-96%', isBottleneck: true },
    { id: 'step-003', name: 'Risk Scoring', asIsHours: 2.6, toBeHours: 0.3, reduction: '-88%', isBottleneck: false },
    { id: 'step-004', name: 'Manager Sign-Off', asIsHours: 3.8, toBeHours: 0.25, reduction: '-93%', isBottleneck: true },
    { id: 'step-005', name: 'Finance Disbursement', asIsHours: 1.5, toBeHours: 0.1, reduction: '-93%', isBottleneck: false },
  ];

  // Active Bottleneck Count
  const activeBottlenecks = isResolvedMode ? 0 : 2;

  // SVG Gauge calculations
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  return (
    <div className="space-y-8 text-left">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#00b4d8]/15 border border-[#00b4d8]/30 text-[#00b4d8] text-xs font-mono mb-1.5 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-[#00b4d8]" />
            <span className="font-bold">PROCESS INTELLIGENCE & PERFORMANCE ANALYTICS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#e8edf5] font-display">
            Dynamic Process Analytics & Storytelling
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Real-time health score indexing, radar topology mapping, latency simulation, and bottleneck diagnostics.
          </p>
        </div>

        {/* Toggle Simulation Mode */}
        <button
          type="button"
          onClick={() => setIsResolvedMode(!isResolvedMode)}
          className={`button-scale px-4 py-2.5 rounded-2xl text-xs font-mono font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md ${
            isResolvedMode
              ? 'bg-[#059669]/15 border-[#059669] text-[#059669]'
              : 'bg-white dark:bg-white/[0.05] border-slate-300 dark:border-white/[0.12] text-[#0f172a] dark:text-slate-200 hover:border-[#00b4d8]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00b4d8]" />
          <span>{isResolvedMode ? 'Simulation: To-Be STP Applied' : 'Simulate AI Optimization'}</span>
        </button>
      </div>

      {/* 2. Top Savings Callout Banner: "12.5 Hours Saved" */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-[#00b4d8]/30 shadow-[0_4px_20px_rgba(0,180,216,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center text-[#00b4d8] shrink-0 shadow-[0_0_15px_rgba(0,180,216,0.25)]">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#00b4d8] font-bold uppercase tracking-wider">
              OPERATIONAL TIME RECOVERY
            </div>
            <div className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-[#e8edf5] font-display">
              💡 <span className="text-[#00b4d8]">12.5 hours</span> saved per week per case with Straight-Through Processing
            </div>
          </div>
        </div>

        {/* Gradient Badge: -94% */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 text-[#7c3aed] text-xs font-mono font-bold shrink-0 shadow-sm">
          <TrendingDown className="w-4 h-4" />
          <span>-94% Cycle Delay</span>
        </div>
      </div>

      {/* Top 4 Key Metric Summary Cards (Light Mode: White with subtle shadow + 4px solid left border) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Total Operations (Cyan Left Border) */}
        <div className="bg-white dark:glass-card card-lift p-5 space-y-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-200/80 dark:border-white/[0.08] border-l-4 !border-l-[#00b4d8]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Total Operations</span>
            <Layers className="w-4 h-4 text-[#00b4d8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#e8edf5] font-display">
            <AnimatedCounter value={metrics.stepCount} />
          </div>
          {/* Gradient Badge: 100% */}
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#059669] font-bold bg-[#059669]/10 px-2 py-0.5 rounded-full border border-[#059669]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% DAG Verified</span>
          </span>
        </div>

        {/* Stat Card 2: Cycle Time (Green Left Border) */}
        <div className="bg-white dark:glass-card card-lift p-5 space-y-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-200/80 dark:border-white/[0.08] border-l-4 !border-l-[#059669]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Cycle Time</span>
            <Clock className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#059669] font-display">
            {isResolvedMode ? '1.2 hours' : metrics.estimatedCycleTime}
          </div>
          {/* Gradient Badge: 96% / -94% */}
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#3b82f6] font-bold bg-[#3b82f6]/10 px-2 py-0.5 rounded-full border border-[#3b82f6]/30">
            {isResolvedMode ? '-94% STP Reduction' : '96% Automatable'}
          </span>
        </div>

        {/* Stat Card 3: Decision Gates (Amber Left Border) */}
        <div className="bg-white dark:glass-card card-lift p-5 space-y-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-200/80 dark:border-white/[0.08] border-l-4 !border-l-[#d97706]">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Decision Gates</span>
            <GitFork className="w-4 h-4 text-[#d97706]" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#d97706] font-display">
            <AnimatedCounter value={metrics.decisionCount} />
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">Multi-branch conditional</span>
        </div>

        {/* Stat Card 4: Hotspot Risks (Rose / Green Left Border) */}
        <div className={`bg-white dark:glass-card card-lift p-5 space-y-1 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-200/80 dark:border-white/[0.08] border-l-4 ${activeBottlenecks > 0 ? '!border-l-[#e11d48]' : '!border-l-[#059669]'}`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-slate-400">Hotspot Risks</span>
            <AlertTriangle className={`w-4 h-4 ${activeBottlenecks > 0 ? 'text-[#e11d48] animate-pulse' : 'text-[#059669]'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-display ${activeBottlenecks > 0 ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
            <AnimatedCounter value={activeBottlenecks} />
          </div>
          {/* Gradient Badge: 0 Hotspots */}
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${activeBottlenecks > 0 ? 'text-[#e11d48] bg-[#e11d48]/10 border border-[#e11d48]/30' : 'text-[#059669] bg-[#059669]/10 border border-[#059669]/30'}`}>
            {activeBottlenecks > 0 ? 'Requires Attention' : <><Check className="w-3 h-3 text-[#059669]" /> 0 Hotspots</>}
          </span>
        </div>
      </div>

      {/* Row 1: Circular Health Score Gauge + 5-Dimension Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Process Health Score Gauge */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 flex flex-col items-center justify-between space-y-6 text-center">
          <div className="w-full flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <h3 className="text-sm font-mono font-bold text-[#0f172a] dark:text-[#e8edf5] uppercase tracking-wider font-display">
                Process Health Score
              </h3>
            </div>
            <span className="text-xs font-mono text-[#059669] font-bold">Overall Index</span>
          </div>

          {/* SVG Circular Gauge with #e2e8f0 track & #3b82f6 -> #00b4d8 progress */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="healthScoreProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#00b4d8" />
                </linearGradient>
              </defs>

              {/* Background Track #e2e8f0 */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="12"
                fill="transparent"
              />

              {/* Progress Arc #3b82f6 to #00b4d8 */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="url(#healthScoreProgressGradient)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  transition: 'stroke-dashoffset 1s ease-in-out',
                  filter: 'drop-shadow(0 0 8px rgba(0, 180, 216, 0.4))'
                }}
              />
            </svg>

            {/* Dark Navy Grade Rating with Glow */}
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
              <div className="w-20 h-20 rounded-full bg-white dark:bg-white/[0.04] border border-[#00b4d8]/40 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,180,216,0.25)]">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-[#00d4ff] font-display">
                  {gradeText || 'A-'}
                </span>
                <span className="text-[10px] font-mono text-[#334155] dark:text-slate-300 font-bold uppercase">
                  {animatedScore}%
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-1">GRADE RATING</span>
            </div>
          </div>

          {/* Underlying Factors */}
          <div className="w-full space-y-2 pt-2 border-t border-slate-200 dark:border-white/[0.06] text-left">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">
              Underlying Factor Weights
            </span>
            <div className="space-y-1.5">
              {radarData.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#334155] dark:text-slate-300">{factor.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.15 }}
                        className="h-full bg-gradient-to-r from-[#3b82f6] to-[#00b4d8] rounded-full"
                      />
                    </div>
                    <span className="text-[#00b4d8] font-bold w-7 text-right">{factor.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Dimension Radar Chart (#00b4d8 fill 0.15 opacity, #e2e8f0 grid, #334155 labels) */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6d28d9]" />
              <h3 className="text-sm font-mono font-bold text-[#0f172a] dark:text-[#e8edf5] uppercase tracking-wider font-display">
                5-Dimension Intelligence Radar
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#00b4d8] animate-ping" />
              <span>Dimension {activeDimensionIndex + 1}/5 Active</span>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="h-64 sm:h-72 w-full flex items-center justify-center relative animate-radar-spin">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#334155"
                  fontSize={11}
                  tick={{ fill: '#334155', fontWeight: 600 }}
                />
                <PolarRadiusAxis stroke="#94a3b8" angle={30} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(0, 180, 216, 0.3)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                  }}
                />
                <Radar
                  name="Dimension Score"
                  dataKey="score"
                  stroke="#00b4d8"
                  strokeWidth={2.5}
                  fill="#00b4d8"
                  fillOpacity={0.15}
                  isAnimationActive={true}
                  animationDuration={1400}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-200 dark:border-white/[0.08] text-[10px] font-mono text-center">
            {radarData.map((d, i) => {
              const isLit = i === activeDimensionIndex;
              return (
                <div
                  key={i}
                  className={`p-2 rounded-xl border transition-all duration-300 ${
                    isLit
                      ? 'bg-[#00b4d8]/15 border-[#00b4d8] text-[#00b4d8] shadow-[0_2px_12px_rgba(0,180,216,0.3)] scale-105 font-bold'
                      : 'bg-slate-100 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-[#334155] dark:text-slate-300'
                  }`}
                >
                  <div className="truncate font-semibold">{d.subject}</div>
                  <div className={`font-bold ${isLit ? 'text-[#00b4d8]' : 'text-slate-700 dark:text-[#00d4ff]'}`}>{d.score}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Latency Comparison */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#059669]" />
            <div>
              <h3 className="text-sm font-mono font-bold text-[#0f172a] dark:text-[#e8edf5] uppercase tracking-wider font-display">
                Step-Level Latency Comparison (Crumble Transform)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Human As-Is Execution vs AI-Optimized Straight-Through Processing (STP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-300 font-bold">
              <span className="w-3 h-3 rounded-md bg-gradient-to-r from-[#f43f5e] to-[#f59e0b]" /> As-Is Human Delay
            </span>
            <span className="flex items-center gap-1.5 text-[#059669] dark:text-emerald-300 font-bold">
              <span className="w-3 h-3 rounded-md bg-gradient-to-r from-[#059669] to-[#00b4d8]" /> To-Be STP Optimized
            </span>
          </div>
        </div>

        {/* Side-by-Side Bar Rows */}
        <div className="space-y-4">
          {latencySteps.map((step, idx) => {
            const asIsPct = (step.asIsHours / 5.0) * 100;
            const toBePct = (step.toBeHours / 5.0) * 100;

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] hover:border-[#00b4d8]/40 transition-all space-y-2.5 card-lift shadow-sm"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}.</span>
                    <span className="text-xs sm:text-sm font-bold text-[#0f172a] dark:text-[#e8edf5] font-display">{step.name}</span>
                    {step.isBottleneck && activeBottlenecks > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[#f43f5e] text-[10px] font-mono font-bold animate-pulse">
                        ⚠️ BOTTLENECK
                      </span>
                    )}
                  </div>

                  {/* Percentage Reduction Floating Badge */}
                  <span className="px-3 py-1 rounded-full bg-[#059669]/15 border border-[#059669]/30 text-[#059669] text-xs font-mono font-bold flex items-center gap-1 shadow-sm">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>{step.reduction} Latency</span>
                  </span>
                </div>

                {/* Bars Comparison */}
                <div className="space-y-2 pt-1 font-mono text-[11px]">
                  {/* As-Is Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-slate-500 dark:text-slate-400 shrink-0">As-Is:</span>
                    <div className="flex-1 bg-slate-100 dark:bg-white/[0.04] h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#f43f5e] to-[#f59e0b] transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-bar-crumble"
                        style={{ width: `${asIsPct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-[#f43f5e] shrink-0">
                      {step.asIsHours} hrs
                    </span>
                  </div>

                  {/* To-Be AI Optimized Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-slate-500 dark:text-slate-400 shrink-0">To-Be STP:</span>
                    <div className="flex-1 bg-slate-100 dark:bg-white/[0.04] h-4 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#059669] to-[#00b4d8] transition-all duration-1000 shadow-[0_0_10px_rgba(5,150,105,0.3)]"
                        style={{ width: `${Math.max(toBePct, 4)}%` }}
                      />
                    </div>
                    <span className="w-16 text-right font-bold text-[#059669] shrink-0">
                      {step.toBeHours} hrs
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Bottleneck Risks & Heatmap DAG Scanner */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${activeBottlenecks > 0 ? 'text-[#d97706]' : 'text-[#059669]'}`} />
            <div>
              <h3 className="text-sm font-mono font-bold text-[#0f172a] dark:text-[#e8edf5] uppercase tracking-wider font-display">
                Bottleneck Risk Heatmap & DAG Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click a bottleneck node below to inspect AI mitigation recommendations
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Live DAG Scanner</span>
        </div>

        {/* Mini DAG Heatmap Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0e1a]/80 border border-slate-200 dark:border-white/[0.08] overflow-x-auto">
          <svg className="w-full min-w-[640px] h-28" viewBox="0 0 700 110">
            {/* Connecting Stream Lines */}
            <path d="M 60 55 L 180 55" stroke="#00b4d8" strokeWidth="2.5" strokeDasharray="6, 6" />
            <path d="M 240 55 L 340 55" stroke={activeBottlenecks > 0 ? '#f43f5e' : '#059669'} strokeWidth="2.5" strokeDasharray="6, 6" />
            <path d="M 400 55 L 500 55" stroke="#00b4d8" strokeWidth="2.5" strokeDasharray="6, 6" />
            <path d="M 560 55 L 640 55" stroke={activeBottlenecks > 0 ? '#f43f5e' : '#059669'} strokeWidth="2.5" strokeDasharray="6, 6" />

            {/* Node 1: Customer */}
            <circle cx="60" cy="55" r="22" fill="#3b82f6" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" />
            <text x="60" y="58" textAnchor="middle" fill="#3b82f6" fontSize="10" fontFamily="monospace" fontWeight="bold">INIT</text>
            <text x="60" y="92" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">Customer</text>

            {/* Node 2: Intake */}
            <rect x="180" y="35" width="60" height="40" rx="10" fill="#059669" fillOpacity="0.2" stroke="#059669" strokeWidth="2" />
            <text x="210" y="58" textAnchor="middle" fill="#059669" fontSize="10" fontFamily="monospace" fontWeight="bold">INTAKE</text>
            <text x="210" y="92" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">Submit</text>

            {/* Node 3: KYC Verification */}
            <g
              onClick={() => setSelectedBottleneckId('kyc')}
              className="cursor-pointer group"
            >
              <rect
                x="340"
                y="35"
                width="60"
                height="40"
                rx="10"
                className={activeBottlenecks > 0 ? 'animate-heatmap-pulse' : ''}
                fill={activeBottlenecks > 0 ? '#f43f5e' : '#059669'}
                fillOpacity={activeBottlenecks > 0 ? '0.4' : '0.2'}
                stroke={activeBottlenecks > 0 ? '#f43f5e' : '#059669'}
                strokeWidth="2.5"
              />
              <text x="370" y="58" textAnchor="middle" fill={activeBottlenecks > 0 ? '#f43f5e' : '#059669'} fontSize="10" fontFamily="monospace" fontWeight="bold">
                {activeBottlenecks > 0 ? '🔥 KYC' : '✔ KYC'}
              </text>
              <text x="370" y="92" textAnchor="middle" fill={activeBottlenecks > 0 ? '#f43f5e' : '#64748b'} fontSize="10" fontFamily="monospace">
                Verify (4.5h)
              </text>
            </g>

            {/* Node 4: Underwriting */}
            <rect x="500" y="35" width="60" height="40" rx="10" fill="#059669" fillOpacity="0.2" stroke="#059669" strokeWidth="2" />
            <text x="530" y="58" textAnchor="middle" fill="#059669" fontSize="10" fontFamily="monospace" fontWeight="bold">RISK</text>
            <text x="530" y="92" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">Underwrite</text>

            {/* Node 5: Manager Sign-Off */}
            <g
              onClick={() => setSelectedBottleneckId('manager')}
              className="cursor-pointer group"
            >
              <rect
                x="640"
                y="35"
                width="60"
                height="40"
                rx="10"
                className={activeBottlenecks > 0 ? 'animate-heatmap-pulse' : ''}
                fill={activeBottlenecks > 0 ? '#d97706' : '#059669'}
                fillOpacity={activeBottlenecks > 0 ? '0.4' : '0.2'}
                stroke={activeBottlenecks > 0 ? '#d97706' : '#059669'}
                strokeWidth="2.5"
              />
              <text x="670" y="58" textAnchor="middle" fill={activeBottlenecks > 0 ? '#d97706' : '#059669'} fontSize="10" fontFamily="monospace" fontWeight="bold">
                {activeBottlenecks > 0 ? '🔥 APPR' : '✔ APPR'}
              </text>
              <text x="670" y="92" textAnchor="middle" fill={activeBottlenecks > 0 ? '#d97706' : '#64748b'} fontSize="10" fontFamily="monospace">
                Sign-off (3.8h)
              </text>
            </g>
          </svg>
        </div>

        {/* 0 Latency Hotspots State */}
        {activeBottlenecks === 0 && (
          <div className="p-6 rounded-2xl bg-[#059669]/10 border border-[#059669]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#059669]/20 border border-[#059669] flex items-center justify-center text-[#059669] shrink-0 animate-bounce">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#059669] font-display">
                  0 Latency Hotspots • Fully Optimized STP
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                  All critical-path queues streamlined. Straight-Through Processing active with automated fallback routing.
                </p>
              </div>
            </div>

            {/* Gradient Badge: 100% */}
            <div className="px-4 py-2 rounded-full bg-[#059669]/20 border border-[#059669]/50 text-[#059669] font-mono text-xs font-bold shrink-0">
              100% DAG PASS
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
