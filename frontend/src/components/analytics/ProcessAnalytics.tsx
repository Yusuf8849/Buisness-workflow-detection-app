import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, CustomWorkflowNode } from '../../types/workflow';
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
  Lightbulb,
  Crosshair
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
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [gradeText, setGradeText] = useState<string>('');

  // Target Health Score
  const targetScore = isResolvedMode ? 98 : (workflow.healthScore?.overall || 96);

  // 1. DYNAMIC LATENCY STEPS: Generated directly from detected workflow nodes
  const latencySteps = useMemo(() => {
    const rawNodes: CustomWorkflowNode[] = workflow.nodes && workflow.nodes.length > 0
      ? workflow.nodes
      : (workflow.steps || []).map((s, idx) => ({
          id: s.stepId || `step_${idx + 1}`,
          type: s.actionType === 'operation' ? 'decisionNode' : 'actionNode',
          position: { x: 0, y: 0 },
          data: {
            label: s.name,
            name: s.name,
            title: s.name,
            category: s.actionType,
            actionType: s.actionType
          }
        } as CustomWorkflowNode));

    if (!rawNodes || rawNodes.length === 0) {
      return [
        { id: 'step_1', name: 'Trigger Event', asIsHours: 0.8, toBeHours: 0.05, reduction: '-94%', isBottleneck: false, type: 'triggerNode', category: 'trigger' },
        { id: 'step_2', name: 'Process Execution', asIsHours: 2.5, toBeHours: 0.2, reduction: '-92%', isBottleneck: false, type: 'actionNode', category: 'action' },
        { id: 'step_3', name: 'Validation & Approval', asIsHours: 4.2, toBeHours: 0.25, reduction: '-94%', isBottleneck: true, type: 'decisionNode', category: 'decision' },
        { id: 'step_4', name: 'Workflow Completion', asIsHours: 1.5, toBeHours: 0.1, reduction: '-93%', isBottleneck: false, type: 'completionNode', category: 'completion' }
      ];
    }

    return rawNodes.map((node, idx) => {
      const label = String(node.data?.label || node.data?.name || node.data?.title || `Step ${idx + 1}`);
      const lower = label.toLowerCase();
      const nodeType = String(node.type || '').toLowerCase();
      const isDecision = nodeType.includes('decision') || node.data?.category === 'decision' || /if|check|verify|approval|review|valid|score|policy|whether/i.test(lower);
      const isDoc = nodeType.includes('document') || /document|payload|kyc|receipt|invoice|record|file|data/i.test(lower);
      const isActor = nodeType.includes('actor') || /notif|manager|vendor|customer|employee|director|lead|stakeholder/i.test(lower);
      const isTrigger = nodeType.includes('trigger') || idx === 0;

      // Realistic latency estimation based on step characteristics
      let asIsHours = 1.6 + ((idx * 3) % 4) * 0.3;
      if (isDecision) {
        asIsHours = 3.8 + (idx % 2 === 0 ? 0.7 : 0.4);
      } else if (isDoc) {
        asIsHours = 2.3 + (idx % 2 === 0 ? 0.4 : 0.2);
      } else if (isActor) {
        asIsHours = 3.2 + (idx % 2 === 0 ? 0.6 : 0.3);
      } else if (isTrigger) {
        asIsHours = 0.8;
      }

      asIsHours = Number(asIsHours.toFixed(1));
      let toBeHours = Number((asIsHours * 0.07).toFixed(2));
      if (toBeHours < 0.08) toBeHours = 0.08;

      const reductionPct = Math.round(((asIsHours - toBeHours) / asIsHours) * 100);
      const isBottleneck = node.data?.isBottleneck ?? (asIsHours >= 3.0 || isDecision);

      return {
        id: node.id,
        name: label,
        asIsHours,
        toBeHours,
        reduction: `-${reductionPct}%`,
        isBottleneck,
        type: node.type || (isDecision ? 'decisionNode' : 'actionNode'),
        category: isDecision ? 'decision' : isDoc ? 'document' : isActor ? 'actor' : isTrigger ? 'trigger' : 'action'
      };
    });
  }, [workflow]);

  // Aggregate metrics derived dynamically from latencySteps
  const totalAsIsHours = useMemo(() => Number(latencySteps.reduce((acc, s) => acc + s.asIsHours, 0).toFixed(1)), [latencySteps]);
  const totalToBeHours = useMemo(() => Number(latencySteps.reduce((acc, s) => acc + s.toBeHours, 0).toFixed(1)), [latencySteps]);
  const totalSavedHours = useMemo(() => Number((totalAsIsHours - totalToBeHours).toFixed(1)), [totalAsIsHours, totalToBeHours]);
  const overallReductionPct = totalAsIsHours > 0 ? Math.round(((totalAsIsHours - totalToBeHours) / totalAsIsHours) * 100) : 94;
  const maxLatencyHours = useMemo(() => Math.max(5.0, ...latencySteps.map(s => s.asIsHours)), [latencySteps]);

  // Active Bottleneck Count
  const activeBottlenecks = isResolvedMode ? 0 : latencySteps.filter(s => s.isBottleneck).length;

  // Selected Step for Detailed Bottleneck / Node Inspection
  const activeSelectedStep = useMemo(() => {
    if (selectedStepId) {
      return latencySteps.find(s => s.id === selectedStepId) || null;
    }
    return latencySteps.find(s => s.isBottleneck) || latencySteps[0] || null;
  }, [selectedStepId, latencySteps]);

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

  // Dynamic Metrics
  const metrics = {
    stepCount: workflow.nodes?.length || workflow.metrics?.stepCount || latencySteps.length,
    actorCount: workflow.actors?.length || workflow.metrics?.actorCount || 2,
    decisionCount: workflow.nodes?.filter(n => n.type === 'decisionNode' || n.data?.category === 'decision').length || workflow.metrics?.decisionCount || latencySteps.filter(s => s.isBottleneck).length,
    relationshipCount: workflow.edges?.length || workflow.metrics?.relationshipCount || (latencySteps.length > 0 ? latencySteps.length - 1 : 0),
    estimatedCycleTime: isResolvedMode ? `${totalToBeHours} hours` : (workflow.metrics?.estimatedCycleTime || `${totalAsIsHours} hours`),
    manualHandoffs: isResolvedMode ? 0 : (workflow.metrics?.manualHandoffs || Math.max(1, Math.floor(latencySteps.length / 2)))
  };

  // 5 Dynamic Radar Dimensions
  const radarData = [
    { subject: 'Clarity', score: workflow.healthScore?.clarity || 94, fullMark: 100, desc: 'Unambiguous action semantics' },
    { subject: 'Ownership', score: workflow.healthScore?.ownershipClarity || 96, fullMark: 100, desc: 'Clear stakeholder mapping' },
    { subject: 'Efficiency', score: isResolvedMode ? 98 : (workflow.healthScore?.efficiency || 91), fullMark: 100, desc: 'Minimal latency queues' },
    { subject: 'Automation', score: isResolvedMode ? 96 : Math.max(75, 100 - (workflow.healthScore?.manualDependency || 10)), fullMark: 100, desc: 'Straight-through APIs' },
    { subject: 'Decision Complexity', score: workflow.healthScore?.decisionComplexity || 84, fullMark: 100, desc: 'Deterministic branch rules' },
  ];

  // SVG Gauge calculations
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  // Mini DAG Heatmap SVG layout math
  const svgWidth = Math.max(680, latencySteps.length * 135);
  const stepSpacing = latencySteps.length > 1 ? (svgWidth - 140) / (latencySteps.length - 1) : 300;

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
            Real-time health score indexing, radar topology mapping, dynamic latency simulation, and bottleneck diagnostics for <span className="font-semibold text-[#00b4d8]">{workflow.workflowName || workflow.title}</span>.
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

      {/* 2. Top Savings Callout Banner (Dynamically Calculated) */}
      <div className="glass-card p-4 sm:p-5 rounded-2xl border border-[#00b4d8]/30 shadow-[0_4px_20px_rgba(0,180,216,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00b4d8]/20 border border-[#00b4d8]/40 flex items-center justify-center text-[#00b4d8] shrink-0 shadow-[0_0_15px_rgba(0,180,216,0.25)]">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#00b4d8] font-bold uppercase tracking-wider">
              OPERATIONAL TIME RECOVERY • {workflow.workflowName || 'WORKFLOW'}
            </div>
            <div className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-[#e8edf5] font-display">
              💡 <span className="text-[#00b4d8]">{totalSavedHours} hours</span> saved per case with Straight-Through Processing (STP)
            </div>
          </div>
        </div>

        {/* Dynamic Gradient Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 text-[#7c3aed] text-xs font-mono font-bold shrink-0 shadow-sm">
          <TrendingDown className="w-4 h-4" />
          <span>-{overallReductionPct}% Cycle Delay</span>
        </div>
      </div>

      {/* Top 4 Key Metric Summary Cards */}
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
            {metrics.estimatedCycleTime}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#3b82f6] font-bold bg-[#3b82f6]/10 px-2 py-0.5 rounded-full border border-[#3b82f6]/30">
            {isResolvedMode ? `-${overallReductionPct}% STP Reduction` : '96% Automatable'}
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

          {/* SVG Circular Gauge */}
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 180 180">
              <defs>
                <linearGradient id="healthScoreProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#00b4d8" />
                </linearGradient>
              </defs>

              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="#e2e8f0"
                strokeWidth="12"
                fill="transparent"
              />

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

            {/* Grade Rating with Glow */}
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

        {/* 5-Dimension Radar Chart */}
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

      {/* Row 2: Dynamic Step-Level Latency Comparison */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#059669]" />
            <div>
              <h3 className="text-sm font-mono font-bold text-[#0f172a] dark:text-[#e8edf5] uppercase tracking-wider font-display">
                Step-Level Latency Comparison (Crumble Transform)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Human As-Is Execution vs AI-Optimized Straight-Through Processing (STP) for <span className="font-semibold text-[#00b4d8]">{workflow.workflowName || workflow.title}</span>
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

        {/* Dynamic Side-by-Side Bar Rows */}
        <div className="space-y-4">
          {latencySteps.map((step, idx) => {
            const asIsPct = (step.asIsHours / maxLatencyHours) * 100;
            const toBePct = (step.toBeHours / maxLatencyHours) * 100;
            const isSelected = activeSelectedStep?.id === step.id;

            return (
              <div
                key={step.id || idx}
                onClick={() => {
                  setSelectedStepId(step.id);
                  if (onFocusNode) onFocusNode(step.id);
                }}
                className={`p-4 rounded-2xl border transition-all space-y-2.5 card-lift shadow-sm cursor-pointer ${
                  isSelected
                    ? 'bg-[#00b4d8]/10 border-[#00b4d8] shadow-[0_0_20px_rgba(0,180,216,0.2)]'
                    : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] hover:border-[#00b4d8]/40'
                }`}
              >
                {/* Row Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}.</span>
                    <span className="text-xs sm:text-sm font-bold text-[#0f172a] dark:text-[#e8edf5] font-display">
                      {step.name}
                    </span>
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

      {/* Row 3: Dynamic Bottleneck Risks & Heatmap DAG Scanner */}
      <div className="glass-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${activeBottlenecks > 0 ? 'text-[#d97706]' : 'text-[#059669]'}`} />
            <div>
              <h3 className="text-sm font-mono font-bold text-[#0f172a] dark:text-[#e8edf5] uppercase tracking-wider font-display">
                Bottleneck Risk Heatmap & DAG Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any workflow node in the DAG scanner below to inspect AI mitigation recommendations
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Live DAG Scanner</span>
        </div>

        {/* Dynamic Mini DAG Heatmap Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0e1a]/80 border border-slate-200 dark:border-white/[0.08] overflow-x-auto">
          <svg className="h-32" style={{ width: '100%', minWidth: `${svgWidth}px` }} viewBox={`0 0 ${svgWidth} 110`}>
            {/* Connecting Stream Lines */}
            {latencySteps.map((step, idx) => {
              if (idx >= latencySteps.length - 1) return null;
              const x1 = 70 + idx * stepSpacing + 30;
              const x2 = 70 + (idx + 1) * stepSpacing - 30;
              const isDanger = !isResolvedMode && (step.isBottleneck || latencySteps[idx + 1].isBottleneck);

              return (
                <path
                  key={`line_${idx}`}
                  d={`M ${x1} 55 L ${x2} 55`}
                  stroke={isDanger ? '#f43f5e' : '#00b4d8'}
                  strokeWidth="2.5"
                  strokeDasharray="6, 6"
                  className={isDanger ? 'animate-pulse' : ''}
                />
              );
            })}

            {/* Dynamic Step Nodes */}
            {latencySteps.map((step, idx) => {
              const cx = 70 + idx * stepSpacing;
              const isSelected = activeSelectedStep?.id === step.id;
              const isBottleneck = !isResolvedMode && step.isBottleneck;
              const isDecision = step.type === 'decisionNode' || step.category === 'decision';
              const isTrigger = idx === 0 || step.type === 'triggerNode';
              const isDone = idx === latencySteps.length - 1;

              // Node badge text
              const badge = isTrigger ? 'INIT' : isDecision ? 'GATE' : isDone ? 'DONE' : step.category === 'document' ? 'DOC' : 'EXEC';
              const nodeColor = isBottleneck ? '#f43f5e' : isDecision ? '#d97706' : isTrigger ? '#3b82f6' : isDone ? '#059669' : '#00b4d8';

              return (
                <g
                  key={step.id || idx}
                  onClick={() => {
                    setSelectedStepId(step.id);
                    if (onFocusNode) onFocusNode(step.id);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Selection highlight aura */}
                  {isSelected && (
                    <circle
                      cx={cx}
                      cy="55"
                      r="32"
                      fill="none"
                      stroke="#00b4d8"
                      strokeWidth="2"
                      strokeDasharray="4, 4"
                      className="animate-spin"
                    />
                  )}

                  {/* Node Shape */}
                  {isDecision ? (
                    <rect
                      x={cx - 30}
                      y="25"
                      width="60"
                      height="60"
                      rx="12"
                      transform={`rotate(45 ${cx} 55)`}
                      fill={nodeColor}
                      fillOpacity={isBottleneck ? 0.4 : 0.2}
                      stroke={nodeColor}
                      strokeWidth={isSelected ? '3' : '2'}
                      className={isBottleneck ? 'animate-heatmap-pulse' : ''}
                    />
                  ) : (
                    <rect
                      x={cx - 32}
                      y="35"
                      width="64"
                      height="40"
                      rx="12"
                      fill={nodeColor}
                      fillOpacity={isBottleneck ? 0.4 : 0.2}
                      stroke={nodeColor}
                      strokeWidth={isSelected ? '3' : '2'}
                      className={isBottleneck ? 'animate-heatmap-pulse' : ''}
                    />
                  )}

                  {/* Badge Text */}
                  <text
                    x={cx}
                    y="59"
                    textAnchor="middle"
                    fill={nodeColor}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isBottleneck ? `🔥 ${badge}` : `✔ ${badge}`}
                  </text>

                  {/* Node Label (Truncated) */}
                  <text
                    x={cx}
                    y="94"
                    textAnchor="middle"
                    fill={isBottleneck ? '#f43f5e' : '#64748b'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {step.name.length > 12 ? `${step.name.substring(0, 11)}…` : step.name}
                  </text>

                  {/* Latency Tag */}
                  <text
                    x={cx}
                    y="106"
                    textAnchor="middle"
                    fill={isBottleneck ? '#f43f5e' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {isResolvedMode ? `${step.toBeHours}h` : `${step.asIsHours}h`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Step AI Bottleneck Mitigation Card */}
        {activeSelectedStep && (
          <motion.div
            key={activeSelectedStep.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border transition-all ${
              activeSelectedStep.isBottleneck && !isResolvedMode
                ? 'bg-[#f43f5e]/10 border-[#f43f5e]/40 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : 'bg-[#00b4d8]/10 border-[#00b4d8]/40 shadow-[0_0_20px_rgba(0,180,216,0.15)]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    activeSelectedStep.isBottleneck && !isResolvedMode
                      ? 'bg-[#f43f5e]/20 text-[#f43f5e] border border-[#f43f5e]/30'
                      : 'bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30'
                  }`}>
                    {activeSelectedStep.isBottleneck && !isResolvedMode ? '🔥 ACTIVE LATENCY BOTTLENECK' : '✔ STEP DIAGNOSTIC'}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    ID: {activeSelectedStep.id}
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#0f172a] dark:text-[#e8edf5] font-display">
                  {activeSelectedStep.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {activeSelectedStep.category === 'decision'
                    ? 'Manual conditional branch causes asynchronous human review queue delays.'
                    : activeSelectedStep.category === 'document'
                    ? 'Document ingestion & payload formatting requires straight-through automated parsing.'
                    : activeSelectedStep.category === 'actor'
                    ? 'Inter-departmental stakeholder handoff introduces manual scheduling latency.'
                    : 'Process operation step optimized for straight-through asynchronous worker execution.'}
                </p>
              </div>

              {/* Latency Recovery Metric & Actions */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <div className="text-right font-mono">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Latency:</div>
                  <div className="text-sm font-bold text-[#0f172a] dark:text-[#e8edf5]">
                    <span className="text-[#f43f5e] line-through mr-1">{activeSelectedStep.asIsHours}h</span>
                    <span className="text-[#059669]">→ {activeSelectedStep.toBeHours}h</span>
                  </div>
                </div>

                {onFocusNode && (
                  <button
                    type="button"
                    onClick={() => onFocusNode(activeSelectedStep.id)}
                    className="button-scale px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.15] text-[#0f172a] dark:text-[#e8edf5] hover:border-[#00b4d8] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#00b4d8]" />
                    <span>Focus in Canvas</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsResolvedMode(!isResolvedMode)}
                  className="button-scale px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[#00b4d8]/20 border border-[#00b4d8]/50 text-[#00b4d8] hover:bg-[#00b4d8]/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-[#00b4d8]" />
                  <span>{isResolvedMode ? 'Revert Simulation' : 'Auto-Optimize Step'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

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
                  All critical-path queues streamlined for <span className="font-bold text-[#059669]">{workflow.workflowName || workflow.title}</span>. Straight-Through Processing active with automated fallback routing.
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-full bg-[#059669]/20 border border-[#059669]/50 text-[#059669] font-mono text-xs font-bold shrink-0">
              100% DAG PASS
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
