import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  NodeChange,
  EdgeChange,
  BackgroundVariant,
  useReactFlow,
  ReactFlowInstance,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Workflow, CustomWorkflowNode, CustomWorkflowEdge, WorkflowRun } from '../../types/workflow';
import { TriggerNode } from './CustomNodes/TriggerNode';
import { ActionNode } from './CustomNodes/ActionNode';
import { DecisionNode } from './CustomNodes/DecisionNode';
import { CompletionNode } from './CustomNodes/CompletionNode';
import { ActorNode } from './CustomNodes/ActorNode';
import { DocumentNode } from './CustomNodes/DocumentNode';
import { MilestoneNode } from './CustomNodes/MilestoneNode';
import { AnimatedFlowEdge } from './CustomEdges/AnimatedFlowEdge';
import { StudioControls } from './StudioControls';
import { SwimlaneView } from './SwimlaneView';
import { NodeInspectorModal } from './NodeInspectorModal';
import { ShareAndExportModal } from './ShareAndExportModal';
import { AgentEditModal } from './AgentEditModal';
import { TriggerPanelModal } from '../execution/TriggerPanelModal';
import { RunLogPanel } from '../execution/RunLogPanel';
import { LiveCursorsOverlay } from '../collaboration/LiveCursorsOverlay';
import { NodeCommentsDrawer } from '../collaboration/NodeCommentsDrawer';
import { getLayoutedElements, LayoutDirection } from '../../utils/layoutEngine';
import {
  collaborationSocket,
  CollaboratorUser,
  RemoteCursor,
  NodeComment,
  ApprovalStatus
} from '../../services/collaborationSocket';
import { Play, Sparkles, Terminal, Layers, RefreshCw, ZoomIn, ZoomOut, Maximize2, RotateCcw, Activity } from 'lucide-react';
import { api } from '../../services/api';
import { soundFX } from '../../utils/audioEffects';

interface WorkflowStudioProps {
  workflow: Workflow;
  onUpdateWorkflow: (updated: Workflow) => void;
  onOpenOptimizeModal: () => void;
  onSaveVersion: () => void;
  highlightNodeId?: string | null;
}

// Statically declare custom node and edge types for ReactFlow
const NODE_TYPES = {
  triggerNode: TriggerNode,
  actionNode: ActionNode,
  decisionNode: DecisionNode,
  completionNode: CompletionNode,
  actorNode: ActorNode,
  documentNode: DocumentNode,
  milestoneNode: MilestoneNode,
};

const EDGE_TYPES = {
  animatedFlowEdge: AnimatedFlowEdge,
  smoothstep: AnimatedFlowEdge,
  default: AnimatedFlowEdge,
};

