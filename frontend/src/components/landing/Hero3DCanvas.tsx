import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';
import { ElasticMesh } from '../common/ElasticMesh';

interface ProcessNode3D {
  mesh: THREE.Mesh;
  light: THREE.PointLight;
  type: 'actor' | 'action' | 'decision' | 'document' | 'system';
  name: string;
  chaoticPos: THREE.Vector3;
  organizedPos: THREE.Vector3;
  velocity: THREE.Vector3;
}

export const Hero3DCanvas: React.FC = memo(() => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [organizeProgress, setOrganizeProgress] = useState<number>(0.3);
  const [activeNodeName, setActiveNodeName] = useState<string>('Hover over nodes to illuminate process');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 580;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.035);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x07090e, 0);
    container.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, 2, 50);
    pointLight.position.set(0, 10, 15);
    scene.add(pointLight);

    // Node definitions (Actors, Actions, Decisions, Documents, Systems)
    const nodeDefinitions = [
      { name: 'Customer (Applicant)', type: 'actor' as const, color: 0x3b82f6, orgPos: new THREE.Vector3(-12, 3, 0) },
      { name: 'Submit Application', type: 'action' as const, color: 0x00f0ff, orgPos: new THREE.Vector3(-8, 3, 0) },
      { name: 'KYC & ID Payload', type: 'document' as const, color: 0x10b981, orgPos: new THREE.Vector3(-8, -2, 0) },
      { name: 'Operations Team', type: 'actor' as const, color: 0x3b82f6, orgPos: new THREE.Vector3(-4, 3, 0) },
      { name: 'Verify Documents', type: 'action' as const, color: 0x00f0ff, orgPos: new THREE.Vector3(-1, 3, 0) },
      { name: 'Decision: Complete?', type: 'decision' as const, color: 0xa855f7, orgPos: new THREE.Vector3(3, 3, 0) },
      { name: 'Exception Queue', type: 'action' as const, color: 0xf59e0b, orgPos: new THREE.Vector3(3, -3, 0) },
      { name: 'Underwriter Risk Score', type: 'action' as const, color: 0x00f0ff, orgPos: new THREE.Vector3(7, 3, 0) },
      { name: 'Decision: Approved?', type: 'decision' as const, color: 0xa855f7, orgPos: new THREE.Vector3(11, 3, 0) },
      { name: 'Finance Disbursement', type: 'action' as const, color: 0x10b981, orgPos: new THREE.Vector3(15, 3, 0) },
      { name: 'Core Banking System', type: 'system' as const, color: 0xec4899, orgPos: new THREE.Vector3(15, -2, 0) },
    ];

    const nodes3D: ProcessNode3D[] = [];
    const meshesGroup = new THREE.Group();
    scene.add(meshesGroup);

    // Build 3D geometries
    nodeDefinitions.forEach((def) => {
      let geometry: THREE.BufferGeometry;
      if (def.type === 'actor') {
        geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.6, 16);
      } else if (def.type === 'decision') {
        geometry = new THREE.OctahedronGeometry(1.2);
      } else if (def.type === 'document') {
        geometry = new THREE.BoxGeometry(1.4, 1.8, 0.2);
      } else {
        geometry = new THREE.BoxGeometry(1.6, 1.2, 1.2);
      }

      const material = new THREE.MeshPhysicalMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.8,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);

      const chaoticPos = new THREE.Vector3(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 12
      );

      mesh.position.copy(chaoticPos);
      meshesGroup.add(mesh);

      const light = new THREE.PointLight(def.color, 0.8, 6);
      light.position.copy(chaoticPos);
      scene.add(light);

      nodes3D.push({
        mesh,
        light,
        type: def.type,
        name: def.name,
        chaoticPos,
        organizedPos: def.orgPos,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03, 0),
      });
    });

    // Particle field
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 50;
      particlePositions[i + 1] = (Math.random() - 0.5) * 30;
      particlePositions[i + 2] = (Math.random() - 0.5) * 30;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation Loop
    let animationFrameId: number;
    let targetProgress = 0.3;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Interpolate progress smoothly
      const currentVal = organizeProgress;

      nodes3D.forEach((n, idx) => {
        const targetPos = new THREE.Vector3().lerpVectors(n.chaoticPos, n.organizedPos, currentVal);

        if (currentVal < 0.8) {
          targetPos.x += Math.sin(Date.now() * 0.0015 + idx) * 0.4;
          targetPos.y += Math.cos(Date.now() * 0.0012 + idx) * 0.4;
        }

        n.mesh.position.lerp(targetPos, 0.05);
        n.light.position.copy(n.mesh.position);

        n.mesh.rotation.x += 0.008;
        n.mesh.rotation.y += 0.012;
      });

      particles.rotation.y += 0.0006;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [organizeProgress]);

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden glass-card border border-white/[0.08] shadow-2xl">
      {/* Elastic Mesh Interactive Background Layer */}
      <ElasticMesh color1="#00d4ff" color2="#7c3aed" opacity={0.18} />

      {/* Three.js canvas mount point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Chaos-to-Order Control Slider */}
      <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#0a0e1a]/85 backdrop-blur-[24px] border border-white/[0.12] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
            Process State:
          </span>
          <span className="text-xs font-mono text-slate-300">
            {organizeProgress < 0.35
              ? '🌋 0% Chaotic Raw Prose'
              : organizeProgress < 0.7
              ? '⚡ 50% AI Synthesizing Graph'
              : '💎 100% Structured Process DAG'}
          </span>
        </div>

        {/* Interactive Progress Slider */}
        <div className="flex items-center gap-3 w-full sm:w-72">
          <span className="text-[10px] font-mono text-slate-400">Chaos</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={organizeProgress}
            onChange={(e) => setOrganizeProgress(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-[#00d4ff]"
          />
          <span className="text-[10px] font-mono text-cyan-400 font-bold">Order</span>
        </div>
      </div>

      {/* Top Legend */}
      <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <div className="w-3 h-3 rounded-full bg-[#00d4ff] animate-pulse shadow-[0_0_10px_#00d4ff]" />
          <span className="font-mono text-xs text-cyan-300">{activeNodeName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Actor
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00d4ff] inline-block" /> Action
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Decision
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Artifact
          </span>
        </div>
      </div>
    </div>
  );
});

Hero3DCanvas.displayName = 'Hero3DCanvas';
export default Hero3DCanvas;
