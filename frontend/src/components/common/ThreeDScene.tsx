import React, { useRef, useMemo, useState, useEffect, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Users, Zap, GitFork, FileText, CheckCircle2, AlertTriangle, ArrowRight, Activity, Sparkles, Layers } from 'lucide-react';
import { ElasticMesh } from './ElasticMesh';

export interface SceneNode {
  id: string;
  name: string;
  type: 'actor' | 'action' | 'decision' | 'document';
  color: string;
  emissiveColor: string;
  position: [number, number, number];
  role?: string;
  target?: string;
  condition?: string;
  duration?: string;
  connections: string[]; // Connected target node IDs
}

interface ThreeDSceneProps {
  isAnalyzing?: boolean;
  isExploding?: boolean;
  activeStage?: number;
  customNodes?: SceneNode[];
  onSelectNode?: (node: SceneNode) => void;
}

// Default Process Graph Nodes representing the reconstructed workflow
const DEFAULT_SCENE_NODES: SceneNode[] = [
  {
    id: 'node_1',
    name: 'Customer Applicant',
    type: 'actor',
    color: '#3b82f6',
    emissiveColor: '#3b82f6',
    position: [-8, 2, 0],
    role: 'Primary Stakeholder',
    target: 'Submits Loan Request',
    connections: ['node_2', 'node_3']
  },
  {
    id: 'node_2',
    name: 'KYC & ID Payload',
    type: 'document',
    color: '#7c3aed',
    emissiveColor: '#7c3aed',
    position: [-8, -2, 0],
    role: 'Digital Document Schema',
    target: 'MongoDB "orders" Collection',
    connections: ['node_4']
  },
  {
    id: 'node_3',
    name: 'Submit Application',
    type: 'action',
    color: '#10b981',
    emissiveColor: '#10b981',
    position: [-4, 2, 0],
    role: 'Operations Intake',
    target: 'formCreate:orders',
    duration: '45ms',
    connections: ['node_4']
  },
  {
    id: 'node_4',
    name: 'VerifyKYC()',
    type: 'action',
    color: '#10b981',
    emissiveColor: '#10b981',
    position: [0, 2, 0],
    role: 'Automated OCR & Verification',
    target: 'CustomFunction:VerifyKYC',
    duration: '120ms',
    connections: ['node_5']
  },
  {
    id: 'node_5',
    name: 'Documents Valid?',
    type: 'decision',
    color: '#f59e0b',
    emissiveColor: '#f59e0b',
    position: [4, 2, 0],
    role: 'Conditional Diamond Gate',
    condition: 'status == "verified"',
    connections: ['node_6', 'node_7']
  },
  {
    id: 'node_6',
    name: 'Exception SMS Loop',
    type: 'action',
    color: '#f43f5e',
    emissiveColor: '#f43f5e',
    position: [4, -2.5, 0],
    role: 'Adverse Exception Desk',
    target: 'CustomerNotificationService',
    duration: '60ms',
    connections: []
  },
  {
    id: 'node_7',
    name: 'Credit Risk Score',
    type: 'action',
    color: '#10b981',
    emissiveColor: '#10b981',
    position: [8, 2, 0],
    role: 'Underwriting Evaluation',
    target: 'ScoreAlgorithm',
    duration: '95ms',
    connections: ['node_8']
  },
  {
    id: 'node_8',
    name: 'DisburseWire()',
    type: 'action',
    color: '#00d4ff',
    emissiveColor: '#00d4ff',
    position: [12, 2, 0],
    role: 'Core Ledger Settlement',
    target: 'STPOperation:DisburseWire',
    duration: '35ms',
    connections: []
  }
];

