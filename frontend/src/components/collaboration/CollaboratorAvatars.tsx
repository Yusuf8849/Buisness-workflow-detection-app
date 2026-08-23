import React from 'react';
import { CollaboratorUser } from '../../services/collaborationSocket';
import { Users, Eye, Sparkles } from 'lucide-react';

interface CollaboratorAvatarsProps {
  users: CollaboratorUser[];
  onOpenTeamShareModal?: () => void;
}

export const CollaboratorAvatars: React.FC<CollaboratorAvatarsProps> = ({
  users,
  onOpenTeamShareModal
}) => {
  // Pre-populate with simulated active team members if only 1 user online
  const displayUsers = users.length > 1 ? users : [
    ...users,
    { id: 'sim_1', name: 'Sarah Chen (Lead Architect)', avatar: '👩‍💼', color: '#10b981', role: 'Process Architect' },
    { id: 'sim_2', name: 'Alex Kumar (Ops Reviewer)', avatar: '👨‍💻', color: '#7c3aed', role: 'Compliance Lead' }
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Active Viewing Badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300">
        <Eye className="w-3.5 h-3.5 text-[#00d4ff] animate-pulse" />
        <span>{displayUsers.length} viewing</span>
      </div>

      {/* Stacked Avatars */}
      <div className="flex items-center -space-x-2 overflow-hidden py-1">
        {displayUsers.slice(0, 4).map((user, idx) => (
          <div
            key={user.id || idx}
            className="relative inline-block rounded-full ring-2 ring-[#0a0e1a] group cursor-pointer"
            title={`${user.name} • ${user.role}`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md font-bold transition-transform group-hover:scale-110 group-hover:z-10"
              style={{ backgroundColor: `${user.color}25`, borderColor: user.color, borderWidth: 1.5 }}
            >
              <span>{user.avatar || '👤'}</span>
            </div>

            {/* Active Online Pulse Indicator */}
            <span
              className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-1 ring-[#0a0e1a] animate-pulse"
              style={{ backgroundColor: user.color }}
            />

            {/* Tooltip on Hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
              <div className="px-2.5 py-1 rounded-xl bg-[#0a0e1a]/95 border border-white/[0.15] shadow-xl text-[10px] font-mono whitespace-nowrap text-slate-200">
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-slate-400 text-[9px]">{user.role}</p>
              </div>
            </div>
          </div>
        ))}

        {displayUsers.length > 4 && (
          <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.15] flex items-center justify-center text-[10px] font-mono text-slate-300 font-bold ring-2 ring-[#0a0e1a]">
            +{displayUsers.length - 4}
          </div>
        )}
      </div>

      {/* Share / Invite Teammates button */}
      {onOpenTeamShareModal && (
        <button
          type="button"
          onClick={onOpenTeamShareModal}
          className="px-2.5 py-1.5 rounded-xl bg-[#00d4ff]/15 hover:bg-[#00d4ff]/25 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
          title="Share & Invite Collaborators"
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden md:inline">+ Invite</span>
        </button>
      )}
    </div>
  );
};
