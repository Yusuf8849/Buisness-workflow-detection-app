import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, GitMerge, Network, HelpCircle, LayoutGrid, Zap, CheckCircle, ArrowRight, Play } from 'lucide-react';

interface StoryScene {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
}

const STORY_SCENES: StoryScene[] = [
  {
    id: 1,
    badge: 'SCENE 01 • INGESTION',
    title: 'Raw Unstructured Information',
    subtitle: 'Messy text, fragmented emails, and disconnected SOP documents.',
    description: 'Business workflows enter the platform as free-form natural language, SOP docs, customer intake tickets, or meeting transcripts with no predefined schema.',
    icon: FileText
  },
  {
    id: 2,
    badge: 'SCENE 02 • PARSING',
    title: 'AI Entity & Token Understanding',
    subtitle: 'Semantic extraction of roles, verbs, systems, and artifacts.',
    description: 'Neural models identify Actors (Customer, Operations, Manager), Actions (Submits, Verifies, Approves), Documents (KYC, Agreement), and Systems (Core Banking, CRM).',
    icon: Cpu
  },
  {
    id: 3,
    badge: 'SCENE 03 • TOPOLOGY',
    title: 'Relationship & Dependency Inference',
    subtitle: 'Mapping sequential chains and parallel execution pathways.',
    description: 'AI determines that Document Verification strictly precedes Underwriting, and identifies prerequisites, concurrency, and handoff handshakes across teams.',
    icon: GitMerge
  },
  {
    id: 4,
    badge: 'SCENE 04 • SYNTHESIS',
    title: 'Workflow Graph Construction',
    subtitle: 'Transforming semantic dependencies into a Directed Acyclic Graph (DAG).',
    description: 'Nodes are instantiated with durations, input/output schemas, and assigned ownership, generating a mathematical graph representation.',
    icon: Network
  },
  {
    id: 5,
    badge: 'SCENE 05 • BRANCHING',
    title: 'Decision & Condition Detection',
    subtitle: 'Isolating validation gates, exception routes, and approval thresholds.',
    description: 'Conditional statements ("If documents are incomplete...") are translated into decision diamond gates with multi-branch routes for positive and adverse outcomes.',
    icon: HelpCircle
  },
  {
    id: 6,
    badge: 'SCENE 06 • VISUALIZATION',
    title: 'Interactive Diagram Generation',
    subtitle: 'Rendering production-grade swimlanes and zoomable node canvases.',
    description: 'React Flow canvas lays out interactive custom nodes with pan, zoom, custom handles, and real-time editable parameters.',
    icon: LayoutGrid
  },
  {
    id: 7,
    badge: 'SCENE 07 • INTELLIGENCE',
    title: 'Deep Process Intelligence & Bottlenecks',
    subtitle: 'Health Scoring, latency profiling, and autonomous optimization.',
    description: 'Pinpoints single-point-of-failure bottlenecks, calculates workflow health across 5 pillars, and models straight-through-processing automation gains.',
    icon: Zap
  }
];

