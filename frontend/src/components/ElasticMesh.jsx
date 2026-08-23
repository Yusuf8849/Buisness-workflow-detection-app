import React, { useEffect, useRef } from 'react';
import './ElasticMesh.css';

export const ElasticMesh = ({
  color1 = '#00d4ff', // Cyan
  color2 = '#7c3aed', // Purple
  gridSize = 40,
  repelRadius = 140,
  repelForce = 28,
  stiffness = 0.045,
  damping = 0.88,
  opacity = 0.18,
  className = ''
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points = [];
    let cols = 0;
    let rows = 0;
    let width = 0;
    let height = 0;
    let animationFrameId = null;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isActive: false
    };

    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / gridSize) + 2;
      rows = Math.ceil(height / gridSize) + 2;

      points = [];
      const offsetX = (width - (cols - 1) * gridSize) / 2;
      const offsetY = (height - (rows - 1) * gridSize) / 2;

      for (let r = 0; r < rows; r++) {
        const rowPoints = [];
        for (let c = 0; c < cols; c++) {
          const originX = offsetX + c * gridSize;
          const originY = offsetY + r * gridSize;
          rowPoints.push({
            originX,
            originY,
            x: originX,
            y: originY,
            vx: 0,
            vy: 0,
            phase: (c + r) * 0.35
          });
        }
        points.push(rowPoints);
      }
    };

    const render = (time) => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.2;
      mouse.y += (mouse.targetY - mouse.y) * 0.2;

      const t = time * 0.0018;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];

          const waveX = Math.sin(t + p.phase) * 3.5;
          const waveY = Math.cos(t + p.phase * 0.8) * 3.5;
          const targetOriginX = p.originX + waveX;
          const targetOriginY = p.originY + waveY;

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < repelRadius && dist > 0) {
            const force = (1 - dist / repelRadius) * repelForce;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }

          const fx = (targetOriginX - p.x) * stiffness;
          const fy = (targetOriginY - p.y) * stiffness;

          p.vx = (p.vx + fx) * damping;
          p.vy = (p.vy + fy) * damping;

          p.x += p.vx;
          p.y += p.vy;
        }
      }

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.5, '#38bdf8');
      gradient.addColorStop(1, color2);

      ctx.strokeStyle = gradient;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 1.0;

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

      ctx.fillStyle = color1;
      ctx.globalAlpha = opacity * 1.5;
      for (let r = 0; r < rows; r += 2) {
        for (let c = 0; c < cols; c += 2) {
          const p = points[r][c];
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handlePointerMove = (e) => {
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
  }, [color1, color2, gridSize, repelRadius, repelForce, stiffness, damping, opacity]);

  return (
    <div ref={containerRef} className={`elastic-mesh ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ElasticMesh;