// 3D Interactive Node Component
const InteractiveNodeMesh: React.FC<{
  node: SceneNode;
  isHovered: boolean;
  onHover: (node: SceneNode | null) => void;
  onSelect?: (node: SceneNode) => void;
}> = ({ node, isHovered, onHover, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Smooth hover expansion
    const targetScale = isHovered ? 1.35 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);

    // Continuous auto-rotation for Cubes & Diamonds
    if (node.type === 'action') {
      meshRef.current.rotation.x += delta * 0.8;
      meshRef.current.rotation.y += delta * 1.0;
    } else if (node.type === 'decision') {
      meshRef.current.rotation.y += delta * 1.2;
      meshRef.current.rotation.z += delta * 0.5;
    } else if (node.type === 'actor') {
      meshRef.current.rotation.y += delta * 0.4;
    }

    if (glowRef.current) {
      glowRef.current.rotation.z -= delta * 0.6;
    }
  });

  // Entity Shape Geometry
  let geometry = <sphereGeometry args={[0.75, 32, 32]} />;
  if (node.type === 'action') {
    geometry = <boxGeometry args={[1.1, 1.1, 1.1]} />;
  } else if (node.type === 'decision') {
    geometry = <octahedronGeometry args={[0.95]} />;
  } else if (node.type === 'document') {
    geometry = <boxGeometry args={[1.3, 1.6, 0.25]} />;
  }

  return (
    <group position={node.position}>
      {/* Point light for local illumination */}
      <pointLight
        color={node.emissiveColor}
        intensity={isHovered ? 3.5 : 1.6}
        distance={8}
      />

      {/* Main Node Mesh */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) onSelect(node);
        }}
      >
        {geometry}
        <meshPhysicalMaterial
          color={node.color}
          emissive={node.emissiveColor}
          emissiveIntensity={isHovered ? 0.9 : 0.45}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          wireframe={false}
        />
      </mesh>

      {/* Luminous Pulsing Halo Ring for Decisions & Key Nodes */}
      {(node.type === 'decision' || isHovered) && (
        <mesh ref={glowRef} scale={isHovered ? 1.6 : 1.35}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial
            color={node.emissiveColor}
            transparent
            opacity={isHovered ? 0.7 : 0.35}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* 3D Floating HTML Info Panel on Hover */}
      {isHovered && (
        <Html
          position={[0, 2.2, 0]}
          center
          distanceFactor={18}
          className="pointer-events-none select-none"
        >
          <div className="w-64 p-3.5 rounded-2xl bg-[#0a0e1a]/95 border border-[#00d4ff]/60 shadow-[0_0_35px_rgba(0,212,255,0.4)] backdrop-blur-[24px] text-xs font-mono text-[#e8edf5] space-y-2 animate-node-pop">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.1] pb-1.5">
              <div className="flex items-center gap-1.5">
                {node.type === 'actor' && <Users className="w-3.5 h-3.5 text-[#3b82f6]" />}
                {node.type === 'action' && <Zap className="w-3.5 h-3.5 text-[#10b981]" />}
                {node.type === 'decision' && <GitFork className="w-3.5 h-3.5 text-[#f59e0b]" />}
                {node.type === 'document' && <FileText className="w-3.5 h-3.5 text-purple-300" />}
                <span
                  className="font-bold text-[10px] uppercase tracking-wider"
                  style={{ color: node.color }}
                >
                  {node.type} Node
                </span>
              </div>
              {node.duration && (
                <span className="text-[10px] text-[#10b981] font-bold">{node.duration}</span>
              )}
            </div>

            {/* Title */}
            <div>
              <div className="font-bold text-sm text-[#e8edf5] font-display">{node.name}</div>
              {node.role && <div className="text-[11px] text-slate-300">{node.role}</div>}
            </div>

            {/* Target & Condition */}
            {node.target && (
              <div className="text-[10px] bg-white/[0.05] p-1.5 rounded-xl border border-white/[0.08] text-slate-300 truncate">
                <span className="text-[#00d4ff] font-semibold">Target: </span>
                <span>{node.target}</span>
              </div>
            )}

            {node.condition && (
              <div className="text-[10px] bg-[#f59e0b]/15 p-1.5 rounded-xl border border-[#f59e0b]/30 text-amber-200 truncate">
                <span className="font-semibold">Rule: </span>
                <span>{node.condition}</span>
              </div>
            )}

            <div className="text-[9px] text-slate-400 pt-1 border-t border-white/[0.06] flex items-center justify-between">
              <span>Connected to {node.connections.length} targets</span>
              <span className="text-[#00d4ff]">Live 3D AST</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Dynamic Animated Signal Lines & Pulses between nodes
const DynamicNetworkLines: React.FC<{ nodes: SceneNode[]; isAnalyzing?: boolean }> = ({
  nodes,
  isAnalyzing
}) => {
  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);

  // Pre-calculate line segments
  const lines = useMemo(() => {
    const list: Array<{
      source: [number, number, number];
      target: [number, number, number];
      color: string;
      id: string;
    }> = [];

    nodes.forEach((src) => {
      src.connections.forEach((targetId) => {
        const tgt = nodeMap.get(targetId);
        if (tgt) {
          list.push({
            source: src.position,
            target: tgt.position,
            color: src.type === 'decision' && tgt.type === 'action' && tgt.name.includes('Exception')
              ? '#f43f5e'
              : '#00d4ff',
            id: `${src.id}->${tgt.id}`
          });
        }
      });
    });

    return list;
  }, [nodes, nodeMap]);

  return (
    <group>
      {lines.map((l) => (
        <Line
          key={l.id}
          points={[l.source, l.target]}
          color={l.color}
          lineWidth={2.2}
          transparent
          opacity={0.7}
        />
      ))}
    </group>
  );
};

// Converging Background Neural Constellation
const BackgroundConstellation: React.FC<{ isAnalyzing?: boolean; isExploding?: boolean }> = ({
  isAnalyzing,
  isExploding
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const particleCount = 450;

  const { positions, originalPositions, velocities, colors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const orig = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color('#00d4ff');
    const purple = new THREE.Color('#7c3aed');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = 16 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      const z = r * Math.cos(phi);

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      orig[i3] = x;
      orig[i3 + 1] = y;
      orig[i3 + 2] = z;

      vel[i3] = 0;
      vel[i3 + 1] = 0;
      vel[i3 + 2] = 0;

      const mixed = cyan.clone().lerp(purple, Math.random());
      col[i3] = mixed.r;
      col[i3 + 1] = mixed.g;
      col[i3 + 2] = mixed.b;
    }

    return { positions: pos, originalPositions: orig, velocities: vel, colors: col };
  }, [particleCount]);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.033);

    // Requirement 5: Background rotates SLOWLY while foreground nodes stay oriented
    if (groupRef.current) {
      groupRef.current.rotation.y += clampedDelta * 0.04;
      groupRef.current.rotation.x += clampedDelta * 0.015;
    }

    // Requirement 1: When text is ingested / analyzing, particles CONVERGE into node clusters
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (isAnalyzing) {
        // Gravitate inwards toward the center cluster (0,0,0)
        positions[i3] += (0 - positions[i3]) * 0.04;
        positions[i3 + 1] += (0 - positions[i3 + 1]) * 0.04;
        positions[i3 + 2] += (0 - positions[i3 + 2]) * 0.04;
      } else {
        // Return to natural constellation orbital anchor
        positions[i3] += (originalPositions[i3] - positions[i3]) * 0.02;
        positions[i3 + 1] += (originalPositions[i3 + 1] - positions[i3 + 1]) * 0.02;
        positions[i3 + 2] += (originalPositions[i3 + 2] - positions[i3 + 2]) * 0.02;
      }
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
            count={particleCount}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.35}
          vertexColors
          transparent
          opacity={0.65}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// Main ThreeDScene Component
