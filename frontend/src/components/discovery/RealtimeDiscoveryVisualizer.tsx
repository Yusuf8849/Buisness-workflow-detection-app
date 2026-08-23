import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, Grid } from '@react-three/drei';
import * as THREE from 'three';
import {
  Sparkles,
  Cpu,
  GitMerge,
  HelpCircle,
  Network,
  Zap,
  CheckCircle2,
  Users,
  FileText,
  Layers,
  ArrowRight,
  Filter,
  Flame,
  Activity,
  Bot
} from 'lucide-react';
import { SceneNode } from '../common/ThreeDScene';

interface RealtimeDiscoveryVisualizerProps {
  rawText?: string;
  isAnalyzing: boolean;
  currentStage?: number;
  onComplete?: () => void;
}

const DEMO_TEXT = `Customer submits a loan application with KYC identification documents and financial records. Operations team receives the application and initiates document verification against government registries. If the documents are incomplete or invalid, the customer is notified via SMS and the application is routed to the Exception Queue. Once documents are fully verified, the underwriter assesses credit risk score and debt-to-income metrics. If approved, the disbursement instruction is automatically triggered to the core banking ledger for straight-through settlement.`;

const STAGES_CONFIG = [
  {
    id: 1,
    title: 'Scene 01 • Text Ingestion & Funnel Flow',
    desc: 'Raw business prose flows into neural token stream',
    thought: '🤔 Ingesting unstructured SOP prose... parsing 68 tokens into semantic stream',
    icon: Filter,
    color: '#00d4ff'
  },
  {
    id: 2,
    title: 'Scene 02 • Entity & Schema Extraction',
    desc: 'Extracting Actors, Actions, Documents & Decisions',
    thought: '🔍 Detecting Actors & Stakeholders... 3 found [Customer, Operations, Underwriter]',
    icon: Sparkles,
    color: '#7c3aed'
  },
  {
    id: 3,
    title: 'Scene 03 • 3D Topology Construction',
    desc: 'Instantiating graph nodes and drawing relationship paths',
    thought: '⚡ Analyzing Dependencies... 12 relationships mapped, 2 conditional decision gates isolated',
    icon: GitMerge,
    color: '#10b981'
  },
  {
    id: 4,
    title: 'Scene 04 • DAG Crystallization & STP Optimization',
    desc: 'Final DAG crystallizes with zero cycles and STP optimization',
    thought: '💎 Optimizing Straight-Through Paths... 94% latency reduction achieved! 0 cycles confirmed',
    icon: Zap,
    color: '#ec4899'
  }
];

const DISCOVERY_NODES: SceneNode[] = [
  {
    id: 'n1',
    name: 'Customer Applicant',
    type: 'actor',
    color: '#3b82f6',
    emissiveColor: '#3b82f6',
    position: [-6, 2, 0],
    role: 'Primary Initiator',
    target: 'Submits Loan Application',
    connections: ['n2', 'n3']
  },
  {
    id: 'n2',
    name: 'KYC & ID Payload',
    type: 'document',
    color: '#7c3aed',
    emissiveColor: '#7c3aed',
    position: [-6, -2, 0],
    role: 'Identity Payload',
    target: 'MongoDB "orders" schema',
    connections: ['n4']
  },
  {
    id: 'n3',
    name: 'Submit Application',
    type: 'action',
    color: '#10b981',
    emissiveColor: '#10b981',
    position: [-2.5, 2, 0],
    role: 'Intake Event',
    target: 'formCreate:orders',
    connections: ['n4']
  },
  {
    id: 'n4',
    name: 'VerifyKYC()',
    type: 'action',
    color: '#10b981',
    emissiveColor: '#10b981',
    position: [0.5, 2, 0],
    role: 'Automated OCR Check',
    target: 'CustomFunction:VerifyKYC',
    connections: ['n5']
  },
  {
    id: 'n5',
    name: 'Documents Valid?',
    type: 'decision',
    color: '#f59e0b',
    emissiveColor: '#f59e0b',
    position: [3.5, 2, 0],
    role: 'Validation Gate',
    condition: 'status == "verified"',
    connections: ['n6', 'n7']
  },
  {
    id: 'n6',
    name: 'Exception SMS Loop',
    type: 'action',
    color: '#f43f5e',
    emissiveColor: '#f43f5e',
    position: [3.5, -2, 0],
    role: 'Exception Desk',
    target: 'NotificationService',
    connections: []
  },
  {
    id: 'n7',
    name: 'DisburseWire()',
    type: 'action',
    color: '#00d4ff',
    emissiveColor: '#00d4ff',
    position: [6.5, 2, 0],
    role: 'Core Ledger Settlement',
    target: 'STPOperation:DisburseWire',
    connections: []
  }
];

