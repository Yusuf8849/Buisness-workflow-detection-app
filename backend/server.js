import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB, isMongoConnected, localStore } from './config/db.js';
import workflowRoutes from './routes/workflowRoutes.js';
import formsEngineRoutes from './routes/formsEngineRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import { ProjectContext } from './models/ProjectContext.js';
import { Workflow } from './models/Workflow.js';
import { DEFAULT_PROJECT_CONTEXTS, WorkflowAnalyzer } from './services/workflowAnalyzer.js';
import { initSocketIO } from './services/socketService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io Real-Time Collaboration Engine
const io = initSocketIO(server);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Seed MongoDB with Project Contexts & Scenarios A, B, and C
const seedPS11Data = async () => {
  try {
    console.log('[Seed] Ensuring PS11 Project Contexts and Scenarios in Database...');

    // 1. Seed Project Contexts
    for (const ctx of DEFAULT_PROJECT_CONTEXTS) {
      if (isMongoConnected) {
        try {
          await ProjectContext.findOneAndUpdate(
            { projectName: ctx.projectName },
            ctx,
            { upsert: true, new: true }
          );
        } catch (e) {}
      }
    }

    // 2. Seed Scenario A: Order Placed
    const scenarioAPrompt = "When an order is placed, notify the vendor, create an invoice, update inventory if the stock type is physical, and send a confirmation.";
    const [wfA] = await WorkflowAnalyzer.detectWorkflows({ projectName: 'sample-flow', requirement: scenarioAPrompt });
    wfA.id = 'wf_scenario_order_placed';
    wfA.workflowId = 'wf_scenario_order_placed';
    wfA.workflowName = 'OrderPlaced';
    wfA.title = 'OrderPlaced (Scenario A)';
    wfA.tags = ['PS11_Scenario_A', 'OrderPlaced', 'Fintech', 'ContextPassing'];

    // 3. Seed Scenario B: Asset Request Approval
    const scenarioBPrompt = "When an asset request is updated, validate the request, notify the approver. If approver response is approved update request status and create asset record. Otherwise reject and notify.";
    const [wfB] = await WorkflowAnalyzer.detectWorkflows({ projectName: 'sample-flow', requirement: scenarioBPrompt });
    wfB.id = 'wf_scenario_asset_approval';
    wfB.workflowId = 'wf_scenario_asset_approval';
    wfB.workflowName = 'AssetRequestApproval';
    wfB.title = 'AssetRequestApproval (Scenario B)';
    wfB.tags = ['PS11_Scenario_B', 'Branching', 'Approvals'];

    if (isMongoConnected) {
      try {
        await Workflow.findOneAndUpdate({ id: wfA.id }, wfA, { upsert: true });
        await Workflow.findOneAndUpdate({ id: wfB.id }, wfB, { upsert: true });
      } catch (e) {}
    }

    localStore.memory.workflows.set(wfA.id, wfA);
    localStore.memory.workflows.set(wfB.id, wfB);
    localStore.saveToDisk();

    console.log('[Seed] ✅ PS11 Scenarios A (OrderPlaced) & B (AssetRequestApproval) ready.');
  } catch (err) {
    console.warn('[Seed] Warning during initial seed:', err.message);
  }
};

// Mount Routes (supporting both official PS11 routes and /api aliases)
app.use('/workflow', workflowRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/workflows', workflowRoutes);

app.use('/forms', formsEngineRoutes);
app.use('/api/forms', formsEngineRoutes);

app.use('/project', workflowRoutes);
app.use('/api/project', workflowRoutes);

app.use('/api/templates', templateRoutes);

// Health Check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FlowIntel AI — PS11 Workflow Detection, Diagram & Execution Engine',
    version: '2.5.0',
    ps11Compliant: true,
    realtimeCollaboration: 'Socket.io Enabled',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /workflow/detect',
      'POST /workflow/create',
      'GET  /workflow/list?projectName=',
      'GET  /workflow/:id',
      'PATCH /workflow/:id',
      'POST /workflow/trigger/:id',
      'GET  /workflow/runs/:id',
      'POST /workflow/:id/validate',
      'POST /workflow/:id/agent-edit',
      'POST /workflow/:id/agent-edit/apply',
      'POST /forms/function/:name',
      'POST /forms/formCreate/:schema',
      'POST /forms/formUpdate/:schema',
      'POST /forms/operation'
    ]
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Express Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    path: req.originalUrl
  });
});

// Start Server
const startServer = async () => {
  await connectDB();
  await seedPS11Data();

  server.listen(PORT, () => {
    console.log(`==================================================================`);
    console.log(`🚀 FlowIntel AI PS11 Engine running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Real-Time WebSockets: Socket.io Active`);
    console.log(`⚡ Official PS11 Endpoints: /workflow/detect, /workflow/trigger/:id`);
    console.log(`==================================================================`);
  });
};

startServer();
