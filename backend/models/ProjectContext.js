import mongoose from 'mongoose';

const FormSchemaDef = new mongoose.Schema({
  name: { type: String, required: true },
  displayName: { type: String },
  fields: [{
    name: { type: String, required: true },
    type: { type: String, default: 'string' },
    required: { type: Boolean, default: false },
    description: { type: String }
  }]
}, { _id: false });

const CustomFunctionDef = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  parameters: [{
    name: { type: String },
    type: { type: String }
  }],
  returnType: { type: String, default: 'object' }
}, { _id: false });

const ButtonDef = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  formId: { type: String },
  action: { type: String },
  condition: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const ProjectContextSchema = new mongoose.Schema({
  projectName: { type: String, required: true, unique: true, index: true },
  displayName: { type: String },
  description: { type: String },
  schemas: [FormSchemaDef],
  functions: [CustomFunctionDef],
  buttons: [ButtonDef],
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

export const ProjectContext = mongoose.models.ProjectContext || mongoose.model('ProjectContext', ProjectContextSchema);