export const ScrollStorytelling: React.FC = () => {
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const currentScene = STORY_SCENES[activeSceneIndex];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono mb-4 backdrop-blur-[20px]">
          <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
          <span>CHAOS → UNDERSTANDING → WORKFLOW</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#e8edf5] tracking-tight leading-tight font-display">
          Watch AI Understand Your Process <br />
          <span className="bg-gradient-to-r from-[#00d4ff] via-[#38bdf8] to-[#7c3aed] bg-clip-text text-transparent animate-gradient-x">
            Step by Step in Real Time
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300">
          Not just drawing boxes. FlowIntel AI extracts semantic roles, infers dependencies, isolates decision gates, and exposes hidden operational bottlenecks.
        </p>
      </div>

      {/* Main Interactive Storyboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Scene Selector (Timeline) */}
        <div className="lg:col-span-5 space-y-3">
          {STORY_SCENES.map((scene, idx) => {
            const Icon = scene.icon;
            const isActive = idx === activeSceneIndex;

            return (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-[20px] card-lift ${
                  isActive
                    ? 'bg-white/[0.08] border-[#00d4ff] shadow-[0_0_25px_rgba(0,212,255,0.25)] translate-x-2'
                    : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40'
                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-[#00d4ff]">
                        {scene.badge}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono text-slate-300 bg-white/[0.08] px-2.5 py-0.5 rounded-2xl border border-white/[0.08]">
                          ACTIVE SCENE
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold truncate font-display ${isActive ? 'text-[#e8edf5]' : 'text-slate-300'}`}>
                      {scene.title}
                    </h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Dynamic Scene Stage Visualizer */}
        <div className="lg:col-span-7">
          <div className="glass-card p-6 sm:p-8 relative overflow-hidden min-h-[480px] flex flex-col justify-between">
            {/* Scene Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono">
                  {currentScene.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {activeSceneIndex + 1} of {STORY_SCENES.length}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#e8edf5] tracking-tight font-display">
                {currentScene.title}
              </h3>
              <p className="text-sm text-[#00d4ff] font-medium mt-1">
                {currentScene.subtitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                {currentScene.description}
              </p>
            </div>

            {/* Scene Interactive Visual Content */}
            <div className="my-6 p-5 rounded-2xl bg-[#0a0e1a]/80 border border-white/[0.08]">
              <AnimatePresence mode="wait">
                {activeSceneIndex === 0 && (
                  <motion.div
                    key="scene-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2 font-mono text-xs text-slate-300"
                  >
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-slate-400 leading-relaxed italic">
                      "Customer submits loan application with KYC. Operations team verifies documents. If incomplete, customer is contacted. Once verified, underwriter assesses score. If &lt;650, flags risk. Otherwise branch manager approves..."
                    </div>
                    <div className="text-[11px] text-amber-300 flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
                      <span>Unstructured business text ingested with zero syntax constraints.</span>
                    </div>
                  </motion.div>
                )}

                {activeSceneIndex === 1 && (
                  <motion.div
                    key="scene-2"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="text-xs font-mono text-slate-300 leading-relaxed">
                      <span className="bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 px-2 py-0.5 rounded-2xl font-bold">CUSTOMER</span>{' '}
                      <span className="bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/40 px-2 py-0.5 rounded-2xl">submits</span>{' '}
                      <span className="bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 px-2 py-0.5 rounded-2xl">application</span>{' '}
                      to{' '}
                      <span className="bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 px-2 py-0.5 rounded-2xl font-bold">OPERATIONS TEAM</span>.{' '}
                      <span className="bg-[#7c3aed]/20 text-purple-300 border border-[#7c3aed]/40 px-2 py-0.5 rounded-2xl font-bold">IF DOCUMENTS INCOMPLETE</span>, contact customer.
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-[#38bdf8]/30 text-[#38bdf8] font-mono">
                        👤 ACTORS: 4
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-[#00d4ff]/30 text-[#00d4ff] font-mono">
                        ⚡ ACTIONS: 8
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-[#7c3aed]/30 text-purple-300 font-mono">
                        ❓ DECISIONS: 2
                      </div>
                      <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-[#10b981]/30 text-[#10b981] font-mono">
                        📄 ARTIFACTS: 3
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSceneIndex === 2 && (
                  <motion.div
                    key="scene-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-2 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-300">
                      <span className="text-[#38bdf8]">Customer (Submit)</span>
                      <span className="text-[#00d4ff] font-bold">─── [Sequential Payload] ───►</span>
                      <span className="text-[#38bdf8]">Operations (Verify)</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-300">
                      <span className="text-[#38bdf8]">Operations (Verify)</span>
                      <span className="text-[#7c3aed] font-bold">─── [Conditional Gate] ───►</span>
                      <span className="text-purple-300">Complete vs Incomplete</span>
                    </div>
                  </motion.div>
                )}

                {activeSceneIndex === 3 && (
                  <motion.div
                    key="scene-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-4"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto p-2">
                      <div className="px-3.5 py-2 rounded-2xl bg-[#00d4ff]/20 border border-[#00d4ff] text-[#00d4ff] text-xs font-bold shrink-0">
                        Start
                      </div>
                      <span className="text-[#00d4ff]">►</span>
                      <div className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs font-medium shrink-0">
                        Verify Documents
                      </div>
                      <span className="text-[#00d4ff]">►</span>
                      <div className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs font-medium shrink-0">
                        Risk Underwriting
                      </div>
                      <span className="text-[#00d4ff]">►</span>
                      <div className="px-3.5 py-2 rounded-2xl bg-[#10b981]/20 border border-[#10b981] text-[#10b981] text-xs font-bold shrink-0">
                        End
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSceneIndex === 4 && (
                  <motion.div
                    key="scene-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 text-center space-y-3"
                  >
                    <div className="inline-block p-3.5 rounded-2xl bg-[#7c3aed]/20 border-2 border-[#7c3aed] text-purple-200 font-bold text-xs">
                      ◆ DECISION: Documents Complete?
                    </div>
                    <div className="flex justify-center gap-6 text-xs font-mono">
                      <span className="text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-2xl border border-[#10b981]/30">
                        YES ► Proceed to Risk Review
                      </span>
                      <span className="text-[#f43f5e] bg-[#f43f5e]/15 px-2.5 py-1 rounded-2xl border border-[#f43f5e]/30">
                        NO ► Request Resubmission
                      </span>
                    </div>
                  </motion.div>
                )}

                {activeSceneIndex === 5 && (
                  <motion.div
                    key="scene-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3.5 rounded-2xl bg-white/[0.04] border border-[#00d4ff]/40 text-xs text-slate-300 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[#00d4ff] font-mono font-bold">
                      <span>Interactive Workflow Studio Ready</span>
                      <span className="text-[#10b981]">100% DAG VALIDATED</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      React Flow Studio with spring physics, dynamic zoom/pan, custom handles, and drag-and-drop auto-layout.
                    </p>
                  </motion.div>
                )}

                {activeSceneIndex === 6 && (
                  <motion.div
                    key="scene-7"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 gap-3 text-xs"
                  >
                    <div className="p-3 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 text-amber-300">
                      <div className="font-bold">⚠️ Bottleneck Detected</div>
                      <div className="text-[10px] text-slate-300 mt-0.5">Document Verification (+4.5 hrs latency)</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#00d4ff]/15 border border-[#00d4ff]/30 text-[#00d4ff]">
                      <div className="font-bold">📊 Health Score: 82/100</div>
                      <div className="text-[10px] text-slate-300 mt-0.5">Clarity 91% • Ownership 92%</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                disabled={activeSceneIndex === 0}
                onClick={() => setActiveSceneIndex((prev) => Math.max(0, prev - 1))}
                className="glass-card-interactive px-4 py-2 rounded-2xl text-xs font-mono text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ← Previous Stage
              </button>

              <div className="flex items-center gap-1.5">
                {STORY_SCENES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSceneIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                      i === activeSceneIndex ? 'bg-[#00d4ff] w-6' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveSceneIndex((prev) => (prev + 1) % STORY_SCENES.length)}
                className="glass-button-primary px-4 py-2 rounded-2xl text-xs font-mono text-[#0a0e1a] font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>{activeSceneIndex === STORY_SCENES.length - 1 ? 'Restart Journey' : 'Next Stage'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
