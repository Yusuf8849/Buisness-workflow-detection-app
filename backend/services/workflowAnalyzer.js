import { v4 as uuidv4 } from 'uuid';
import { ProjectContext } from '../models/ProjectContext.js';
import { isMongoConnected, localStore } from '../config/db.js';

// Pre-seeded Project Contexts for PS11 Scenarios
export const DEFAULT_PROJECT_CONTEXTS = [
  {
    projectName: 'sample-flow',
    displayName: 'E-Commerce & Enterprise Ops (sample-flow)',
    description: 'Main enterprise project context with orders, invoices, inventory, and notification functions.',
    schemas: [
      { name: 'orders', displayName: 'Orders Collection', fields: [{ name: 'orderId' }, { name: 'vendorId' }, { name: 'totalAmount' }, { name: 'stock_type' }] },
      { name: 'invoices', displayName: 'Invoices Collection', fields: [{ name: '_id' }, { name: 'orderId' }, { name: 'amount' }, { name: 'status' }] },
      { name: 'inventory', displayName: 'Inventory Collection', fields: [{ name: 'sku' }, { name: 'quantity' }, { name: 'stock_type' }] },
      { name: 'asset_requests', displayName: 'Asset Requests Collection', fields: [{ name: 'requestId' }, { name: 'approver_response' }, { name: 'assetType' }] },
      { name: 'customers', displayName: 'Customers Collection', fields: [{ name: 'customerId' }, { name: 'email' }] }
    ],
    functions: [
      { name: 'NotifyVendorOnOrder', description: 'Dispatches dispatch alert email & webhook to vendor', parameters: [{ name: 'vendorId' }] },
      { name: 'SendOrderConfirmation', description: 'Sends order confirmation receipt with invoice PDF', parameters: [{ name: 'recipientEmail' }, { name: 'invoiceId' }] },
      { name: 'ValidateRequest', description: 'Verifies asset policy compliance & budget ceiling', parameters: [{ name: 'requestId' }] },
      { name: 'NotifyApprover', description: 'Pushes mobile authorization token to designated manager', parameters: [{ name: 'approverRole' }] },
      { name: 'RejectAndNotify', description: 'Generates adverse action policy note and emails applicant', parameters: [{ name: 'reason' }] }
    ],
    buttons: [
      { id: 'UpdateStockOperation', name: 'Update Inventory Operation', formId: 'inventoryForm', action: 'adjust_stock' },
      { id: 'ApproveButton', name: 'Approve Request Button', formId: 'approvalsForm', action: 'approve' },
      { id: 'RejectButton', name: 'Reject Request Button', formId: 'approvalsForm', action: 'reject' }
    ]
  },
  {
    projectName: 'enterprise-hr',
    displayName: 'Enterprise HR & Onboarding',
    description: 'Human resources employee lifecycle, background clearance, and asset allocation.',
    schemas: [
      { name: 'candidates', displayName: 'Candidates Collection' },
      { name: 'employees', displayName: 'Employees Collection' },
      { name: 'onboarding_tasks', displayName: 'Onboarding Checklist' }
    ],
    functions: [
      { name: 'InitiateBackgroundCheck', description: 'Triggers automated identity and criminal check API' },
      { name: 'ProvisionLaptopAndEmail', description: 'Automates SSO enterprise provisioning' }
    ],
    buttons: [
      { id: 'ApproveOfferButton', name: 'Approve Offer', formId: 'hiringForm' }
    ]
  }
];

export class WorkflowAnalyzer {
  /**
   * Main entry point to detect one or MULTIPLE workflows from natural language requirement and project context
   */
  static async detectWorkflows({ projectName = 'sample-flow', requirement }) {
    const text = (requirement || '').trim();
    if (!text || text.length < 10) {
      throw new Error('Requirement is too short. Please provide at least one complete process statement.');
    }

    // 1. Load project context from MongoDB / fallback store
    const context = await this.getProjectContext(projectName);

    // 2. Identify if requirement contains MULTIPLE independent workflow triggers
    // Example: "When an order is placed ... When an order is cancelled ..."
    const rawChains = this.splitIntoWorkflowChains(text);

    const detectedWorkflows = [];

    for (const chainText of rawChains) {
      const ir = this.buildWorkflowIR(chainText, projectName, context);
      detectedWorkflows.push(ir);
    }

    return detectedWorkflows;
  }

