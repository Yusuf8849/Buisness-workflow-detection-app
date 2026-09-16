import React, { useState, useEffect, lazy, Suspense, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Workflow, WorkflowTemplate, ProjectContext } from './types/workflow';
import { api } from './services/api';
import { DEFAULT_MOCK_WORKFLOW, MOCK_TEMPLATES, DEFAULT_PROJECT_CONTEXT, INITIAL_DEMO_TEXT } from './services/mockData';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingHero } from './components/landing/LandingHero';
import { ScrollStorytelling } from './components/landing/ScrollStorytelling';
import { BeforeAfterViewer } from './components/landing/BeforeAfterViewer';
import { SocialProofSection } from './components/landing/SocialProofSection';
import { ProcessInputArea } from './components/discovery/ProcessInputArea';
import { MultiWorkflowCards } from './components/discovery/MultiWorkflowCards';
import { ProjectContextPanel } from './components/discovery/ProjectContextPanel';
import { LivePipelineVisual } from './components/discovery/LivePipelineVisual';
import { LiveTokenHighlighter } from './components/discovery/LiveTokenHighlighter';
import { RealtimeDiscoveryVisualizer } from './components/discovery/RealtimeDiscoveryVisualizer';
import { VersionDiffModal } from './components/history/VersionDiffModal';
import { ToastProvider, useToast } from './components/common/ToastNotification';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { CardSkeleton } from './components/common/SkeletonLoader';
import { AIChatCompanion } from './components/common/AIChatCompanion';
import { PerformanceMonitor } from './components/common/PerformanceMonitor';
import { OnboardingTour } from './components/common/OnboardingTour';
import { Sparkles, ArrowRight, Play, CheckCircle2, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';

// Code-Split Dynamic Route Imports with React.lazy
const LazyWorkflowStudio = lazy(() => import('./components/studio/WorkflowStudio').then(m => ({ default: m.WorkflowStudio })));
const LazyAIInsightsPanel = lazy(() => import('./components/intelligence/AIInsightsPanel').then(m => ({ default: m.AIInsightsPanel })));
const LazyProcessAnalytics = lazy(() => import('./components/analytics/ProcessAnalytics').then(m => ({ default: m.ProcessAnalytics })));
const LazyWorkflowHistory = lazy(() => import('./components/history/WorkflowHistory').then(m => ({ default: m.WorkflowHistory })));
const LazyProcessCompareModal = lazy(() => import('./components/intelligence/ProcessCompareModal').then(m => ({ default: m.ProcessCompareModal })));
const LazyHackathonDemoModal = lazy(() => import('./components/landing/HackathonDemoModal').then(m => ({ default: m.HackathonDemoModal })));
const LazyAgentEditModal = lazy(() => import('./components/studio/AgentEditModal').then(m => ({ default: m.AgentEditModal })));
const LazyTriggerPanelModal = lazy(() => import('./components/execution/TriggerPanelModal').then(m => ({ default: m.TriggerPanelModal })));
const LazyTheMagicMomentModal = lazy(() => import('./components/landing/TheMagicMomentModal').then(m => ({ default: m.TheMagicMomentModal })));
const LazyThreeDBackground = lazy(() => import('./components/common/ThreeDBackground'));

const AppContent: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>(DEFAULT_MOCK_WORKFLOW);
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([DEFAULT_MOCK_WORKFLOW]);
  const [detectedWorkflowsList, setDetectedWorkflowsList] = useState<Workflow[]>([DEFAULT_MOCK_WORKFLOW]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(MOCK_TEMPLATES);
  const [projectContext, setProjectContext] = useState<ProjectContext>(DEFAULT_PROJECT_CONTEXT);
  const [selectedProjectName, setSelectedProjectName] = useState<string>('sample-flow');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [pipelineStage, setPipelineStage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExploding, setIsExploding] = useState<boolean>(false);
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [analyzingInputText, setAnalyzingInputText] = useState<string>(INITIAL_DEMO_TEXT);

  // Modals
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState<boolean>(false);
  const [isAgentEditOpen, setIsAgentEditOpen] = useState<boolean>(false);
  const [isTriggerPanelOpen, setIsTriggerPanelOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [versionDiffWfId, setVersionDiffWfId] = useState<string | null>(null);
  const [isMagicMomentOpen, setIsMagicMomentOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Load initial backend data & MongoDB Project Context (Cached for 5m)
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const [wfs, tpls, ctx] = await Promise.all([
          api.getWorkflows().catch(() => [DEFAULT_MOCK_WORKFLOW]),
          api.getTemplates().catch(() => MOCK_TEMPLATES),
          api.getProjectContext(selectedProjectName).catch(() => DEFAULT_PROJECT_CONTEXT)
        ]);

        if (wfs && wfs.length > 0) {
          setSavedWorkflows(wfs);
          setCurrentWorkflow(wfs[0]);
          setDetectedWorkflowsList(wfs);
        }
        if (tpls && tpls.length > 0) {
          setTemplates(tpls);
        }
        if (ctx) {
          setProjectContext(ctx);
        }
      } catch (err) {
        console.warn('Init fetch fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();

    // Check first-time tutorial
    try {
      const done = localStorage.getItem('flowintel_tutorial_completed');
      if (!done) {
        setTimeout(() => setIsOnboardingOpen(true), 1200);
      }
    } catch (e) {}
  }, [selectedProjectName]);

  // Project Selection change
  const handleProjectChange = async (projectName: string) => {
    setSelectedProjectName(projectName);
    try {
      const ctx = await api.getProjectContext(projectName);
      setProjectContext(ctx);
      showToast({
        title: 'Project Context Loaded',
        message: `Schema collections for ${projectName} loaded from MongoDB.`,
        type: 'info'
      });
    } catch (e) {
      console.warn('Context switch error:', e);
    }
  };

  // Main Detection pipeline trigger with full state reset and dynamic NLP AST parsing
  const handleAnalyze = async (requirementText: string) => {
    // 1. Reset previous workflow detection state immediately
    setAnalyzingInputText(requirementText);
    setDetectedWorkflowsList([]);
    setHighlightNodeId(null);
    setIsAnalyzing(true);
    setPipelineStage(0);

    const stageInterval = setInterval(() => {
      setPipelineStage((prev) => {
        if (prev >= 6) {
          clearInterval(stageInterval);
          return 6;
        }
        return prev + 1;
      });
    }, 450);

    try {
      const result = await api.detectWorkflows(selectedProjectName, requirementText);
      clearInterval(stageInterval);
      setPipelineStage(6);

      setTimeout(() => {
        setDetectedWorkflowsList(result.workflows);
        setCurrentWorkflow(result.workflow);
        setSavedWorkflows((prev) => [result.workflow, ...prev.filter(w => w.id !== result.workflow.id)]);
        setIsAnalyzing(false);
        setIsExploding(true);
        setTimeout(() => setIsExploding(false), 2800);
        setTimeout(() => setIsMagicMomentOpen(true), 400);

        showToast({
          title: 'Workflow Successfully Discovered',
          message: `${result.workflows?.length || 1} distinct workflow(s) extracted from input text with 0 cycles.`,
          type: 'success'
        });
      }, 500);
    } catch (err: any) {
      clearInterval(stageInterval);
      setIsAnalyzing(false);
      showToast({
        title: 'Detection Failed',
        message: err.message || 'Please provide more detailed process requirement text.',
        type: 'error'
      });
    }
  };

  // Handle saving new version
  const handleSaveVersion = async () => {
    try {
      const nextVer = (currentWorkflow.version || 1) + 1;
      const updatedWf = { ...currentWorkflow, version: nextVer, status: 'published' as const };
      await api.updateWorkflow(currentWorkflow.id, updatedWf);
      setCurrentWorkflow(updatedWf);
      setSavedWorkflows((prev) => prev.map(w => w.id === updatedWf.id ? updatedWf : w));
      showToast({
        title: 'Version Published',
        message: `Version v${nextVer}.0 successfully published to MongoDB repository!`,
        type: 'success'
      });
    } catch (e) {
      showToast({
        title: 'Save Failed',
        message: 'Could not save new version snapshot.',
        type: 'error'
      });
    }
  };

  // Handle workflow deletion
  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow snapshot?')) return;
    await api.deleteWorkflow(id);
    setSavedWorkflows((prev) => prev.filter(w => w.id !== id));
    if (currentWorkflow.id === id) {
      const next = savedWorkflows.find(w => w.id !== id) || DEFAULT_MOCK_WORKFLOW;
      setCurrentWorkflow(next);
    }
    showToast({
      title: 'Workflow Snapshot Removed',
      type: 'warning'
    });
  };

  // Live execution handler for floating Run button
  const handleFloatingRun = async (payload: Record<string, any>, dryRun = false) => {
    setIsRunning(true);
    setIsTriggerPanelOpen(false);
    setActiveTab('studio');
    showToast({
      title: 'Workflow Execution Initiated',
      message: dryRun ? 'Evaluating conditions (Dry Run)' : 'Executing dynamic step sequence...',
      type: 'info'
    });

    try {
      const res = await api.triggerWorkflow(currentWorkflow.id, payload, dryRun);
      if (res.run?.status === 'success') {
        showToast({
          title: 'Workflow Run Completed',
          message: `Run finished in ${res.run.totalDurationMs}ms (Status: Success)`,
          type: 'success'
        });
      }
    } catch (err: any) {
      showToast({
        title: 'Execution Failed',
        message: err.message || 'Workflow execution encountered an error.',
        type: 'error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e8edf5] relative overflow-x-hidden font-sans">
      {/* 3D Global Background Canvas (Lazy Loaded for Initial Speed) */}
      <Suspense fallback={null}>
        <LazyThreeDBackground />
      </Suspense>

      {/* Deep Cyber Ambient Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#00d4ff]/15 blur-[140px] animate-orb-float-1" />
        <div className="absolute top-1/3 -right-32 w-[650px] h-[650px] rounded-full bg-[#7c3aed]/15 blur-[120px] animate-orb-float-2" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-[#1a1f36]/30 blur-[110px] animate-orb-float-3" />
        <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-[#10b981]/8 blur-[90px] animate-pulse-slow" />
      </div>

      {/* Relative container for content above orbs */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar with Floating Navigation */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenMagicMoment={() => setIsMagicMomentOpen(true)}
          onOpenTutorial={() => setIsOnboardingOpen(true)}
        />

        {/* Main Content Area with Page Transition Fade/Slide */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          <AnimatePresence mode="wait">
            {/* 1. OVERVIEW (LANDING PAGE) */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="space-y-16"
              >
                <LandingHero
                  onDiscoverClick={() => setActiveTab('discover')}
                  onOpenDemo={() => setIsDemoOpen(true)}
                  onOpenStudio={() => setActiveTab('studio')}
                  workflow={currentWorkflow}
                />

                <SocialProofSection />

                <ScrollStorytelling />

                <BeforeAfterViewer />

                {/* Quick Interactive Studio Sandbox Banner */}
                <div className="glass-card card-lift p-8 sm:p-12 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-3 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono">
                      <Zap className="w-3.5 h-3.5" /> LIVE STUDIO CANVAS READY
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#e8edf5] font-display">
                      Ready to build your next automated workflow?
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed font-sans">
                      Open our full-featured visual DAG editor. Drag nodes, adjust MongoDB schemas, test parameter routing, or simulate AI agent dry-runs.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab('studio')}
                      className="w-full sm:w-auto glass-button-primary button-scale px-8 py-4 rounded-2xl text-[#0a0e1a] font-extrabold text-sm font-mono flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(0,212,255,0.35)] cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Open Workflow Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. WORKFLOW STUDIO (INTERACTIVE CANVAS + INTELLIGENCE PANEL) */}
            {activeTab === 'studio' && (
              <motion.div
                key="studio"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="space-y-6"
              >
                {/* Header Banner */}
                <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono text-[#00d4ff] uppercase font-bold tracking-wider">
                        ACTIVE WORKFLOW STUDIO
                      </span>
                      <span className="px-2.5 py-0.5 rounded-2xl bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30 text-[10px] font-mono">
                        Project: {currentWorkflow.projectName || 'sample-flow'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-[#e8edf5] font-display">
                      {currentWorkflow.workflowName || currentWorkflow.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('discover')}
                      className="glass-card-interactive button-scale px-4 py-2 rounded-2xl text-slate-300 text-xs font-mono hover:text-[#00d4ff] transition-colors cursor-pointer"
                    >
                      + Detect New Requirement
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOptimizeOpen(true)}
                      className="glass-button-purple button-scale px-4 py-2 rounded-2xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>AI Optimize</span>
                    </button>
                  </div>
                </div>

                {/* Grid Layout: Canvas (8 cols) + Insights Panel (4 cols) with Suspense */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8">
                    <Suspense fallback={
                      <div className="h-[600px] rounded-3xl glass-card flex items-center justify-center text-xs font-mono text-[#00d4ff]">
                        Loading React Flow Interactive Studio...
                      </div>
                    }>
                      <LazyWorkflowStudio
                        workflow={currentWorkflow}
                        onUpdateWorkflow={setCurrentWorkflow}
                        onOpenOptimizeModal={() => setIsOptimizeOpen(true)}
                        onSaveVersion={handleSaveVersion}
                        highlightNodeId={highlightNodeId}
                      />
                    </Suspense>
                  </div>

                  <div className="lg:col-span-4">
                    <Suspense fallback={<CardSkeleton />}>
                      <LazyAIInsightsPanel
                        workflow={currentWorkflow}
                        onHighlightNode={(nodeId) => setHighlightNodeId(nodeId)}
                        onOpenOptimizeModal={() => setIsOptimizeOpen(true)}
                      />
                    </Suspense>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. DISCOVER & DETECT (INPUT + PROJECT CONTEXT + MULTI-WORKFLOW CARDS) */}
            {activeTab === 'discover' && (
              <motion.div
                key="discover"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="space-y-6 max-w-4xl mx-auto"
              >
                {/* MongoDB Project Context Panel */}
                <ProjectContextPanel context={projectContext} />

                {/* Requirement Input Area */}
                <ProcessInputArea
                  onAnalyze={handleAnalyze}
                  templates={templates}
                  isAnalyzing={isAnalyzing}
                  selectedProjectName={selectedProjectName}
                  onProjectChange={handleProjectChange}
                />

                {/* Real-time AI Processing Split-Screen Visualizer */}
                {isAnalyzing && (
                  <RealtimeDiscoveryVisualizer
                    rawText={analyzingInputText}
                    workflow={currentWorkflow}
                    isAnalyzing={isAnalyzing}
                    currentStage={pipelineStage}
                  />
                )}

                {/* Live 7-Stage Pipeline Visualizer */}
                {isAnalyzing && (
                  <LivePipelineVisual
                    currentStage={pipelineStage}
                    isProcessing={isAnalyzing}
                  />
                )}

                {/* Multi-Workflow Detection Result Cards */}
                {!isAnalyzing && detectedWorkflowsList.length > 0 && (
                  <MultiWorkflowCards
                    workflows={detectedWorkflowsList}
                    selectedWorkflowId={currentWorkflow.id}
                    onSelectWorkflow={(wf) => setCurrentWorkflow(wf)}
                    onAcceptAndOpenStudio={(wf) => {
                      setCurrentWorkflow(wf);
                      setActiveTab('studio');
                    }}
                  />
                )}

                {/* Interactive Realtime Discovery Sandbox when idle */}
                {!isAnalyzing && (
                  <RealtimeDiscoveryVisualizer
                    rawText={analyzingInputText || currentWorkflow.rawInput || ''}
                    workflow={currentWorkflow}
                    isAnalyzing={false}
                  />
                )}

                {/* Live Token Highlighter Preview */}
                <LiveTokenHighlighter
                  text={analyzingInputText || currentWorkflow.rawInput || ''}
                  tokens={currentWorkflow.tokens}
                />
              </motion.div>
            )}

            {/* 4. PROCESS ANALYTICS */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-[#00d4ff] uppercase font-bold">
                      ENTERPRISE PROCESS INTELLIGENCE & EXECUTION ANALYTICS
                    </span>
                    <h2 className="text-xl font-bold text-[#e8edf5] font-display">
                      {currentWorkflow.workflowName || currentWorkflow.title} — Analytics
                    </h2>
                  </div>
                </div>

                <Suspense fallback={
                  <div className="h-96 rounded-3xl glass-card flex items-center justify-center text-xs font-mono text-[#00d4ff]">
                    Loading Process Analytics Storytelling Engine...
                  </div>
                }>
                  <LazyProcessAnalytics workflow={currentWorkflow} />
                </Suspense>
              </motion.div>
            )}

            {/* 5. HISTORY & VERSIONS (TIMELINE) */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <Suspense fallback={
                  <div className="h-96 rounded-3xl glass-card flex items-center justify-center text-xs font-mono text-[#00d4ff]">
                    Loading Workflow Snapshots Repository...
                  </div>
                }>
                  <LazyWorkflowHistory
                    workflows={savedWorkflows}
                    currentWorkflowId={currentWorkflow.id}
                    onSelectWorkflow={(wf) => {
                      setCurrentWorkflow(wf);
                      setActiveTab('studio');
                      showToast({
                        title: 'Snapshot Restored to Studio',
                        message: `Loaded ${wf.workflowName || wf.title}`,
                        type: 'success'
                      });
                    }}
                    onDeleteWorkflow={handleDeleteWorkflow}
                    onOpenVersionDiff={(id) => setVersionDiffWfId(id)}
                  />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Floating Action Buttons in Bottom-Left Corner */}
      <div className="fixed bottom-6 left-4 sm:left-6 z-30 flex items-center gap-3.5 animate-node-pop">
        {/* Floating AI Edit Agent Button */}
        <button
          type="button"
          onClick={() => setIsAgentEditOpen(true)}
          className="glass-button-purple button-scale px-4 py-3 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] transition-all cursor-pointer min-h-[44px] backdrop-blur-[20px]"
          title="Open Natural Language AI Workflow Editor"
        >
          <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
          <span>AI Edit Agent</span>
        </button>

        {/* Floating Run Workflow Button */}
        <button
          type="button"
          onClick={() => setIsTriggerPanelOpen(true)}
          className="glass-button-primary button-scale px-5 py-3 rounded-2xl text-[#0a0e1a] font-extrabold text-xs font-mono flex items-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.4)] hover:shadow-[0_0_35px_rgba(0,212,255,0.6)] transition-all cursor-pointer min-h-[44px]"
          title="Run Dynamic Workflow Execution"
        >
          <Play className="w-4 h-4 fill-current animate-bounce" />
          <span>Run Workflow</span>
        </button>
      </div>

      {/* 10-Scene Hackathon Demo Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        <LazyHackathonDemoModal
          isOpen={isDemoOpen}
          onClose={() => setIsDemoOpen(false)}
          onOpenStudio={() => {
            setIsDemoOpen(false);
            setActiveTab('studio');
          }}
        />
      </Suspense>

      {/* Process Comparison & AI Optimization Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        <LazyProcessCompareModal
          workflow={currentWorkflow}
          isOpen={isOptimizeOpen}
          onClose={() => setIsOptimizeOpen(false)}
          onApplyOptimized={(optWf) => {
            setCurrentWorkflow(optWf);
            setSavedWorkflows((prev) => [optWf, ...prev.filter(w => w.id !== optWf.id)]);
            setIsOptimizeOpen(false);
            setActiveTab('studio');
            showToast({
              title: 'AI STP Optimization Applied',
              message: 'Workflow topology updated with 94% cycle reduction.',
              type: 'success'
            });
          }}
        />
      </Suspense>

      {/* Version Diff Modal */}
      {versionDiffWfId && (
        <VersionDiffModal
          workflowId={versionDiffWfId}
          isOpen={!!versionDiffWfId}
          onClose={() => setVersionDiffWfId(null)}
          onRestoreVersion={(restoredVersion) => {
            const restoredWf: Workflow = {
              ...currentWorkflow,
              version: restoredVersion.versionNumber || 2,
              nodes: restoredVersion.nodes?.length ? restoredVersion.nodes : currentWorkflow.nodes,
              edges: restoredVersion.edges?.length ? restoredVersion.edges : currentWorkflow.edges
            };
            setCurrentWorkflow(restoredWf);
            setActiveTab('studio');
            setVersionDiffWfId(null);
            showToast({
              title: 'Version Restored',
              message: `Restored version snapshot v${restoredVersion.versionNumber || 2}.0 to Studio`,
              type: 'success'
            });
          }}
        />
      )}

      {/* Natural Language Agent Edit Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        <LazyAgentEditModal
          workflow={currentWorkflow}
          isOpen={isAgentEditOpen}
          onClose={() => setIsAgentEditOpen(false)}
          onApplyDraft={(updatedDraft) => {
            setCurrentWorkflow(updatedDraft);
            setSavedWorkflows((prev) => [updatedDraft, ...prev.filter(w => w.id !== updatedDraft.id)]);
            setIsAgentEditOpen(false);
            showToast({
              title: 'AI Edit Applied to Canvas',
              message: 'Step coordinates and mappings recomputed.',
              type: 'success'
            });
          }}
        />
      </Suspense>

      {/* Trigger Panel Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        <LazyTriggerPanelModal
          workflow={currentWorkflow}
          isOpen={isTriggerPanelOpen}
          onClose={() => setIsTriggerPanelOpen(false)}
          onRunWorkflow={handleFloatingRun}
          isRunning={isRunning}
        />
      </Suspense>

      {/* Floating AI Chat Companion (Partner in Process Optimization) */}
      <AIChatCompanion
        workflow={currentWorkflow}
        onHighlightNode={(nodeId) => {
          setHighlightNodeId(nodeId);
          setActiveTab('studio');
          showToast({
            title: 'Node Located in Studio',
            message: `Inspecting step ${nodeId}`,
            type: 'info'
          });
        }}
        onApplyOptimization={() => setIsOptimizeOpen(true)}
      />

      {/* Climactic Eureka Reveal Magic Moment Modal (Lazy Loaded) */}
      <Suspense fallback={null}>
        <LazyTheMagicMomentModal
          isOpen={isMagicMomentOpen}
          onClose={() => setIsMagicMomentOpen(false)}
          onOpenStudio={() => {
            setIsMagicMomentOpen(false);
            setActiveTab('studio');
          }}
        />
      </Suspense>

      {/* 3-Step Interactive Onboarding Tutorial Tour */}
      <OnboardingTour
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Real-time 60 FPS & Performance Diagnostics Monitor */}
      <PerformanceMonitor />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
};
