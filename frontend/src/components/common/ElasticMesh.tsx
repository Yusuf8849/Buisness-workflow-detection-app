import React, { useEffect, useRef } from 'react';
import './ElasticMesh.css';

export interface ElasticMeshProps {
  color1?: string;
  color2?: string;
  highlight?: string;
  gridColor?: string;
  showGrid?: boolean;
  gridDensity?: number;
  gridOpacity?: number;
  opacity?: number;
  borderRadius?: number;
  stiffness?: number;
  damping?: number;
  grabRadius?: number;
  pull?: number;
  wobble?: number;
  tilt?: number;
  shading?: number;
  resolution?: number;
  interaction?: 'hover' | 'drag' | 'click';
  enabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface MeshPoint {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

export const ElasticMesh: React.FC<ElasticMeshProps> = ({
  color1 = '#00d4ff',
  color2 = '#7c3aed',
  highlight = '#ffffff',
  gridColor = '#00d4ff',
  showGrid = true,
  gridDensity = 15,
  gridOpacity,
  opacity = 0.15,
  borderRadius = 25,
  stiffness = 0.04,
  damping = 0.25,
  grabRadius = 0.7,
  pull = 0.35,
  wobble = 6,
  tilt = 10,
  shading = 0.4,
  resolution = 20,
  interaction = 'hover',
  enabled = true,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resolvedGridOpacity = gridOpacity ?? opacity ?? 0.15;

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points: MeshPoint[][] = [];
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let animationFrameId: number | null = null;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isActive: false
    };

    const effectiveGridSize = Math.max(16, Math.floor(600 / Math.max(5, gridDensity)));
    const effectiveRadius = Math.max(60, grabRadius * 200);
    const effectiveForce = Math.max(10, pull * 80);
    const effectiveDamping = Math.min(0.96, Math.max(0.7, 1 - damping * 0.3));

    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / effectiveGridSize) + 2;
      rows = Math.ceil(height / effectiveGridSize) + 2;

      points = [];
      const offsetX = (width - (cols - 1) * effectiveGridSize) / 2;
      const offsetY = (height - (rows - 1) * effectiveGridSize) / 2;

      for (let r = 0; r < rows; r++) {
        const rowPoints: MeshPoint[] = [];
        for (let c = 0; c < cols; c++) {
          const originX = offsetX + c * effectiveGridSize;
          const originY = offsetY + r * effectiveGridSize;
          rowPoints.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            phase: (c * 0.4 + r * 0.3)
          });
        }
        points.push(rowPoints);
      }
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.22;
      mouse.y += (mouse.targetY - mouse.y) * 0.22;

      const t = time * 0.0015;

      // Update points with spring dynamics + wobble
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];

          // Living ambient breathing wobble
          const waveX = Math.sin(t + p.phase) * (wobble * 0.5);
          const waveY = Math.cos(t * 0.8 + p.phase) * (wobble * 0.5);
          const targetOriginX = p.originX + waveX;
          const targetOriginY = p.originY + waveY;

          // Mouse elastic repulsion
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < effectiveRadius && dist > 0 && mouse.isActive) {
            const force = (1 - dist / effectiveRadius) * effectiveForce;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }

          // Spring force towards rest origin
          const fx = (targetOriginX - p.x) * stiffness;
          const fy = (targetOriginY - p.y) * stiffness;

          p.vx = (p.vx + fx) * effectiveDamping;
          p.vy = (p.vy + fy) * effectiveDamping;

          p.x += p.vx;
          p.y += p.vy;
        }
      }

      if (showGrid) {
        // Gradient stroke across canvas
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, gridColor);
        gradient.addColorStop(1, color2);

        ctx.strokeStyle = gradient;
        ctx.globalAlpha = resolvedGridOpacity;
        ctx.lineWidth = 1.0;

        // Draw horizontal grid lines
        for (let r = 0; r < rows; r++) {
          ctx.beginPath();
          for (let c = 0; c < cols; c++) {
            const p = points[r][c];
            if (c === 0) {
              ctx.moveTo(p.x, p.y);
            } else {
              ctx.lineTo(p.x, p.y);
            }
          }
          ctx.stroke();
        }

        // Draw vertical grid lines
        for (let c = 0; c < cols; c++) {
          ctx.beginPath();
          for (let r = 0; r < rows; r++) {
            const p = points[r][c];
            if (r === 0) {
              ctx.moveTo(p.x, p.y);
            } else {
              ctx.lineTo(p.x, p.y);
            }
          }
          ctx.stroke();
        }

        // Highlight nodes near mouse
        ctx.fillStyle = highlight;
        ctx.globalAlpha = resolvedGridOpacity * 2.2;
        for (let r = 0; r < rows; r += 2) {
          for (let c = 0; c < cols; c += 2) {
            const p = points[r][c];
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dist < effectiveRadius * 1.2) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isActive = true;
    };

    const handlePointerLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.isActive = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      initGrid();
    });
    resizeObserver.observe(container);
    initGrid();

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver.disconnect();
    };
  }, [
    color1,
    color2,
    highlight,
    gridColor,
    showGrid,
    gridDensity,
    gridOpacity,
    borderRadius,
    stiffness,
    damping,
    grabRadius,
    pull,
    wobble,
    tilt,
    shading,
    resolution,
    interaction,
    enabled
  ]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className={`elastic-mesh ${className}`}
      style={{
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        ...style
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ElasticMesh;
