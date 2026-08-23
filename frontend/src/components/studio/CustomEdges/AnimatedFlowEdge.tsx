import React, { memo, useState } from 'react';
import {
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
  BaseEdge,
  MarkerType
} from '@xyflow/react';

export const AnimatedFlowEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
  selected
}: EdgeProps<any>) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
    borderRadius: 24
  });

  const routeType = data?.routeType || 'default';
  const isRunning = data?.isRunning;
  const isOptimized = data?.isOptimized || routeType === 'success';
  const isConditional = routeType === 'conditional' || data?.condition || (label && String(label).toLowerCase().includes('if'));
  const isSelected = selected || isHovered;

  // Enterprise Edge Theme: Base #94a3b8, Active #3b82f6, Hover #00b4d8
  let strokeColor = isHovered ? '#00b4d8' : isRunning ? '#3b82f6' : '#94a3b8';
  let particleColor = isHovered ? '#00b4d8' : '#3b82f6';
  let glowColor = isHovered ? 'rgba(0, 180, 216, 0.6)' : isRunning ? 'rgba(59, 130, 246, 0.5)' : 'rgba(148, 163, 184, 0.3)';

  if (isOptimized || (label && (String(label).toLowerCase().includes('yes') || String(label).toLowerCase().includes('on') || String(label).toLowerCase().includes('formcreate') || String(label).toLowerCase().includes('dispatched')))) {
    strokeColor = isHovered ? '#00b4d8' : '#10b981';
    particleColor = '#10b981';
    glowColor = 'rgba(16, 185, 129, 0.6)';
  } else if (isConditional) {
    strokeColor = isHovered ? '#00b4d8' : '#f59e0b';
    particleColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.6)';
  } else if (routeType === 'failure' || routeType === 'exception' || (label && (String(label).toLowerCase().includes('no') || String(label).toLowerCase().includes('reject')))) {
    strokeColor = isHovered ? '#00b4d8' : '#f43f5e';
    particleColor = '#f43f5e';
    glowColor = 'rgba(244, 63, 94, 0.6)';
  }

  const particleSpeed = isRunning ? '1.0s' : '2.2s';
  const markerId = `arrowhead-custom-${id}`;

  return (
    <>
      <defs>
        {/* Crisp Solid SVG Arrowhead pointing forward */}
        <marker
          id={markerId}
          markerWidth="14"
          markerHeight="14"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 1 2 L 10 6 L 1 10 L 3 6 z"
            fill={isSelected ? '#00b4d8' : strokeColor}
            stroke={isSelected ? '#00b4d8' : strokeColor}
            strokeWidth="1"
          />
        </marker>
      </defs>

      {/* 1. Invisible wider hit-box path for effortless hovering and clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={32}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer', pointerEvents: 'all' }}
      />

      {/* 2. Ambient Outer Glow Track */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 8 : 4}
        strokeOpacity={isSelected ? 0.45 : 0.18}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: `blur(${isSelected ? '4px' : '2px'})`
        }}
      />

      {/* 3. Main Solid Visible Connecting Line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={isSelected ? '#00b4d8' : strokeColor}
        strokeWidth={isSelected ? 3.5 : 2.5}
        strokeOpacity={1.0}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={isConditional ? '8, 6' : undefined}
        style={{
          ...style,
          filter: `drop-shadow(0 0 6px ${glowColor})`,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease'
        }}
        markerEnd={`url(#${markerId})`}
      />

      {/* 4. High-Energy Primary Flowing Particle */}
      <circle r={isSelected ? 4.5 : 3.5} fill={particleColor} style={{ filter: `drop-shadow(0 0 6px ${particleColor})` }}>
        <animateMotion
          dur={particleSpeed}
          repeatCount="indefinite"
          path={edgePath}
          rotate="auto"
        />
      </circle>

      {/* 5. Bright Core White Sparkle */}
      <circle r={1.5} fill="#ffffff">
        <animateMotion
          dur={particleSpeed}
          repeatCount="indefinite"
          path={edgePath}
          rotate="auto"
        />
      </circle>

      {/* Edge Condition / State Label Badge */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all'
            }}
            className="nodrag nopan"
          >
            <div
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight shadow-md transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#00b4d8] text-white border border-white/50 scale-105 shadow-[0_0_12px_rgba(0,180,216,0.5)]'
                  : 'bg-white/90 text-slate-800 border border-slate-300'
              }`}
            >
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

AnimatedFlowEdge.displayName = 'AnimatedFlowEdge';
