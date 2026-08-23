import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  workflowId: { type: String },
  rawInput: { type: String, required: true },
  tokens: [{
    text: { type: String },
    type: { type: String }, // 'actor' | 'action' | 'decision' | 'document' | 'department' | 'condition' | 'system'
    confidence: { type: Number },
    startIndex: { type: Number },
    endIndex: { type: Number }
  }],
  pipelineStages: [{
    step: { type: Number },
    name: { type: String },
    status: { type: String }, // 'pending' | 'active' | 'completed'
    itemsFound: { type: Number },
    durationMs: { type: Number },
    details: { type: String }
  }],
  detectedEntities: {
    actors: [{ type: String }],
    actions: [{ type: String }],
    decisions: [{ type: String }],
    documents: [{ type: String }],
    systems: [{ type: String }]
  }
}, {
  timestamps: true
});

export const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);
