import dagre from 'dagre';
import { CustomWorkflowNode, CustomWorkflowEdge, Actor } from '../types/workflow';

export type LayoutDirection = 'LR' | 'TB' | 'COMPACT' | 'SWIMLANE';

export const getLayoutedElements = (
  nodes: CustomWorkflowNode[],
  edges: CustomWorkflowEdge[],
  direction: LayoutDirection = 'LR',
  actors: Actor[] = []
): { nodes: CustomWorkflowNode[]; edges: CustomWorkflowEdge[] } => {
  if (!nodes || nodes.length === 0) return { nodes: [], edges: [] };

  if (direction === 'SWIMLANE') {
    return getSwimlaneLayout(nodes, edges, actors);
  }

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction === 'COMPACT' ? 'LR' : direction,
    nodesep: direction === 'COMPACT' ? 60 : 90,
    ranksep: direction === 'COMPACT' ? 90 : 150,
    align: 'UL',
  });

  const getNodeDimensions = (node: CustomWorkflowNode) => {
    if (node.type === 'decisionNode') {
      return { width: 280, height: 180 };
    }
    if (node.type === 'triggerNode' || node.type === 'completionNode') {
      return { width: 280, height: 160 };
    }
    if (node.type === 'actionNode') {
      return { width: 290, height: 160 };
    }
    return { width: 260, height: 140 };
  };

  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeDimensions(node);

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const getSwimlaneLayout = (
  nodes: CustomWorkflowNode[],
  edges: CustomWorkflowEdge[],
  actors: Actor[] = []
): { nodes: CustomWorkflowNode[]; edges: CustomWorkflowEdge[] } => {
  // Determine swimlane vertical lanes by actor
  const actorLanes = new Map<string, number>();
  const uniqueActors = actors.length > 0
    ? actors.map(a => a.name)
    : Array.from(new Set(nodes.map(n => n.data?.actor || 'Operations Team')));

  uniqueActors.forEach((actor, idx) => {
    actorLanes.set(actor.toLowerCase(), idx);
  });

  const laneHeight = 220;
  const startY = 80;
  const stepXDistance = 320;

  const layoutedNodes = nodes.map((node, idx) => {
    const actorName = (node.data?.actor || 'Operations Team').toLowerCase();
    let laneIndex = 0;

    for (const [key, val] of actorLanes.entries()) {
      if (actorName.includes(key) || key.includes(actorName)) {
        laneIndex = val;
        break;
      }
    }

    const xPos = 80 + idx * stepXDistance;
    const yPos = startY + laneIndex * laneHeight + (node.type === 'decisionNode' ? 10 : 30);

    return {
      ...node,
      position: {
        x: xPos,
        y: yPos
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};