// 3D Mini Node for Real-time Graph Generation
const ProgressiveNodeMesh: React.FC<{
  node: SceneNode;
  visibleCount: number;
  index: number;
}> = ({ node, visibleCount, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isVisible = index < visibleCount;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (node.type === 'action') {
      meshRef.current.rotation.x += delta * 0.9;
      meshRef.current.rotation.y += delta * 1.1;
    } else if (node.type === 'decision') {
      meshRef.current.rotation.y += delta * 1.3;
    } else if (node.type === 'actor') {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!isVisible) return null;

  let geometry = <sphereGeometry args={[0.7, 32, 32]} />;
  if (node.type === 'action') {
    geometry = <boxGeometry args={[1.0, 1.0, 1.0]} />;
  } else if (node.type === 'decision') {
    geometry = <octahedronGeometry args={[0.9]} />;
  } else if (node.type === 'document') {
    geometry = <boxGeometry args={[1.2, 1.5, 0.2]} />;
  }

  return (
    <group position={node.position}>
      <pointLight color={node.emissiveColor} intensity={2.0} distance={6} />
      <mesh ref={meshRef}>
        {geometry}
        <meshPhysicalMaterial
          color={node.color}
          emissive={node.emissiveColor}
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1.0}
        />
      </mesh>
      <Html position={[0, 1.4, 0]} center distanceFactor={16} className="pointer-events-none">
        <div className="px-2 py-0.5 rounded-xl bg-[#0a0e1a]/90 border border-white/[0.15] text-[10px] font-mono text-white whitespace-nowrap shadow-lg backdrop-blur-md">
          {node.name}
        </div>
      </Html>
    </group>
  );
};