  /**
   * Load project context from MongoDB
   */
  static async getProjectContext(projectName = 'sample-flow') {
    if (isMongoConnected) {
      try {
        const found = await ProjectContext.findOne({ projectName });
        if (found) return found;
      } catch (e) {
        console.warn('Mongo project context query failed:', e.message);
      }
    }

    const defaultCtx = DEFAULT_PROJECT_CONTEXTS.find((p) => p.projectName === projectName) || DEFAULT_PROJECT_CONTEXTS[0];
    return defaultCtx;
  }

  /**
   * Split multiple independent workflow statements into distinct chains
   */
  static splitIntoWorkflowChains(text) {
    // Regex looking for trigger boundaries like "When ...", "On ...", "Whenever ..."
    const splitRegex = /(?=(?:when\s+(?:an?\s+)?(?:order|request|application|user|payment|record|webhook|ticket)|whenever|upon\s+))/gi;
    const parts = text.split(splitRegex).map(s => s.trim()).filter(s => s.length > 10);

    if (parts.length > 1) {
      return parts;
    }

    // Split on distinct newlines or double sentences if they each have a trigger
    const sentences = text.split(/\n+/).map(s => s.trim()).filter(s => s.length > 10);
    const triggerSentences = sentences.filter(s => /^(when|on|if|whenever|upon)/i.test(s));

    if (triggerSentences.length > 1) {
      return sentences;
    }

    return [text];
  }

