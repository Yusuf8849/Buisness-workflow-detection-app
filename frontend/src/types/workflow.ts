import { Node, Edge } from '@xyflow/react';

export type ActionType = 'function' | 'formCreate' | 'formUpdate' | 'formDelete' | 'operation';

export interface StepCondition {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'exists';
  value: any;
}

export interface WorkflowStep {
  stepId: string;
  name: string;
  order: number;
  actionType: ActionType;
  functionName?: string | null;
  schema?: string | null;
  formId?: string | null;
  buttonId?: string | null;
  inputMapping?: Record<string, any>;
  condition?: StepCondition | null;
  onSuccess?: string;
  onFailure?: string;
  description?: string;
  candidate?: string | null;
}

export interface TriggerEvent {
  type: 'formCreate' | 'formUpdate' | 'formDelete' | 'manual' | 'webhook';
  schema: string;
  condition?: any;
}

export interface NodeData {
  label: string;
  title?: string;
  name?: string;
  stepId?: string;
  order?: number;
  actionType?: ActionType;
  functionName?: string | null;
  schema?: string | null;
  formId?: string | null;
  buttonId?: string | null;
  candidate?: string | null;
  inputMapping?: Record<string, any>;
  condition?: StepCondition | null;
  onSuccess?: string;
  onFailure?: string;
  status?: 'idle' | 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'active' | 'completed';
  actor?: string;
  department?: string;
  duration?: string;
  inputs?: string[];
  outputs?: string[];
  isBottleneck?: boolean;
  bottleneckReason?: string | null;
  description?: string;
  category?: string;
  [key: string]: any;
}

export type CustomWorkflowNode = Node<NodeData>;

export interface CustomWorkflowEdge extends Edge {
  data?: {
    condition?: string;
    routeType?: 'success' | 'failure' | 'conditional' | 'default';
    isCriticalPath?: boolean;
  };
}

export interface Actor {
  id: string;
  name: string;
  role: string;
  color: string;
  stepCount?: number;
}

export interface Decision {
  id: string;
  question: string;
  options: string[];
}

export interface Bottleneck {
  nodeId: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  impact: string;
  suggestedFix: string;
}

export interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  relatedNodeIds: string[];
  recommendation: string;
  severity?: string;
}

export interface HealthScore {
  overall: number;
  clarity: number;
  decisionComplexity: number;
  manualDependency: number;
  efficiency: number;
  ownershipClarity: number;
}

export interface WorkflowMetrics {
  stepCount: number;
  actorCount: number;
  decisionCount: number;
  relationshipCount: number;
  estimatedCycleTime: string;
  manualHandoffs: number;
}

export interface TokenHighlight {
  text: string;
  type: 'actor' | 'action' | 'decision' | 'document' | 'department' | 'condition' | 'system';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface PipelineStage {
  step: number;
  name: string;
  status: 'pending' | 'active' | 'completed';
  itemsFound?: number;
  durationMs?: number;
  details?: string;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  versionNumber: number;
  title: string;
  changeSummary: string;
  nodes: CustomWorkflowNode[];
  edges: CustomWorkflowEdge[];
  changes: Array<{
    type: string;
    description: string;
    nodeId?: string;
  }>;
  createdAt: string;
}

export interface Workflow {
  id: string;
  workflowId?: string;
  workflowName?: string;
  title: string;
  description?: string;
  projectName: string;
  triggerEvent: TriggerEvent;
  steps: WorkflowStep[];
  detectedSteps?: WorkflowStep[];
  nodes: CustomWorkflowNode[];
  edges: CustomWorkflowEdge[];
  status: 'draft' | 'published' | 'archived';
  version: number;
  editSource?: 'detection' | 'manual' | 'ai_agent';
  changeSummary?: string;
  actors: Actor[];
  decisions?: Decision[];
  bottlenecks?: Bottleneck[];
  insights?: Insight[];
  healthScore: HealthScore;
  metrics: WorkflowMetrics;
  confidence?: number;
  warnings?: string[];
  rawInput?: string;
  tokens?: TokenHighlight[];
  pipelineStages?: PipelineStage[];
  sourceType?: string;
  tags?: string[];
  isOptimized?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StepResult {
  stepId: string;
  name: string;
  actionType: ActionType;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  durationMs: number;
  error?: string;
  conditionEvaluated?: boolean;
  conditionResult?: boolean;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  projectName: string;
  triggerPayload: Record<string, any>;
  status: 'pending' | 'running' | 'success' | 'failed';
  stepResults: StepResult[];
  startedAt: string;
  completedAt?: string;
  totalDurationMs: number;
  dryRun?: boolean;
}

export interface ProjectContext {
  projectName: string;
  displayName: string;
  description: string;
  schemas: Array<{ name: string; displayName?: string; fields?: Array<{ name: string; type?: string }> }>;
  functions: Array<{ name: string; description?: string; parameters?: Array<{ name: string; type?: string }> }>;
  buttons: Array<{ id: string; name: string; formId?: string; action?: string }>;
}

export interface AgentEditProposal {
  success: boolean;
  originalWorkflowId: string;
  proposedChange: string;
  instruction: string;
  patch: Array<{
    type: string;
    description: string;
    before?: any;
    after?: any;
  }>;
  updatedDraft: Workflow;
  validationResult: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  category: string;
  projectName?: string;
  description: string;
  rawInput: string;
  tags: string[];
}

export interface ProcessComparison {
  asIs: {
    title: string;
    stepCount: number;
    manualHandoffs: number;
    approvalStages: number;
    estimatedCycleTime: string;
    healthScore: number;
    automationRate: string;
  };
  toBe: {
    title: string;
    stepCount: number;
    manualHandoffs: number;
    approvalStages: number;
    estimatedCycleTime: string;
    healthScore: number;
    automationRate: string;
  };
  improvements: Array<{
    metric: string;
    delta: string;
    percent: string;
    positive: boolean;
  }>;
  transformationPoints: Array<{
    stage: string;
    before: string;
    after: string;
  }>;
}
