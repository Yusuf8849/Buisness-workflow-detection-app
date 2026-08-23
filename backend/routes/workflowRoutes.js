import express from 'express';
import { Workflow } from '../models/Workflow.js';
import { WorkflowVersion } from '../models/WorkflowVersion.js';
import { WorkflowRun } from '../models/WorkflowRun.js';
import { ProjectContext } from '../models/ProjectContext.js';
import { WorkflowAnalyzer } from '../services/workflowAnalyzer.js';
import { WorkflowExecutor } from '../services/workflowExecutor.js';
import { WorkflowAgentEditor } from '../services/workflowAgentEditor.js';
import { ProcessOptimizer } from '../services/processOptimizer.js';
import { isMongoConnected, localStore } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Helper to save to Mongo or LocalStore
const persistWorkflow = async (data) => {
  const id = data.id || data.workflowId;
  data.id = id;
  data.workflowId = id;

  if (isMongoConnected) {
    try {
      const existing = await Workflow.findOne({ id });
      if (existing) {
        return await Workflow.findOneAndUpdate({ id }, data, { new: true });
      } else {
        return await Workflow.create(data);
      }
    } catch (e) {
      console.warn('Mongo save failed, falling back to local store:', e.message);
    }
  }
  localStore.memory.workflows.set(id, data);
  localStore.saveToDisk();
  return data;
};

const getWorkflowById = async (id) => {
  if (isMongoConnected) {
    try {
      const wf = await Workflow.findOne({ $or: [{ id }, { workflowId: id }] });
      if (wf) return wf;
    } catch (e) {
      console.warn('Mongo fetch failed:', e.message);
    }
  }
  return localStore.memory.workflows.get(id);
};

const getAllWorkflows = async (projectName) => {
  const query = projectName ? { projectName } : {};
  if (isMongoConnected) {
    try {
      const list = await Workflow.find(query).sort({ updatedAt: -1 });
      if (list && list.length > 0) return list;
    } catch (e) {
      console.warn('Mongo list failed:', e.message);
    }
  }
  return Array.from(localStore.memory.workflows.values())
    .filter((w) => (!projectName || w.projectName === projectName))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
};

// 1. POST /workflow/detect (Official PS11 Endpoint)
router.post(['/detect', '/analyze'], async (req, res) => {
  try {
    const { projectName = 'sample-flow', requirement, rawInput } = req.body;
    const textInput = requirement || rawInput;

    if (!textInput || typeof textInput !== 'string') {
      return res.status(400).json({ success: false, error: 'requirement string is required' });
    }

    const detectedWorkflows = await WorkflowAnalyzer.detectWorkflows({
      projectName,
      requirement: textInput
    });

    // Auto-persist first as draft for studio readiness
    if (detectedWorkflows.length > 0) {
      await persistWorkflow(detectedWorkflows[0]);
    }

    res.json({
      success: true,
      count: detectedWorkflows.length,
      workflows: detectedWorkflows,
      // Backward-compatible single workflow field
      workflow: detectedWorkflows[0],
      meta: {
        analyzedAt: new Date().toISOString(),
        engine: 'FlowIntel Neural Process Engine v2.5 (PS11 Compliant)'
      }
    });
  } catch (error) {
    res.status(422).json({ success: false, error: error.message });
  }
});

