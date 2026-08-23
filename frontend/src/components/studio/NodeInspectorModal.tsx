import React, { useState, useEffect } from 'react';
import { CustomWorkflowNode, ActionType, StepCondition } from '../../types/workflow';
import { X, Save, Trash2, AlertTriangle, Layers, Zap, FileText, Database, GitBranch, Check } from 'lucide-react';

interface NodeInspectorModalProps {
  node: CustomWorkflowNode | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updatedData: any) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  node,
  isOpen,
  onClose,
  onUpdateNode,
  onDeleteNode
}) => {
  if (!isOpen || !node) return null;

  const [name, setName] = useState<string>(node.data?.label || node.data?.name || '');
  const [actionType, setActionType] = useState<ActionType>(node.data?.actionType || 'function');
  const [functionName, setFunctionName] = useState<string>(node.data?.functionName || node.data?.candidate || '');
  const [schema, setSchema] = useState<string>(node.data?.schema || 'orders');
  const [formId, setFormId] = useState<string>(node.data?.formId || 'defaultForm');
  const [buttonId, setButtonId] = useState<string>(node.data?.buttonId || 'actionButton');
  const [inputMappingStr, setInputMappingStr] = useState<string>(JSON.stringify(node.data?.inputMapping || { payload: '{{trigger.id}}' }, null, 2));
  const [hasCondition, setHasCondition] = useState<boolean>(!!node.data?.condition?.field);
  const [condField, setCondField] = useState<string>(node.data?.condition?.field || 'stock_type');
  const [condOp, setCondOp] = useState<string>(node.data?.condition?.operator || '==');
  const [condVal, setCondVal] = useState<string>(String(node.data?.condition?.value || 'physical'));
  const [onSuccess, setOnSuccess] = useState<string>(node.data?.onSuccess || 'next');
  const [onFailure, setOnFailure] = useState<string>(node.data?.onFailure || 'abort');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (node) {
      setName(node.data?.label || node.data?.name || '');
      setActionType(node.data?.actionType || 'function');
      setFunctionName(node.data?.functionName || node.data?.candidate || '');
      setSchema(node.data?.schema || 'orders');
      setFormId(node.data?.formId || 'defaultForm');
      setButtonId(node.data?.buttonId || 'actionButton');
      setInputMappingStr(JSON.stringify(node.data?.inputMapping || {}, null, 2));
      setHasCondition(!!node.data?.condition?.field);
      setCondField(node.data?.condition?.field || 'stock_type');
      setCondOp(node.data?.condition?.operator || '==');
      setCondVal(String(node.data?.condition?.value || 'physical'));
      setOnSuccess(node.data?.onSuccess || 'next');
      setOnFailure(node.data?.onFailure || 'abort');
      setSavedSuccess(false);
    }
  }, [node]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let parsedMapping = {};
    try {
      parsedMapping = JSON.parse(inputMappingStr);
    } catch (e) {
      parsedMapping = node.data?.inputMapping || {};
    }

    const condition: StepCondition | null = hasCondition && condField ? {
      field: condField,
      operator: condOp as any,
      value: condVal
    } : null;

    onUpdateNode(node.id, {
      ...node.data,
      label: name,
      name,
      actionType,
      functionName: actionType === 'function' ? functionName : null,
      schema: (actionType === 'formCreate' || actionType === 'formUpdate' || actionType === 'formDelete') ? schema : null,
      formId: actionType === 'operation' ? formId : null,
      buttonId: actionType === 'operation' ? buttonId : null,
      candidate: actionType === 'function' ? functionName : (actionType === 'operation' ? buttonId : schema),
      inputMapping: parsedMapping,
      condition,
      onSuccess,
      onFailure
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e1a]/85 backdrop-blur-[20px]">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0a0e1a]/95 border border-white/[0.08] shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto backdrop-blur-[20px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#00d4ff] font-bold">STEP EDITOR & MAPPINGS</span>
              <h3 className="text-base font-bold text-[#e8edf5] font-display">{node.data?.stepId || node.id}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-[#e8edf5] hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          {/* Step Name */}
          <div>
            <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider">Step Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-sans outline-none"
              required
            />
          </div>

          {/* Action Type Selector */}
          <div>
            <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as ActionType)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#00d4ff] font-bold text-xs font-mono outline-none cursor-pointer"
            >
              <option value="function">function — Custom Business Logic</option>
              <option value="formCreate">formCreate — Insert Record</option>
              <option value="formUpdate">formUpdate — Update Record</option>
              <option value="formDelete">formDelete — Delete Record</option>
              <option value="operation">operation — Form Button Action</option>
            </select>
          </div>

          {/* Conditional Target Inputs */}
          {actionType === 'function' && (
            <div>
              <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider">Target Function Name</label>
              <input
                type="text"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="e.g. NotifyVendorOnOrder"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-mono outline-none"
              />
            </div>
          )}

          {(actionType === 'formCreate' || actionType === 'formUpdate' || actionType === 'formDelete') && (
            <div>
              <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider">Target Schema</label>
              <input
                type="text"
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder="e.g. invoices, orders, asset_requests"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-mono outline-none"
              />
            </div>
          )}

          {actionType === 'operation' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider">Form ID</label>
                <input
                  type="text"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider">Button ID</label>
                <input
                  type="text"
                  value={buttonId}
                  onChange={(e) => setButtonId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#e8edf5] text-xs font-mono outline-none"
                />
              </div>
            </div>
          )}

          {/* Dynamic inputMapping JSON */}
          <div>
            <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider">
              Input Mapping Templates (e.g. {'{{trigger.vendorId}}'}, {'{{step-002._id}}'})
            </label>
            <textarea
              rows={3}
              value={inputMappingStr}
              onChange={(e) => setInputMappingStr(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] focus:border-[#00d4ff] text-[#00d4ff] text-xs font-mono outline-none resize-none"
            />
          </div>

          {/* Condition Builder */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#7c3aed]" />
                <span>Enable Conditional Execution</span>
              </span>
              <input
                type="checkbox"
                checked={hasCondition}
                onChange={(e) => setHasCondition(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-[#7c3aed] cursor-pointer"
              />
            </div>

            {hasCondition && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Field</label>
                  <input
                    type="text"
                    value={condField}
                    onChange={(e) => setCondField(e.target.value)}
                    placeholder="stock_type"
                    className="w-full px-2.5 py-1.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] text-xs text-[#e8edf5] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Operator</label>
                  <select
                    value={condOp}
                    onChange={(e) => setCondOp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] text-xs text-[#e8edf5] font-mono"
                  >
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                    <option value="contains">contains</option>
                    <option value="exists">exists</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Value</label>
                  <input
                    type="text"
                    value={condVal}
                    onChange={(e) => setCondVal(e.target.value)}
                    placeholder="physical"
                    className="w-full px-2.5 py-1.5 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] text-xs text-[#e8edf5] font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Failure Routing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider text-[10px]">On Failure Policy</label>
              <select
                value={onFailure}
                onChange={(e) => setOnFailure(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] text-xs font-mono text-slate-300 cursor-pointer"
              >
                <option value="abort">abort (Stop Workflow)</option>
                <option value="skip">skip (Continue to Next)</option>
                <option value="step-004">Redirect to step-004</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider text-[10px]">On Success Route</label>
              <input
                type="text"
                value={onSuccess}
                onChange={(e) => setOnSuccess(e.target.value)}
                placeholder="next"
                className="w-full px-3 py-2 rounded-2xl bg-[#0a0e1a] border border-white/[0.08] text-xs font-mono text-slate-300"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            {onDeleteNode ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteNode(node.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-2xl bg-[#f43f5e]/15 border border-[#f43f5e]/30 text-[#f43f5e] text-xs font-mono hover:bg-[#f43f5e]/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="glass-card-interactive px-4 py-2 rounded-2xl text-slate-300 text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="glass-button-primary px-5 py-2 rounded-2xl text-[#0a0e1a] font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Apply Step Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