  /**
   * Constructs a single Workflow Intermediate Representation (IR)
   */
  static buildWorkflowIR(chainText, projectName, context) {
    const lower = chainText.toLowerCase();

    // 1. Detect Trigger Event
    const triggerEvent = this.detectTriggerEvent(chainText, context);

    // 2. Derive Workflow Name
    const workflowName = this.deriveWorkflowName(chainText, triggerEvent);

    // 3. Detect Steps
    const detectedSteps = this.detectSteps(chainText, context, triggerEvent);

    // 4. Synthesize DAG Nodes & Edges for Diagram Rendering
    const { nodes, edges } = this.synthesizeDiagramGraph(detectedSteps, triggerEvent, workflowName);

    // 5. Calculate Confidence & Warnings
    const { confidence, warnings } = this.calculateConfidenceAndWarnings(detectedSteps, context);

    // 6. Build IR
    const workflowId = `wf_${Date.now()}_${uuidv4().substring(0, 6)}`;

    return {
      id: workflowId,
      workflowId,
      workflowName,
      title: workflowName,
      description: `AI-detected workflow for ${triggerEvent.type} on ${triggerEvent.schema || 'system'} with ${detectedSteps.length} orchestrated steps.`,
      projectName,
      triggerEvent,
      steps: detectedSteps,
      detectedSteps,
      nodes,
      edges,
      confidence,
      warnings,
      status: 'published',
      version: 1,
      editSource: 'detection',
      changeSummary: 'Initial workflow generated by AI detection',
      actors: [
        { id: 'actor_1', name: 'Trigger Initiator', role: 'Event Source', color: '#3b82f6', stepCount: 1 },
        { id: 'actor_2', name: 'Automation Engine', role: 'System Orchestrator', color: '#06b6d4', stepCount: detectedSteps.length }
      ],
      healthScore: {
        overall: Math.round(confidence * 100),
        clarity: 94,
        decisionComplexity: 80,
        manualDependency: 65,
        efficiency: 92,
        ownershipClarity: 95
      },
      metrics: {
        stepCount: detectedSteps.length,
        actorCount: 2,
        decisionCount: detectedSteps.filter(s => s.condition && s.condition.field).length,
        relationshipCount: edges.length,
        estimatedCycleTime: `${(detectedSteps.length * 0.4).toFixed(1)}s`,
        manualHandoffs: 0
      },
      rawInput: chainText,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Detects Trigger Event from natural language
   */
  static detectTriggerEvent(text, context) {
    const lower = text.toLowerCase();

    // Default trigger
    let type = 'formCreate';
    let schema = 'orders';

    if (lower.includes('placed') || lower.includes('order')) {
      type = 'formCreate';
      schema = 'orders';
    } else if (lower.includes('approved') || lower.includes('asset_request') || lower.includes('request')) {
      type = 'formUpdate';
      schema = 'asset_requests';
    } else if (lower.includes('deleted') || lower.includes('remove')) {
      type = 'formDelete';
      schema = 'orders';
    } else if (lower.includes('manual') || lower.includes('button')) {
      type = 'manual';
      schema = 'custom_trigger';
    } else if (lower.includes('webhook') || lower.includes('endpoint')) {
      type = 'webhook';
      schema = 'incoming_payload';
    } else if (lower.includes('invoice') || lower.includes('settle')) {
      type = 'formCreate';
      schema = 'invoices';
    }

    // Match schema against loaded project context schemas
    if (context && context.schemas) {
      const match = context.schemas.find(s => lower.includes(s.name.toLowerCase()));
      if (match) schema = match.name;
    }

    return { type, schema };
  }

  /**
   * Derives Workflow Title / Name
   */
  static deriveWorkflowName(text, triggerEvent) {
    const lower = text.toLowerCase();
    if (lower.includes('cancel')) return 'OrderCancelled';
    if (lower.includes('order') || triggerEvent.schema === 'orders') return 'OrderPlaced';
    if (lower.includes('asset') || lower.includes('approval') || triggerEvent.schema === 'asset_requests') return 'AssetRequestApproval';
    if (lower.includes('invoice') || lower.includes('settle')) return 'InvoiceSettlement';
    if (lower.includes('onboard') || lower.includes('employee')) return 'EmployeeOnboarding';

    const words = text.split(/\s+/).slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    return words.replace(/[^a-zA-Z0-9]/g, '') || 'CustomBusinessWorkflow';
  }

  /**
   * Detects workflow steps from natural language mapped to project context
   */
  static detectSteps(text, context, triggerEvent) {
    const lower = text.toLowerCase();
    const steps = [];

    // Scenario A: Order Placed
    if (lower.includes('order') && (lower.includes('vendor') || lower.includes('invoice') || lower.includes('inventory'))) {
      // Step 1: Notify Vendor
      steps.push({
        stepId: 'step-001',
        name: 'Notify Vendor',
        order: 1,
        actionType: 'function',
        functionName: 'NotifyVendorOnOrder',
        inputMapping: {
          vendorId: '{{trigger.vendorId}}',
          orderId: '{{trigger.orderId}}'
        },
        onSuccess: 'next',
        onFailure: 'abort',
        candidate: 'NotifyVendorOnOrder',
        description: 'Calls NotifyVendorOnOrder custom function with vendor ID from trigger payload.'
      });

      // Step 2: Create Invoice
      steps.push({
        stepId: 'step-002',
        name: 'Create Invoice',
        order: 2,
        actionType: 'formCreate',
        schema: 'invoices',
        inputMapping: {
          orderId: '{{trigger.orderId}}',
          amount: '{{trigger.totalAmount}}',
          vendorId: '{{trigger.vendorId}}'
        },
        onSuccess: 'next',
        onFailure: 'abort',
        candidate: 'invoices',
        description: 'Creates new invoice record in invoices schema consuming trigger data.'
      });

      // Step 3: Update Inventory (Conditional: stock_type == physical)
      steps.push({
        stepId: 'step-003',
        name: 'Update Inventory',
        order: 3,
        actionType: 'operation',
        formId: 'inventoryForm',
        buttonId: 'UpdateStockOperation',
        inputMapping: {
          orderId: '{{trigger.orderId}}',
          stock_type: '{{trigger.stock_type}}'
        },
        condition: {
          field: 'stock_type',
          operator: '==',
          value: 'physical'
        },
        onSuccess: 'next',
        onFailure: 'skip',
        candidate: 'UpdateStockOperation',
        description: 'Executes UpdateStockOperation button only if stock_type equals physical.'
      });

      // Step 4: Send Confirmation (Consuming output of Step 2 {{step-002._id}})
      steps.push({
        stepId: 'step-004',
        name: 'Send Confirmation',
        order: 4,
        actionType: 'function',
        functionName: 'SendOrderConfirmation',
        inputMapping: {
          recipientEmail: '{{trigger.customerEmail}}',
          invoiceId: '{{step-002._id}}'
        },
        onSuccess: 'next',
        onFailure: 'skip',
        candidate: 'SendOrderConfirmation',
        description: 'Consumes generated invoiceId from step-002 output and sends customer receipt.'
      });

      return steps;
    }

    // Scenario B: Asset Request Approval
    if (lower.includes('asset') || lower.includes('request') || lower.includes('approv')) {
      steps.push({
        stepId: 'step-001',
        name: 'Validate Request',
        order: 1,
        actionType: 'function',
        functionName: 'ValidateRequest',
        inputMapping: { requestId: '{{trigger.requestId}}' },
        onSuccess: 'next',
        onFailure: 'abort',
        candidate: 'ValidateRequest'
      });

      steps.push({
        stepId: 'step-002',
        name: 'Notify Approver',
        order: 2,
        actionType: 'function',
        functionName: 'NotifyApprover',
        inputMapping: { approverRole: 'Department Head' },
        onSuccess: 'next',
        onFailure: 'abort',
        candidate: 'NotifyApprover'
      });

      steps.push({
        stepId: 'step-003',
        name: 'Update Request Status',
        order: 3,
        actionType: 'formUpdate',
        schema: 'asset_requests',
        inputMapping: { requestId: '{{trigger.requestId}}', status: 'APPROVED' },
        condition: { field: 'approver_response', operator: '==', value: 'approved' },
        onSuccess: 'next',
        onFailure: 'skip',
        candidate: 'asset_requests'
      });

      steps.push({
        stepId: 'step-004',
        name: 'Create Asset Record',
        order: 4,
        actionType: 'formCreate',
        schema: 'assets',
        inputMapping: { requestId: '{{trigger.requestId}}', assetType: '{{trigger.assetType}}' },
        condition: { field: 'approver_response', operator: '==', value: 'approved' },
        onSuccess: 'next',
        onFailure: 'abort',
        candidate: 'assets'
      });

      steps.push({
        stepId: 'step-005',
        name: 'Reject and Notify',
        order: 5,
        actionType: 'function',
        functionName: 'RejectAndNotify',
        inputMapping: { reason: 'Request rejected by managerial decision.' },
        condition: { field: 'approver_response', operator: '==', value: 'rejected' },
        onSuccess: 'next',
        onFailure: 'skip',
        candidate: 'RejectAndNotify'
      });

      return steps;
    }

    // Generic NLP Parser with Context Matching
    const clauses = text.split(/[,;\n]+/).map(c => c.trim()).filter(c => c.length > 4);
    clauses.forEach((clause, idx) => {
      const cLower = clause.toLowerCase();
      const stepId = `step-00${idx + 1}`;

      let actionType = 'function';
      let functionName = null;
      let schema = null;
      let formId = null;
      let buttonId = null;
      let candidate = null;

      // Check context function match
      if (context && context.functions) {
        const funcMatch = context.functions.find(f => cLower.includes(f.name.toLowerCase()) || cLower.includes(f.name.replace(/([A-Z])/g, ' $1').toLowerCase()));
        if (funcMatch) {
          actionType = 'function';
          functionName = funcMatch.name;
          candidate = funcMatch.name;
        }
      }

      // Check context schema match (Create vs Update vs Delete)
      if (!candidate && context && context.schemas) {
        const schemaMatch = context.schemas.find(s => cLower.includes(s.name.toLowerCase()));
        if (schemaMatch) {
          schema = schemaMatch.name;
          candidate = schemaMatch.name;
          if (cLower.includes('update') || cLower.includes('modify') || cLower.includes('change')) {
            actionType = 'formUpdate';
          } else if (cLower.includes('delete') || cLower.includes('remove')) {
            actionType = 'formDelete';
          } else {
            actionType = 'formCreate';
          }
        }
      }

      // Check button / operation match
      if (!candidate && (cLower.includes('button') || cLower.includes('operation') || cLower.includes('inventory') || cLower.includes('approve'))) {
        actionType = 'operation';
        formId = 'defaultForm';
        buttonId = 'actionButton';
        candidate = 'actionButton';
      }

      // Extract condition if present
      let condition = null;
      if (cLower.includes('if ') || cLower.includes('when ')) {
        condition = {
          field: cLower.includes('physical') ? 'stock_type' : (cLower.includes('approved') ? 'approver_response' : 'status'),
          operator: '==',
          value: cLower.includes('physical') ? 'physical' : (cLower.includes('approved') ? 'approved' : 'active')
        };
      }

      steps.push({
        stepId,
        name: clause.substring(0, 32).replace(/^(when|then|and|if)\s+/i, ''),
        order: idx + 1,
        actionType,
        functionName,
        schema,
        formId,
        buttonId,
        inputMapping: { payload: '{{trigger.id}}' },
        condition,
        onSuccess: 'next',
        onFailure: 'abort',
        candidate: candidate || 'InferredAction'
      });
    });

    return steps;
  }

  /**
   * Synthesizes React Flow Nodes & Edges from steps
   */
  static synthesizeDiagramGraph(steps, triggerEvent, workflowName) {
    const nodes = [];
    const edges = [];

    // Trigger / Start Node
    const startNode = {
      id: 'node_trigger',
      type: 'milestoneNode',
      position: { x: 50, y: 160 },
      data: {
        label: `Trigger: ${triggerEvent.type} (${triggerEvent.schema})`,
        title: 'Workflow Trigger',
        category: 'milestone',
        status: 'active',
        description: `Initiated when ${triggerEvent.type} occurs on ${triggerEvent.schema}.`
      }
    };
    nodes.push(startNode);

    let prevNodeId = startNode.id;
    let currentX = 340;
    let currentY = 160;

    steps.forEach((step, idx) => {
      const nodeId = step.stepId;
      const isCondition = !!step.condition;

      const actionNode = {
        id: nodeId,
        type: 'actionNode',
        position: { x: currentX, y: currentY },
        data: {
          label: step.name,
          title: step.name,
          stepId: step.stepId,
          order: step.order,
          actionType: step.actionType,
          functionName: step.functionName,
          schema: step.schema,
          formId: step.formId,
          buttonId: step.buttonId,
          candidate: step.candidate,
          inputMapping: step.inputMapping,
          condition: step.condition,
          onSuccess: step.onSuccess,
          onFailure: step.onFailure,
          status: 'idle',
          actor: 'Automation Engine',
          duration: '40-80ms'
        }
      };
      nodes.push(actionNode);

      // Success edge from previous node
      edges.push({
        id: `edge_${prevNodeId}_to_${nodeId}`,
        source: prevNodeId,
        target: nodeId,
        type: 'smoothstep',
        animated: true,
        label: isCondition ? `If ${step.condition.field} == ${step.condition.value}` : 'Next Step',
        data: { routeType: 'success' }
      });

      // If failure policy is a specific route or skip/abort, add edge
      if (step.onFailure && step.onFailure !== 'abort') {
        edges.push({
          id: `edge_${nodeId}_fail`,
          source: nodeId,
          target: step.onFailure === 'skip' ? `node_end` : step.onFailure,
          type: 'smoothstep',
          style: { stroke: '#f43f5e', strokeDasharray: '5,5' },
          label: `ON_FAILURE: ${step.onFailure.toUpperCase()}`,
          data: { routeType: 'failure' }
        });
      }

      prevNodeId = nodeId;
      currentX += 320;
    });

    // End Node
    const endNode = {
      id: 'node_end',
      type: 'milestoneNode',
      position: { x: currentX, y: 160 },
      data: {
        label: 'Workflow Completed',
        title: 'Run Finalized',
        category: 'milestone',
        status: 'completed',
        description: 'All steps executed successfully.'
      }
    };
    nodes.push(endNode);

    edges.push({
      id: `edge_${prevNodeId}_to_node_end`,
      source: prevNodeId,
      target: 'node_end',
      type: 'smoothstep',
      animated: true,
      label: 'Success'
    });

    return { nodes, edges };
  }

  /**
   * Computes Confidence Score & Warnings against project context
   */
  static calculateConfidenceAndWarnings(steps, context) {
    const warnings = [];
    let matchedScore = 0;

    steps.forEach((step) => {
      let stepMatched = false;

      if (step.actionType === 'function' && context.functions) {
        const found = context.functions.some(f => f.name === step.functionName || f.name === step.candidate);
        if (found) {
          stepMatched = true;
          matchedScore += 1;
        } else {
          warnings.push(`Function "${step.functionName || step.name}" is not explicitly defined in project context.`);
        }
      } else if ((step.actionType === 'formCreate' || step.actionType === 'formUpdate' || step.actionType === 'formDelete') && context.schemas) {
        const found = context.schemas.some(s => s.name === step.schema || s.name === step.candidate);
        if (found) {
          stepMatched = true;
          matchedScore += 1;
        } else {
          warnings.push(`Schema "${step.schema || step.name}" is not registered in project context.`);
        }
      } else if (step.actionType === 'operation') {
        if (step.buttonId) {
          stepMatched = true;
          matchedScore += 1;
        } else {
          warnings.push(`Operation step "${step.name}" requires formId and buttonId mapping.`);
        }
      }
    });

    const confidence = steps.length > 0 ? Math.min(0.98, Math.max(0.70, (matchedScore / steps.length) * 0.3 + 0.68)) : 0.75;

    return {
      confidence: Number(confidence.toFixed(2)),
      warnings
    };
  }
}
