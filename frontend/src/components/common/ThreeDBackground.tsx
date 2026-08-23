import React, { useRef, useMemo, useEffect, useState, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDBackgroundProps {
  isExploding?: boolean;
}

const NeuralNetworkScene: React.FC<{ isExploding?: boolean; particleCount: number }> = ({ isExploding, particleCount }) => {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const maxLines = particleCount * 2;
  const connectionDistance = 3.2;

  // Soft glowing radial texture for points
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.25, 'rgba(0, 212, 255, 0.9)');
      gradient.addColorStop(0.65, 'rgba(124, 58, 237, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Pre-allocate particle positions, velocities, original positions, and colors
  const { positions, originalPositions, velocities, colors, driftFactors } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const orig = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const drift = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color('#00d4ff');
    const purple = new THREE.Color('#7c3aed');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 0.6) * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.8;
      const z = r * Math.cos(phi) * 0.9;

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      orig[i3] = x;
      orig[i3 + 1] = y;
      orig[i3 + 2] = z;

      vel[i3] = 0;
      vel[i3 + 1] = 0;
      vel[i3 + 2] = 0;

      drift[i3] = (Math.random() - 0.5) * 0.003;
      drift[i3 + 1] = (Math.random() - 0.5) * 0.003;
      drift[i3 + 2] = (Math.random() - 0.5) * 0.003;

      const mixRatio = Math.random();
      const mixedColor = cyan.clone().lerp(purple, mixRatio);
      col[i3] = mixedColor.r;
      col[i3 + 1] = mixedColor.g;
      col[i3 + 2] = mixedColor.b;
    }

    return {
      positions: pos,
      originalPositions: orig,
      velocities: vel,
      colors: col,
      driftFactors: drift,
    };
  }, [particleCount]);

  // Buffers for connecting line segments
  const { linePositions, lineColors } = useMemo(() => {
    const lPos = new Float32Array(maxLines * 6);
    const lCol = new Float32Array(maxLines * 6);
    return { linePositions: lPos, lineColors: lCol };
  }, [maxLines]);

  // Handle Explosion Outward Burst on workflow detection
  useEffect(() => {
    if (isExploding) {
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const px = positions[i3];
        const py = positions[i3 + 1];
        const pz = positions[i3 + 2];
        const dist = Math.sqrt(px * px + py * py + pz * pz) || 1;

        const burstSpeed = 12 + Math.random() * 18;
        velocities[i3] = (px / dist) * burstSpeed + (Math.random() - 0.5) * 5;
        velocities[i3 + 1] = (py / dist) * burstSpeed + (Math.random() - 0.5) * 5;
        velocities[i3 + 2] = (pz / dist) * burstSpeed + (Math.random() - 0.5) * 5;
      }
    }
  }, [isExploding, particleCount, positions, velocities]);

  // 60FPS Frame Update Loop
  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.033);

    // Mouse parallax tilt
    if (groupRef.current) {
      const targetRotX = state.pointer.y * 0.15;
      const targetRotY = state.pointer.x * 0.25;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.04;
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.04;
    }

    // Update particles
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (isExploding || Math.abs(velocities[i3]) > 0.01) {
        positions[i3] += velocities[i3] * clampedDelta;
        positions[i3 + 1] += velocities[i3 + 1] * clampedDelta;
        positions[i3 + 2] += velocities[i3 + 2] * clampedDelta;

        velocities[i3] *= 0.93;
        velocities[i3 + 1] *= 0.93;
        velocities[i3 + 2] *= 0.93;

        positions[i3] += (originalPositions[i3] - positions[i3]) * 0.04;
        positions[i3 + 1] += (originalPositions[i3 + 1] - positions[i3 + 1]) * 0.04;
        positions[i3 + 2] += (originalPositions[i3 + 2] - positions[i3 + 2]) * 0.04;
      } else {
        positions[i3] += driftFactors[i3];
        positions[i3 + 1] += driftFactors[i3 + 1];
        positions[i3 + 2] += driftFactors[i3 + 2];

        if (Math.abs(positions[i3] - originalPositions[i3]) > 1.2) driftFactors[i3] *= -1;
        if (Math.abs(positions[i3 + 1] - originalPositions[i3 + 1]) > 1.2) driftFactors[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2] - originalPositions[i3 + 2]) > 1.2) driftFactors[i3 + 2] *= -1;
      }
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Dynamic pairwise connecting line calculation
    let lineIdx = 0;
    const maxPairsToCheck = Math.min(particleCount, 160);

    for (let i = 0; i < maxPairsToCheck; i++) {
      const i3 = i * 3;
      const x1 = positions[i3];
      const y1 = positions[i3 + 1];
      const z1 = positions[i3 + 2];

      for (let j = i + 1; j < maxPairsToCheck; j++) {
        if (lineIdx >= maxLines) break;

        const j3 = j * 3;
        const x2 = positions[j3];
        const y2 = positions[j3 + 1];
        const z2 = positions[j3 + 2];

        const dx = x1 - x2;
        const dy = y1 - y2;
        const dz = z1 - z2;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
          const lPosIdx = lineIdx * 6;
          linePositions[lPosIdx] = x1;
          linePositions[lPosIdx + 1] = y1;
          linePositions[lPosIdx + 2] = z1;
          linePositions[lPosIdx + 3] = x2;
          linePositions[lPosIdx + 4] = y2;
          linePositions[lPosIdx + 5] = z2;

          const alpha = 1 - dist / connectionDistance;
          const lColIdx = lineIdx * 6;
          lineColors[lColIdx] = colors[i3] * alpha;
          lineColors[lColIdx + 1] = colors[i3 + 1] * alpha;
          lineColors[lColIdx + 2] = colors[i3 + 2] * alpha;
          lineColors[lColIdx + 3] = colors[j3] * alpha;
          lineColors[lColIdx + 4] = colors[j3 + 1] * alpha;
          lineColors[lColIdx + 5] = colors[j3 + 2] * alpha;

          lineIdx++;
        }
      }
    }

    if (linesRef.current) {
      linesRef.current.geometry.setDrawRange(0, lineIdx * 2);
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      linesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Neural Points */}
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
          size={0.45}
          map={particleTexture}
          vertexColors
          transparent
          alphaTest={0.01}
          opacity={0.85}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Dynamic Connecting Glowing Lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={maxLines * 2}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
            count={maxLines * 2}
            array={lineColors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
};

export const ThreeDBackground: React.FC<ThreeDBackgroundProps> = memo(({ isExploding = false }) => {
  const [deviceTier, setDeviceTier] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      // 1. Mobile (< 768px): Hide 3D background
      if (w < 768) {
        setDeviceTier('mobile');
      // 2. Tablet (768px - 1024px): Simplified 3D
      } else if (w <= 1024) {
        setDeviceTier('tablet');
      // 3. Desktop (> 1024px): Full 3D
      } else {
        setDeviceTier('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Breakpoint Optimization: Mobile disables 3D Canvas to guarantee 60fps & save battery
  if (deviceTier === 'mobile') {
    return null;
  }

  const particleCount = deviceTier === 'tablet' ? 180 : 550;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden will-change-transform">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 10]} intensity={1.5} color="#00d4ff" />
        <pointLight position={[-10, 10, -5]} intensity={1.2} color="#7c3aed" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          dampingFactor={0.05}
          rotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
        />

        <NeuralNetworkScene isExploding={isExploding} particleCount={particleCount} />
      </Canvas>
    </div>
  );
});

ThreeDBackground.displayName = 'ThreeDBackground';
export default ThreeDBackground;
