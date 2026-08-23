import React from 'react';
import { Zap } from 'lucide-react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  height?: string | number;
  width?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  height,
  width
}) => {
  let shapeClass = 'rounded-2xl';
  if (variant === 'circular') shapeClass = 'rounded-full';
  if (variant === 'text') shapeClass = 'rounded-lg h-4';

  const style: React.CSSProperties = {};
  if (height) style.height = height;
  if (width) style.width = width;

  return (
    <div
      className={`shimmer-effect border border-white/[0.06] ${shapeClass} ${className}`}
      style={style}
    />
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="glass-card p-6 space-y-4 rounded-2xl border border-white/[0.08]"
        >
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="w-24 h-5" />
            <Skeleton variant="circular" className="w-6 h-6" />
          </div>
          <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
          <div className="space-y-2 pt-2">
            <Skeleton variant="text" className="w-full h-3" />
            <Skeleton variant="text" className="w-4/5 h-3" />
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <Skeleton variant="text" className="w-16 h-4" />
            <Skeleton variant="rectangular" className="w-28 h-8 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

// 2. Spinners with FlowIntel Logo Animation
export const LogoSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text = 'Processing Neural Graph...'
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  const iconMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-6">
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Gradient Ring */}
        <div className={`${sizeMap[size]} rounded-2xl bg-gradient-to-tr from-[#00d4ff] via-[#7c3aed] to-[#10b981] p-[2px] animate-spin shadow-[0_0_30px_rgba(0,212,255,0.4)]`}>
          <div className="w-full h-full rounded-2xl bg-[#0a0e1a]" />
        </div>

        {/* Center Pulsing Logo Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className={`${iconMap[size]} text-[#00d4ff] fill-current animate-pulse`} />
        </div>
      </div>

      {text && (
        <span className="text-xs font-mono text-[#00d4ff] font-bold tracking-wider uppercase animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

// 2. Progress Indicator with Gradient Fill
export const GradientProgressBar: React.FC<{ progress: number; label?: string }> = ({
  progress,
  label
}) => {
  return (
    <div className="w-full space-y-1.5 font-mono">
      {label && (
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>{label}</span>
          <span className="text-[#00d4ff] font-bold">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#10b981] transition-all duration-300 shadow-[0_0_12px_rgba(0,212,255,0.5)]"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
