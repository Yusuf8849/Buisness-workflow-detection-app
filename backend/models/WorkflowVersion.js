import mongoose from 'mongoose';

const WorkflowVersionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  workflowId: { type: String, required: true, index: true },
  versionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  changeSummary: { type: String, default: 'Updated workflow structure' },
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  metrics: {
    stepCount: { type: Number },
    actorCount: { type: Number },
    decisionCount: { type: Number },
    relationshipCount: { type: Number }
  },
  changes: [{
    type: { type: String }, // 'added_step' | 'removed_step' | 'changed_owner' | 'added_decision' | 'modified_edge'
    description: { type: String },
    nodeId: { type: String }
  }]
}, {
  timestamps: true
});

export const WorkflowVersion = mongoose.models.WorkflowVersion || mongoose.model('WorkflowVersion', WorkflowVersionSchema);