// Inner Canvas Component to leverage ReactFlow hooks
const WorkflowStudioInner: React.FC<WorkflowStudioProps> = ({
  workflow,
  onUpdateWorkflow,
  onOpenOptimizeModal,
  onSaveVersion,
  highlightNodeId
}) => {
  const reactFlow = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Normalize node types based on their semantics
  const normalizedNodes = useMemo(() => {
    const rawNodes = workflow.nodes || [];
    return rawNodes.map((n) => {
      let nodeType = n.type || 'actionNode';
      const labelLower = String(n.data?.label || n.data?.name || n.data?.title || '').toLowerCase();
      const actionType = String(n.data?.actionType || '');
      const category = String(n.data?.category || '');

      if (category === 'trigger' || nodeType === 'triggerNode' || labelLower.includes('order placed') || labelLower.includes('trigger:')) {
        nodeType = 'triggerNode';
      } else if (category === 'completion' || nodeType === 'completionNode' || labelLower.includes('workflow complete') || labelLower.includes('completed')) {
        nodeType = 'completionNode';
      } else if (actionType === 'decision' || nodeType === 'decisionNode' || n.data?.conditionQuestion || labelLower.includes('?')) {
        nodeType = 'decisionNode';
      } else if (nodeType === 'actorNode' || n.data?.role || n.data?.department) {
        nodeType = 'actorNode';
      } else if (nodeType === 'documentNode' || actionType === 'document' || labelLower.includes('payload') || labelLower.includes('document')) {
        nodeType = 'documentNode';
      } else if (nodeType === 'milestoneNode') {
        nodeType = 'milestoneNode';
      } else {
        nodeType = 'actionNode';
      }

      return {
        ...n,
        type: nodeType
      };
    });
  }, [workflow.nodes]);

  // Normalize edge types to use AnimatedFlowEdge with particle flows
  const normalizedEdges: CustomWorkflowEdge[] = useMemo(() => {
    const rawEdges = workflow.edges || [];
    return rawEdges.map((e) => {
      const labelStr = String(e.label || '').toLowerCase();
      const routeType: 'success' | 'failure' | 'conditional' | 'default' = e.data?.routeType || (labelStr.includes('no') || labelStr.includes('reject') ? 'failure' : labelStr.includes('if') || labelStr.includes('condition') ? 'conditional' : 'success');

      return {
        ...e,
        type: 'animatedFlowEdge',
        animated: true,
        data: {
          ...e.data,
          routeType
        }
      };
    });
  }, [workflow.edges]);

  const [nodes, setNodes] = useState<CustomWorkflowNode[]>(normalizedNodes);
  const [edges, setEdges] = useState<CustomWorkflowEdge[]>(normalizedEdges);
  const [currentLayout, setCurrentLayout] = useState<LayoutDirection>('LR');
  const [isBottleneckMode, setIsBottleneckMode] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<CustomWorkflowNode | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAgentEditOpen, setIsAgentEditOpen] = useState<boolean>(false);
  const [isTriggerPanelOpen, setIsTriggerPanelOpen] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentRun, setCurrentRun] = useState<WorkflowRun | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<'canvas' | 'runLog'>('canvas');
  const [executionProgress, setExecutionProgress] = useState<number>(0);

  // Real-Time Collaboration State
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<Record<string, RemoteCursor>>({});
  const [comments, setComments] = useState<NodeComment[]>([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('ready_for_review');

  // Real-Time Socket.io Connection & Event Listeners
  useEffect(() => {
    collaborationSocket.joinWorkflow(workflow.id);

    const unsubUsers = collaborationSocket.onUsersUpdate(({ users }) => {
      setCollaborators(users);
    });

    const unsubCursor = collaborationSocket.onCursorMoved((cursor) => {
      setRemoteCursors((prev) => ({ ...prev, [cursor.userId]: cursor }));
    });

    const unsubCursorLeft = collaborationSocket.onCursorLeft(({ userId }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    const unsubCommentsLoaded = collaborationSocket.onCommentsLoaded(({ comments }) => {
      setComments(comments);
    });

    const unsubCommentAdded = collaborationSocket.onCommentAdded(({ comment }) => {
      setComments((prev) => [...prev, comment]);
      soundFX.playClick();
    });

    const unsubApproval = collaborationSocket.onApprovalStatusUpdated(({ status }) => {
      setApprovalStatus(status);
      soundFX.playChime();
    });

    const unsubWorkflow = collaborationSocket.onWorkflowUpdated(({ workflow: remoteWf }) => {
      if (remoteWf) {
        if (remoteWf.nodes) setNodes(remoteWf.nodes);
        if (remoteWf.edges) setEdges(remoteWf.edges);
      }
    });

    return () => {
      unsubUsers();
      unsubCursor();
      unsubCursorLeft();
      unsubCommentsLoaded();
      unsubCommentAdded();
      unsubApproval();
      unsubWorkflow();
    };
  }, [workflow.id]);

  // Sync state and compute dagre layout when workflow prop changes
  useEffect(() => {
    if (currentLayout === 'SWIMLANE') {
      setNodes(normalizedNodes);
      setEdges(normalizedEdges);
    } else {
      const layouted = getLayoutedElements(normalizedNodes, normalizedEdges, currentLayout, workflow.actors);
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    }
  }, [workflow.id, workflow.version, normalizedNodes, normalizedEdges, currentLayout]);

  // Handle external node highlight
  useEffect(() => {
    if (highlightNodeId) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === highlightNodeId
        }))
      );
    }
  }, [highlightNodeId]);

  // Real-Time Canvas Cursor Movement Broadcast
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    collaborationSocket.sendCursorMove(workflow.id, { x, y });
  };

  // React Flow Handlers
  const onNodesChange = useCallback(
    (changes: NodeChange<CustomWorkflowNode>[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        onUpdateWorkflow({ ...workflow, nodes: updated });
        collaborationSocket.sendWorkflowChange(workflow.id, changes, { ...workflow, nodes: updated });
        return updated;
      });
    },
    [workflow, onUpdateWorkflow]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<CustomWorkflowEdge>[]) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        onUpdateWorkflow({ ...workflow, edges: updated });
        return updated;
      });
    },
    [workflow, onUpdateWorkflow]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      soundFX.playClick();
      setEdges((eds) => {
        const newEdge: CustomWorkflowEdge = {
          ...connection,
          id: `e_${connection.source}_${connection.target}_${Date.now()}`,
          type: 'animatedFlowEdge',
          animated: true,
          data: { routeType: 'success' }
        };
        const updated = addEdge(newEdge, eds) as CustomWorkflowEdge[];
        onUpdateWorkflow({ ...workflow, edges: updated });
        return updated;
      });
    },
    [workflow, onUpdateWorkflow]
  );

  // Node selection & inspection
  const onNodeClick = useCallback((_: React.MouseEvent, node: CustomWorkflowNode) => {
    soundFX.playClick();
    setSelectedNode(node);
    setIsInspectorOpen(true);
  }, []);

  // Edge selection & cycle inspection
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    soundFX.playClick();
  }, []);

  // Hover animations
  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: CustomWorkflowNode) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, isHovered: true } } : n))
    );
  }, []);

  const onNodeMouseLeave = useCallback((_: React.MouseEvent, node: CustomWorkflowNode) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, isHovered: false } } : n))
    );
  }, []);

  // Apply layout direction change
  const handleApplyLayout = (direction: LayoutDirection) => {
    soundFX.playWhoosh();
    setCurrentLayout(direction);
    if (direction === 'SWIMLANE') return;

    const layouted = getLayoutedElements(nodes, edges, direction, workflow.actors);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    setTimeout(() => {
      if (rfInstance) {
        rfInstance.fitView({ padding: 0.25, duration: 600 });
      }
    }, 50);
  };

  // Add custom node manually
  const handleAddNode = (type: 'actionNode' | 'decisionNode' | 'actorNode' | 'documentNode') => {
    soundFX.playClick();
    const id = `step_${Date.now().toString().slice(-4)}`;
    const newNode: CustomWorkflowNode = {
      id,
      type,
      position: { x: 250 + Math.random() * 80, y: 150 + Math.random() * 80 },
      data: {
        label: type === 'decisionNode' ? 'Validation Check?' : type === 'actorNode' ? 'Operations Lead' : type === 'documentNode' ? 'Invoice Payload' : 'New Process Step',
        name: 'New Custom Node',
        actionType: type === 'decisionNode' ? 'operation' : 'function',
        executionLatencyMs: 120,
        status: 'pending',
        category: type === 'decisionNode' ? 'condition' : 'action'
      }
    };

    const updated = [...nodes, newNode];
    setNodes(updated);
    onUpdateWorkflow({ ...workflow, nodes: updated });
    collaborationSocket.sendWorkflowChange(workflow.id, [{ type: 'add', item: newNode }], { ...workflow, nodes: updated });
  };

  // Real-Time Comment Submission
  const handleAddComment = (nodeId: string, text: string) => {
    collaborationSocket.addNodeComment(workflow.id, nodeId, text);
  };

  // Approval Status Change
  const handleApprovalChange = (nextStatus: ApprovalStatus, note?: string) => {
    setApprovalStatus(nextStatus);
    collaborationSocket.updateApprovalStatus(workflow.id, nextStatus, note);
  };

  // Execute Dynamic Workflow Simulation
  const handleRunWorkflow = async (payload: Record<string, any>, dryRun = false) => {
    setIsRunning(true);
    setIsTriggerPanelOpen(false);
    setActiveBottomTab('canvas');
    setExecutionProgress(5);
    soundFX.playWhoosh();

    try {
      const res = await api.triggerWorkflow(workflow.id, payload, dryRun);
      if (res.run) {
        setCurrentRun(res.run);
        const steps = res.run.stepResults || [];
        const total = steps.length || 1;

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          setExecutionProgress(Math.round(((i + 1) / total) * 100));

          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === step.stepId || n.data?.name === step.name || n.data?.label === step.name) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    status: step.status === 'skipped' ? 'skipped' : 'running',
                    executionLatencyMs: step.durationMs
                  }
                };
              }
              return n;
            })
          );

          await new Promise((r) => setTimeout(r, 220));

          setNodes((nds) =>
            nds.map((n) => {
              if (n.id === step.stepId || n.data?.name === step.name || n.data?.label === step.name) {
                return {
                  ...n,
                  data: {
                    ...n.data,
                    status: step.status === 'skipped' ? 'skipped' : 'success',
                    executionLatencyMs: step.durationMs
                  }
                };
              }
              return n;
            })
          );
        }
        soundFX.playCelebration();
      }
    } catch (e) {
      setExecutionProgress(100);
      soundFX.playCelebration();
    } finally {
      setIsRunning(false);
    }
  };

  // Reset View handler
  const handleResetView = () => {
    soundFX.playClick();
    if (rfInstance) {
      rfInstance.fitView({ padding: 0.25, duration: 800 });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Studio Header Action Controls */}
      <StudioControls
        currentLayout={currentLayout}
        onApplyLayout={handleApplyLayout}
        isBottleneckMode={isBottleneckMode}
        onToggleBottleneckMode={() => setIsBottleneckMode(!isBottleneckMode)}
        onAddNode={handleAddNode}
        onSaveVersion={onSaveVersion}
        onOptimize={onOpenOptimizeModal}
        onExport={() => setIsExportOpen(true)}
        collaborators={collaborators}
        commentsCount={comments.length}
        onOpenComments={() => setIsCommentsOpen(true)}
        approvalStatus={approvalStatus}
        onApprovalStatusChange={handleApprovalChange}
      />

      {/* Progress Bar when Workflow is running */}
      {isRunning && (
        <div className="glass-card p-3 border border-[#00d4ff]/40 shadow-[0_0_25px_rgba(0,212,255,0.25)] animate-node-pop">
          <div className="flex items-center justify-between text-xs font-mono text-[#00d4ff] font-bold mb-1.5">
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 animate-spin text-[#00d4ff]" />
              <span>DYNAMIC DAG EXECUTION IN PROGRESS...</span>
            </span>
            <span>{executionProgress}%</span>
          </div>
          <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.1]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#10b981] transition-all duration-300 shadow-[0_0_12px_#00d4ff]"
              style={{ width: `${executionProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Canvas & Studio Workspace */}
      <div
        ref={containerRef}
        onMouseMove={handleCanvasMouseMove}
        className="relative w-full h-[620px] rounded-2xl glass-card overflow-hidden border border-white/[0.08] shadow-2xl"
      >
        {/* Real-time Multiplayer Cursors Overlay */}
        <LiveCursorsOverlay cursors={remoteCursors} />

        {/* Floating Reset View & Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-[#0a0e1a]/90 backdrop-blur-[20px] border border-white/[0.12] rounded-2xl shadow-xl">
          <button
            type="button"
            onClick={() => reactFlow.zoomIn({ duration: 300 })}
            className="p-2 rounded-xl text-slate-300 hover:text-[#00d4ff] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => reactFlow.zoomOut({ duration: 300 })}
            className="p-2 rounded-xl text-slate-300 hover:text-[#00d4ff] hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="p-2 rounded-xl text-slate-300 hover:text-[#10b981] hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono font-bold"
            title="Reset & Fit View"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Studio Canvas View */}
        {currentLayout === 'SWIMLANE' ? (
          <div className="p-6 h-full overflow-auto">
            <SwimlaneView
              workflow={workflow}
              onSelectNode={(nodeId) => {
                const n = nodes.find((x) => x.id === nodeId);
                if (n) {
                  setSelectedNode(n);
                  setIsInspectorOpen(true);
                }
              }}
            />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            onInit={setRfInstance}
            snapToGrid={true}
            snapGrid={[15, 15]}
            fitView
            fitViewOptions={{ padding: 0.25, duration: 600 }}
            minZoom={0.2}
            maxZoom={2.0}
            zoomOnScroll={true}
            zoomOnPinch={true}
            panOnScroll={false}
            className="bg-[#0a0e1a]"
          >
            {/* Background Dot Grid */}
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color="rgba(255, 255, 255, 0.08)"
            />

            {/* MiniMap in bottom-left corner with custom cyber styling */}
            <MiniMap
              nodeColor={(n) => {
                if (n.type === 'triggerNode') return '#10b981';
                if (n.type === 'decisionNode') return '#f59e0b';
                if (n.type === 'completionNode') return '#00d4ff';
                if (n.type === 'actorNode') return '#3b82f6';
                if (n.type === 'documentNode') return '#7c3aed';
                return '#2563eb';
              }}
              maskColor="rgba(10, 14, 26, 0.85)"
              className="rounded-2xl border border-white/[0.1] shadow-2xl backdrop-blur-[20px] !bg-[#0a0e1a]/90 !bottom-4 !left-4"
            />
          </ReactFlow>
        )}
      </div>

      {/* Node Inspector Modal */}
      <NodeInspectorModal
        node={selectedNode}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onUpdateNode={(nodeId, updatedData) => {
          setNodes((nds) =>
            nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...updatedData } } : n))
          );
          onUpdateWorkflow({
            ...workflow,
            nodes: nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, ...updatedData } } : n
            )
          });
        }}
      />

      {/* 4-in-1 Share & Export Hub (PNG, SVG, JSON, Branded PDF, Share Link, Embed Code, Social) */}
      <ShareAndExportModal
        workflow={workflow}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        zoomLevel={reactFlow.getZoom()}
      />

      {/* Real-time Node Comments Thread Drawer */}
      <NodeCommentsDrawer
        workflow={workflow}
        comments={comments}
        selectedNodeId={selectedNode?.id || null}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        onAddComment={handleAddComment}
        onSelectNode={(nodeId) => {
          const n = nodes.find((x) => x.id === nodeId);
          if (n) {
            setSelectedNode(n);
            setIsInspectorOpen(true);
          }
        }}
      />

      {/* AI Workflow Natural Language Edit Modal */}
      <AgentEditModal
        workflow={workflow}
        isOpen={isAgentEditOpen}
        onClose={() => setIsAgentEditOpen(false)}
        onApplyDraft={(updated) => {
          onUpdateWorkflow(updated);
          setNodes(updated.nodes || []);
          setEdges(updated.edges || []);
        }}
      />

      {/* Dynamic Workflow Trigger / Input Form Modal */}
      <TriggerPanelModal
        workflow={workflow}
        isOpen={isTriggerPanelOpen}
        onClose={() => setIsTriggerPanelOpen(false)}
        onRunWorkflow={handleRunWorkflow}
        isRunning={isRunning}
      />
    </div>
  );
};

export const WorkflowStudio: React.FC<WorkflowStudioProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowStudioInner {...props} />
    </ReactFlowProvider>
  );
};
