import express from 'express';
import { WorkflowAnalyzer, DEFAULT_PROJECT_CONTEXTS } from '../services/workflowAnalyzer.js';

const router = express.Router();

export const WORKFLOW_TEMPLATES = [
  {
    id: 'scenario-a-order-placed',
    title: 'Scenario A: Order Placed (Context Passing & STP)',
    category: 'E-Commerce & Orders',
    projectName: 'sample-flow',
    description: 'Triggered when an order is created. Dispatches vendor notification, generates invoice, checks stock type, and sends confirmation.',
    rawInput: 'When an order is placed, notify the vendor, create an invoice, update inventory if the stock type is physical, and send a confirmation.',
    tags: ['PS11_Scenario_A', 'OrderPlaced', 'ContextPassing']
  },
  {
    id: 'scenario-b-asset-approval',
    title: 'Scenario B: Asset Request Approval (Multi-Branching)',
    category: 'Operations & Approvals',
    projectName: 'sample-flow',
    description: 'Triggered on asset request update. Validates request, routes to approver, updates status & creates asset if approved, or rejects and notifies.',
    rawInput: 'When an asset request is updated, validate the request, notify the approver. If approver response is approved update request status and create asset record. Otherwise reject and notify.',
    tags: ['PS11_Scenario_B', 'Branching', 'Approvals']
  },
  {
    id: 'multi-workflow-chain',
    title: 'Multiple Independent Workflow Chain (PS11 Requirement)',
    category: 'Multi-Workflow Detection',
    projectName: 'sample-flow',
    description: 'Contains two distinct workflows in a single prompt: Order Placed and Order Cancelled.',
    rawInput: 'When an order is placed notify the vendor and create an invoice.\nWhen an order is cancelled trigger a refund and notify customer.',
    tags: ['PS11_Multi_Workflow', 'ParallelChains']
  }
];

// GET /api/templates
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: WORKFLOW_TEMPLATES.length,
    templates: WORKFLOW_TEMPLATES
  });
});

// GET /api/templates/:id/analyze
router.get('/:id/analyze', async (req, res) => {
  try {
    const template = WORKFLOW_TEMPLATES.find(t => t.id === req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    const [analysis] = await WorkflowAnalyzer.detectWorkflows({
      projectName: template.projectName || 'sample-flow',
      requirement: template.rawInput
    });
    analysis.title = template.title;
    analysis.tags = template.tags;
    res.json({ success: true, workflow: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