export const ThreeDScene: React.FC<ThreeDSceneProps> = memo(({
  isAnalyzing = false,
  isExploding = false,
  customNodes = DEFAULT_SCENE_NODES,
  onSelectNode
}) => {
  const [hoveredNode, setHoveredNode] = useState<SceneNode | null>(null);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden glass-card border border-white/[0.08] shadow-2xl bg-[#0a0e1a]">
      {/* Elastic Mesh Interactive Background Layer */}
      <ElasticMesh
        color1="#00d4ff"
        color2="#7c3aed"
        highlight="#ffffff"
        gridColor="#00d4ff"
        showGrid={true}
        gridDensity={15}
        gridOpacity={0.15}
        borderRadius={25}
        stiffness={0.04}
        damping={0.25}
        grabRadius={0.7}
        pull={0.35}
        wobble={6}
        tilt={10}
        shading={0.4}
        resolution={20}
        interaction="hover"
        enabled={true}
      />

      {/* 3D Canvas with relative z-index: 1 on top of ElasticMesh */}
      <Canvas
        camera={{ position: [0, 2, 22], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        className="three-scene w-full h-full relative z-[1]"
      >
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[0, 0, 10]} intensity={2.0} color="#00d4ff" />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          maxDistance={35}
          minDistance={10}
          enablePan={true}
          dampingFactor={0.06}
          rotateSpeed={0.5}
        />

        {/* Requirement 6: Cyber Grid Floor Effect */}
        <Grid
          position={[0, -5, 0]}
          args={[45, 45]}
          cellColor="#00d4ff"
          sectionColor="#7c3aed"
          cellThickness={0.6}
          sectionThickness={1.2}
          fadeDistance={32}
          fadeStrength={1.5}
        />

        {/* Slow Rotating Background Particles with Text Ingestion Convergence */}
        <BackgroundConstellation isAnalyzing={isAnalyzing} isExploding={isExploding} />

        {/* Foreground Nodes Group */}
        <group position={[0, 0, 0]}>
          {/* Dynamic Lines Drawing Between Nodes */}
          <DynamicNetworkLines nodes={customNodes} isAnalyzing={isAnalyzing} />

          {/* Interactive 3D Nodes */}
          {customNodes.map((node) => (
            <InteractiveNodeMesh
              key={node.id}
              node={node}
              isHovered={hoveredNode?.id === node.id}
              onHover={setHoveredNode}
              onSelect={onSelectNode}
            />
          ))}
        </group>
      </Canvas>

      {/* Floating HUD Controls Overlay */}
      <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#0a0e1a]/90 border border-white/[0.12] backdrop-blur-[20px] shadow-xl text-xs font-mono">
          <Activity className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
          <span className="text-[#00d4ff] font-bold">NEURAL AST PROCESS GRAPH</span>
          <span className="text-slate-400">({customNodes.length} Verified Nodes)</span>
        </div>

        {/* Shape Legend Chips */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300 bg-[#0a0e1a]/90 px-3 py-1.5 rounded-2xl border border-white/[0.12] backdrop-blur-[20px] shadow-xl">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Sphere (Actor)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" /> Cube (Action)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rotate-45 rounded-xs bg-[#f59e0b]" /> Diamond (Decision)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#7c3aed]" /> Slab (Artifact)
          </span>
        </div>
      </div>

      {/* Bottom Status / Instructions Bar */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between p-3 rounded-2xl bg-[#0a0e1a]/90 border border-white/[0.1] backdrop-blur-[20px] shadow-xl text-xs font-mono z-10">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
          <span>Click & drag to rotate • Scroll to zoom • Hover on any 3D node to inspect</span>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-[#00d4ff] font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
            <span>Particles Converging to Neural Clusters...</span>
          </div>
        )}
      </div>
    </div>
  );
});

ThreeDScene.displayName = 'ThreeDScene';
export default ThreeDScene;