export const RealtimeDiscoveryVisualizer: React.FC<RealtimeDiscoveryVisualizerProps> = ({
  rawText = DEMO_TEXT,
  isAnalyzing,
  onComplete
}) => {
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [progress, setProgress] = useState<number>(15);
  const [visibleNodesCount, setVisibleNodesCount] = useState<number>(2);
  const [highlightWordIndex, setHighlightWordIndex] = useState<number>(0);

  const words = useMemo(() => rawText.split(/\s+/), [rawText]);

  // Real-time animation pipeline timer
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentScene(4);
      setProgress(100);
      setVisibleNodesCount(DISCOVERY_NODES.length);
      return;
    }

    setProgress(15);
    setCurrentScene(1);
    setVisibleNodesCount(1);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1.8;
      });
    }, 100);

    const sceneTimer = setInterval(() => {
      setCurrentScene((prev) => {
        if (prev < 4) {
          const next = prev + 1;
          setVisibleNodesCount(next * 2);
          return next;
        }
        return 4;
      });
    }, 1800);

    const wordTimer = setInterval(() => {
      setHighlightWordIndex((prev) => (prev + 1) % words.length);
    }, 120);

    return () => {
      clearInterval(progressTimer);
      clearInterval(sceneTimer);
      clearInterval(wordTimer);
    };
  }, [isAnalyzing, words.length]);

  const activeSceneInfo = STAGES_CONFIG[currentScene - 1] || STAGES_CONFIG[0];
  const SceneIcon = activeSceneInfo.icon;

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] space-y-6 relative overflow-hidden">
      {/* Top Header & Hypnotic Progress Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center text-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.35)]">
              <SceneIcon className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#00d4ff] uppercase font-bold tracking-wider">
                  REAL-TIME AI RECONSTRUCTION ENGINE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#00d4ff]/15 text-[#00d4ff] text-[10px] font-mono border border-[#00d4ff]/30">
                  {Math.round(progress)}% SYNTHESIZED
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#e8edf5] font-display">
                {activeSceneInfo.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span>Active AST Synthesizer</span>
          </div>
        </div>

        {/* 3. Animated Gradient Progress Bar with Shimmer */}
        <div className="relative w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden border border-white/[0.08]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#10b981] relative"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          >
            <div className="absolute inset-0 shimmer-effect opacity-70" />
          </motion.div>
        </div>
      </div>

      {/* 4. AI Thought Bubble Banner ("What AI is Thinking") */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="p-3.5 rounded-2xl bg-[#0a0e1a]/85 border border-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.15)] backdrop-blur-[20px] flex items-center gap-3 text-xs font-mono text-cyan-200"
        >
          <div className="w-7 h-7 rounded-xl bg-[#00d4ff]/20 border border-[#00d4ff]/40 flex items-center justify-center text-[#00d4ff] shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <span className="font-medium leading-relaxed">{activeSceneInfo.thought}</span>
        </motion.div>
      </AnimatePresence>

      {/* 1. Split-Screen Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[420px]">
        {/* LEFT (5 cols): Word-by-Word Real-Time Tokenizer & Highlighting */}
        <div className="lg:col-span-5 rounded-2xl bg-black/40 border border-white/[0.08] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 mb-3">
              <span className="text-[11px] font-mono text-[#00d4ff] font-bold uppercase">
                Raw Input Stream
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Word {highlightWordIndex + 1}/{words.length}
              </span>
            </div>

            {/* Words Stream with Real-time Keyword Highlighting */}
            <div className="text-xs sm:text-sm font-mono leading-relaxed space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <p className="text-slate-300">
                {words.map((word, idx) => {
                  const isCurrent = idx === highlightWordIndex;
                  const isActor = /customer|operations|underwriter/i.test(word);
                  const isAction = /submits|initiates|verification|notified|routed|assesses|triggered/i.test(word);
                  const isDecision = /if|approved|invalid|complete/i.test(word);
                  const isDoc = /application|kyc|records|sms/i.test(word);

                  let colorClass = 'text-slate-300';
                  let bgClass = '';

                  if (isCurrent) {
                    bgClass = 'bg-[#00d4ff] text-[#0a0e1a] font-extrabold px-1 rounded-sm shadow-[0_0_12px_#00d4ff]';
                  } else if (isActor) {
                    colorClass = 'text-[#38bdf8] font-bold bg-[#38bdf8]/15 px-1 rounded-sm';
                  } else if (isAction) {
                    colorClass = 'text-[#10b981] font-bold bg-[#10b981]/15 px-1 rounded-sm';
                  } else if (isDecision) {
                    colorClass = 'text-[#f59e0b] font-bold bg-[#f59e0b]/15 px-1 rounded-sm';
                  } else if (isDoc) {
                    colorClass = 'text-purple-300 font-bold bg-[#7c3aed]/15 px-1 rounded-sm';
                  }

                  return (
                    <span key={idx} className={`inline-block mr-1.5 transition-all duration-150 ${bgClass || colorClass}`}>
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          {/* Token Legend */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06] text-[10px] font-mono text-slate-300">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> Actor [3]</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#10b981]" /> Action [5]</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rotate-45 rounded-xs bg-[#f59e0b]" /> Decision Gate [2]</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-xs bg-[#7c3aed]" /> Document [2]</span>
          </div>
        </div>

        {/* RIGHT (7 cols): The 3D Graph Building Node-by-Node in Real Time */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] relative overflow-hidden shadow-inner flex flex-col">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0a0e1a]/90 border border-white/[0.12] text-[10px] font-mono text-[#00d4ff] backdrop-blur-md">
            <Activity className="w-3 h-3 text-[#00d4ff] animate-pulse" />
            <span>3D DAG GRAPH: {visibleNodesCount}/{DISCOVERY_NODES.length} NODES MATERIALIZED</span>
          </div>

          <div className="w-full flex-1 min-h-[350px]">
            <Canvas
              camera={{ position: [0, 1, 14], fov: 48 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[0, 0, 10]} intensity={2.0} color="#00d4ff" />

              <OrbitControls
                enableZoom={true}
                enablePan={false}
                rotateSpeed={0.5}
                maxDistance={25}
                minDistance={8}
              />

              <Grid
                position={[0, -3.5, 0]}
                args={[30, 30]}
                cellColor="#00d4ff"
                sectionColor="#7c3aed"
                cellThickness={0.5}
                sectionThickness={1.0}
                fadeDistance={20}
              />

              {/* Connecting Lines for visible nodes */}
              {DISCOVERY_NODES.slice(0, visibleNodesCount).map((node, i) => {
                if (i === 0) return null;
                const prev = DISCOVERY_NODES[i - 1];
                return (
                  <Line
                    key={`line_${prev.id}_${node.id}`}
                    points={[prev.position, node.position]}
                    color="#00d4ff"
                    lineWidth={2}
                    transparent
                    opacity={0.6}
                  />
                );
              })}

              {/* Progressively Rendered 3D Nodes */}
              {DISCOVERY_NODES.map((node, idx) => (
                <ProgressiveNodeMesh
                  key={node.id}
                  node={node}
                  visibleCount={visibleNodesCount}
                  index={idx}
                />
              ))}
            </Canvas>
          </div>

          {/* Shimmer Crystallization Status */}
          {currentScene === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[#10b981]/20 border border-[#10b981]/50 text-[#10b981] text-xs font-mono font-bold flex items-center justify-between backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>100% Topologically Valid DAG (0 Cycles Detected)</span>
              </div>
              <span className="text-[10px] text-emerald-200">Ready for Studio</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeDiscoveryVisualizer;
