import React from 'react';
import { RemoteCursor } from '../../services/collaborationSocket';
import { MousePointer } from 'lucide-react';

interface LiveCursorsOverlayProps {
  cursors: Record<string, RemoteCursor>;
}

export const LiveCursorsOverlay: React.FC<LiveCursorsOverlayProps> = ({ cursors }) => {
  const cursorList = Object.values(cursors);
  if (cursorList.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {cursorList.map((cursor) => {
        if (!cursor.position) return null;

        return (
          <div
            key={cursor.userId}
            className="absolute transition-all duration-150 ease-out flex items-start gap-1"
            style={{
              left: `${cursor.position.x}px`,
              top: `${cursor.position.y}px`,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* SVG Animated Laser Cursor */}
            <svg
              className="w-5 h-5 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              viewBox="0 0 24 24"
              fill={cursor.color || '#00d4ff'}
              stroke="#ffffff"
              strokeWidth="1.5"
            >
              <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" />
            </svg>

            {/* Name & Avatar Pill */}
            <div
              className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-lg flex items-center gap-1 border border-white/20 whitespace-nowrap animate-node-pop"
              style={{ backgroundColor: cursor.color || '#00d4ff' }}
            >
              <span>{cursor.avatar || '👤'}</span>
              <span>{cursor.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
