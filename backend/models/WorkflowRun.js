import mongoose from 'mongoose';

const StepResultSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  name: { type: String },
  actionType: { type: String },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed', 'skipped'],
    default: 'pending'
  },
  input: { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
  durationMs: { type: Number, default: 0 },
  error: { type: String },
  conditionEvaluated: { type: Boolean, default: false },
  conditionResult: { type: Boolean },
  startedAt: { type: Date },
  completedAt: { type: Date }
}, { _id: false });

const WorkflowRunSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  workflowId: { type: String, required: true, index: true },
  workflowName: { type: String, required: true },
  projectName: { type: String, required: true, index: true },
  triggerPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed'],
    default: 'running',
    index: true
  },
  stepResults: [StepResultSchema],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  totalDurationMs: { type: Number, default: 0 },
  dryRun: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const WorkflowRun = mongoose.models.WorkflowRun || mongoose.model('WorkflowRun', WorkflowRunSchema);