// 2. POST /workflow/create (Official PS11 Endpoint)
router.post(['/create', '/'], async (req, res) => {
  try {
    const workflowData = req.body;
    if (!workflowData.id && !workflowData.workflowId) {
      const newId = `wf_${Date.now()}_${uuidv4().substring(0, 6)}`;
      workflowData.id = newId;
      workflowData.workflowId = newId;
    }
    workflowData.updatedAt = new Date().toISOString();
    if (!workflowData.createdAt) workflowData.createdAt = new Date().toISOString();

    const saved = await persistWorkflow(workflowData);
    res.status(201).json({ success: true, workflow: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET /workflow/list?projectName= (Official PS11 Endpoint)
router.get(['/list', '/'], async (req, res) => {
  try {
    const { projectName } = req.query;
    const workflows = await getAllWorkflows(projectName);
    res.json({
      success: true,
      count: workflows.length,
      workflows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET /workflow/:id
router.get('/:id', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    res.json({ success: true, workflow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. PATCH /workflow/:id (or PUT)
router.patch('/:id', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    const updatedData = { ...workflow, ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    const saved = await persistWorkflow(updatedData);
    res.json({ success: true, workflow: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    const updatedData = { ...workflow, ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
    const saved = await persistWorkflow(updatedData);
    res.json({ success: true, workflow: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. DELETE /workflow/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoConnected) {
      await Workflow.deleteOne({ $or: [{ id }, { workflowId: id }] });
    }
    localStore.memory.workflows.delete(id);
    localStore.saveToDisk();
    res.json({ success: true, message: `Workflow ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. POST /workflow/trigger/:workflowId (Dynamic Execution Engine)
router.post('/trigger/:workflowId', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const { triggerPayload = {}, dryRun = false } = req.body;
    const port = process.env.PORT || 5000;

    const runResult = await WorkflowExecutor.executeWorkflow({
      workflow,
      triggerPayload,
      dryRun,
      port
    });

    res.json({
      success: true,
      runId: runResult.id,
      status: runResult.status,
      totalDurationMs: runResult.totalDurationMs,
      run: runResult
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. GET /workflow/runs/:workflowId
router.get('/runs/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    let runs = [];
    if (isMongoConnected) {
      try {
        runs = await WorkflowRun.find({ workflowId }).sort({ startedAt: -1 }).limit(50);
      } catch (e) {
        console.warn('Mongo runs query failed:', e.message);
      }
    }
    if (runs.length === 0) {
      runs = Array.from(localStore.memory.analyses.values())
        .filter((r) => r.workflowId === workflowId)
        .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
    }
    res.json({ success: true, count: runs.length, runs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. GET /workflow/run/:runId
router.get('/run/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    let run;
    if (isMongoConnected) {
      try {
        run = await WorkflowRun.findOne({ id: runId });
      } catch (e) {}
    }
    if (!run) {
      run = localStore.memory.analyses.get(runId);
    }
    if (!run) {
      return res.status(404).json({ success: false, error: 'Run log not found' });
    }
    res.json({ success: true, run });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. POST /workflow/:workflowId/validate
router.post('/:workflowId/validate', async (req, res) => {
  try {
    const workflow = req.body.workflow || (await getWorkflowById(req.params.workflowId));
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

    const validation = WorkflowAgentEditor.validateWorkflow(workflow);
    res.json({ success: true, validation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 11. POST /workflow/:workflowId/agent-edit (Propose change)
router.post('/:workflowId/agent-edit', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

    const { instruction } = req.body;
    if (!instruction) return res.status(400).json({ success: false, error: 'Instruction string required' });

    const proposal = await WorkflowAgentEditor.proposeEdit({
      workflow,
      instruction
    });

    res.json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 12. POST /workflow/:workflowId/agent-edit/apply (User approved proposal)
router.post('/:workflowId/agent-edit/apply', async (req, res) => {
  try {
    const { updatedDraft } = req.body;
    if (!updatedDraft) return res.status(400).json({ success: false, error: 'updatedDraft payload required' });

    const saved = await persistWorkflow(updatedDraft);
    res.json({ success: true, workflow: saved, message: 'AI Agent draft applied successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 13. POST /workflow/:workflowId/version
router.post('/:workflowId/version', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

    const nextVer = (workflow.version || 1) + 1;
    const versionDoc = {
      id: `ver_${req.params.workflowId}_v${nextVer}`,
      workflowId: req.params.workflowId,
      versionNumber: nextVer,
      title: req.body.title || `${workflow.title || workflow.workflowName} (v${nextVer}.0)`,
      changeSummary: req.body.changeSummary || 'Workflow version published',
      nodes: workflow.nodes,
      edges: workflow.edges,
      createdAt: new Date().toISOString()
    };

    localStore.memory.versions.set(versionDoc.id, versionDoc);
    localStore.saveToDisk();

    workflow.version = nextVer;
    workflow.status = 'published';
    await persistWorkflow(workflow);

    res.status(201).json({ success: true, version: versionDoc, workflow });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 14. GET /workflow/:workflowId/versions
router.get('/:workflowId/versions', async (req, res) => {
  try {
    const versions = Array.from(localStore.memory.versions.values())
      .filter((v) => v.workflowId === req.params.workflowId)
      .sort((a, b) => b.versionNumber - a.versionNumber);
    res.json({ success: true, count: versions.length, versions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 15. GET /workflow/:workflowId/optimize
router.get('/:workflowId/optimize', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.workflowId);
    if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

    const result = ProcessOptimizer.optimize(workflow);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 16. GET /project/context/:projectName
router.get('/project/context/:projectName', async (req, res) => {
  try {
    const context = await WorkflowAnalyzer.getProjectContext(req.params.projectName);
    res.json({ success: true, context });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
