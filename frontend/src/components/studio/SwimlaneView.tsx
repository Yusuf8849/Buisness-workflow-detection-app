import React from 'react';
import { Workflow, Actor } from '../../types/workflow';
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SwimlaneViewProps {
  workflow: Workflow;
  onSelectNode: (nodeId: string) => void;
}

export const SwimlaneView: React.FC<SwimlaneViewProps> = ({ workflow, onSelectNode }) => {
  const actors = workflow.actors || [];
  const nodes = workflow.nodes || [];

  // Group nodes by actor
  const actorGroups = new Map<string, typeof nodes>();

  actors.forEach(actor => {
    actorGroups.set(actor.name, []);
  });

  nodes.forEach(node => {
    const actorName = node.data?.actor || actors[0]?.name || 'Operations Team';
    if (!actorGroups.has(actorName)) {
      actorGroups.set(actorName, []);
    }
    actorGroups.get(actorName)!.push(node);
  });

  return (
    <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl space-y-6 overflow-x-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
            DEPARTMENT & ACTOR SWIMLANES
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {actors.length} Lanes • {nodes.length} Activities Grouped
        </span>
      </div>

      <div className="space-y-4 min-w-[700px]">
        {Array.from(actorGroups.entries()).map(([actorName, actorNodes], laneIdx) => {
          const actorInfo = actors.find(a => a.name.toLowerCase() === actorName.toLowerCase()) || {
            name: actorName,
            role: 'Department / Role',
            color: '#3b82f6'
          };

          return (
            <div
              key={actorName}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700"
            >
              {/* Lane Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: actorInfo.color }}
                  />
                  <h4 className="text-sm font-bold text-slate-100">{actorInfo.name}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">({actorInfo.role})</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {actorNodes.length} Operations
                </span>
              </div>

              {/* Lane Cards / Step sequence */}
              <div className="flex items-center gap-3 overflow-x-auto py-2">
                {actorNodes.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-2">No direct operations assigned in this sequence.</div>
                ) : (
                  actorNodes.map((node, i) => {
                    const isBottleneck = node.data?.isBottleneck;
                    const isDecision = node.type === 'decisionNode';

                    return (
                      <React.Fragment key={node.id}>
                        <div
                          onClick={() => onSelectNode(node.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 shrink-0 min-w-[200px] max-w-[240px] ${
                            isBottleneck
                              ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : isDecision
                              ? 'bg-purple-950/20 border-purple-500/40 hover:border-purple-300'
                              : 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                            <span className="truncate">{node.type === 'decisionNode' ? 'DECISION' : 'ACTION'}</span>
                            <span>{node.data?.duration || '1 hr'}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-100 line-clamp-2">
                            {node.data?.label || node.data?.title}
                          </div>
                          {isBottleneck && (
                            <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1 font-medium">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span className="truncate">Bottleneck Risk</span>
                            </div>
                          )}
                        </div>
                        {i < actorNodes.length - 1 && (
                          <span className="text-slate-600 font-mono text-xs shrink-0">►</span>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
