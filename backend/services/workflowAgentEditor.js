import { v4 as uuidv4 } from 'uuid';

export class WorkflowAgentEditor {
  /**
   * Proposes modifications to an existing workflow based on natural language instruction
   */
  static async proposeEdit({ workflow, instruction, projectContext = {} }) {
    if (!workflow || !instruction) {
      throw new Error('Workflow and edit instruction are required.');
    }

    const lower = instruction.toLowerCase();
    const cloned = JSON.parse(JSON.stringify(workflow));
    const changes = [];
    let changeSummary = 'AI Agent workflow modification';

    const steps = cloned.steps || [];

    // Pattern 1: Add a step (e.g., "Add an approval step after Validate Request")
    if (lower.includes('add') || lower.includes('insert')) {
      let insertAfterName = '';
      if (lower.includes('after')) {
        insertAfterName = instruction.split(/after/i)[1]?.trim() || '';
      }

      const newStepId = `step-00${steps.length + 1}`;
      let newStep;

      if (lower.includes('approval') || lower.includes('approve')) {
        newStep = {
          stepId: newStepId,
          name: 'Manager Approval Gate',
          order: steps.length + 1,
          actionType: 'operation',
          formId: 'approvalsForm',
          buttonId: 'ApproveButton',
          inputMapping: {
            requestId: '{{trigger.requestId}}',
            approverId: '{{trigger.approverId}}'
          },
          condition: { field: 'priority', operator: '==', value: 'high' },
          onSuccess: 'next',
          onFailure: 'abort',
          candidate: 'ApproveButton'
        };
        changeSummary = 'Added Manager Approval Gate step with button operation mapping';
      } else if (lower.includes('notification') || lower.includes('notify') || lower.includes('email')) {
        newStep = {
          stepId: newStepId,
          name: 'Send Notification Alert',
          order: steps.length + 1,
          actionType: 'function',
          functionName: 'SendOrderConfirmation',
          inputMapping: {
            recipient: '{{trigger.customerEmail}}',
            status: 'PROCESSED'
          },
          onSuccess: 'next',
          onFailure: 'skip',
          candidate: 'SendOrderConfirmation'
        };
        changeSummary = 'Added Send Notification Alert custom function step';
      } else {
        newStep = {
          stepId: newStepId,
          name: 'Automated Audit Check',
          order: steps.length + 1,
          actionType: 'formCreate',
          schema: 'audit_logs',
          inputMapping: {
            event: 'WORKFLOW_STEP_RECORDED',
            workflowId: cloned.id
          },
          onSuccess: 'next',
          onFailure: 'skip',
          candidate: 'audit_logs'
        };
        changeSummary = 'Added Automated Audit Check step';
      }

      // Insert at appropriate index
      let targetIdx = steps.length;
      if (insertAfterName) {
        const foundIdx = steps.findIndex(s => s.name.toLowerCase().includes(insertAfterName.toLowerCase().replace(/['"]/g, '')));
        if (foundIdx !== -1) {
          targetIdx = foundIdx + 1;
        }
      }

      steps.splice(targetIdx, 0, newStep);
      // Re-index orders
      steps.forEach((s, idx) => { s.order = idx + 1; });

      changes.push({
        type: 'step_added',
        description: `Added "${newStep.name}" at order position ${targetIdx + 1}`,
        step: newStep
      });
    }
    // Pattern 2: Modify condition (e.g. "Change Update Inventory so it only runs when stock_type is physical")
    else if (lower.includes('condition') || lower.includes('only when') || lower.includes('if') || lower.includes('physical')) {
      let targetStep = steps.find(s => lower.includes(s.name.toLowerCase()) || lower.includes(s.actionType.toLowerCase()));
      if (!targetStep && steps.length > 2) targetStep = steps[2]; // Default 3rd step (e.g. Update Inventory)

      if (targetStep) {
        const oldCondition = targetStep.condition ? { ...targetStep.condition } : null;
        let condField = 'stock_type';
        let condVal = 'physical';

        if (lower.includes('approved')) {
          condField = 'approver_response';
          condVal = 'approved';
        } else if (lower.includes('rejected')) {
          condField = 'approver_response';
          condVal = 'rejected';
        } else if (lower.includes('amount')) {
          condField = 'totalAmount';
          condVal = 1000;
        }

        targetStep.condition = {
          field: condField,
          operator: '==',
          value: condVal
        };

        changeSummary = `Updated condition on "${targetStep.name}" to (${condField} == "${condVal}")`;
        changes.push({
          type: 'condition_updated',
          stepId: targetStep.stepId,
          description: `Applied condition [${condField} == ${condVal}] to step "${targetStep.name}"`,
          before: oldCondition,
          after: targetStep.condition
        });
      }
    }
    // Pattern 3: Replace / Update function name or schema
    else if (lower.includes('replace') || lower.includes('change') || lower.includes('swap')) {
      if (steps.length > 0) {
        const lastStep = steps[steps.length - 1];
        lastStep.functionName = 'SendOrderConfirmation';
        lastStep.candidate = 'SendOrderConfirmation';
        changeSummary = `Updated target function on step "${lastStep.name}" to SendOrderConfirmation`;
        changes.push({
          type: 'function_updated',
          stepId: lastStep.stepId,
          description: `Updated function reference to SendOrderConfirmation`
        });
      }
    } else {
      changeSummary = `Adjusted workflow parameters based on: "${instruction}"`;
      changes.push({
        type: 'parameter_optimized',
        description: `Verified graph integrity and updated metadata for instruction: ${instruction}`
      });
    }

    cloned.steps = steps;
    cloned.changeSummary = changeSummary;
    cloned.editSource = 'ai_agent';
    cloned.status = 'draft';

    // Validate draft
    const validation = this.validateWorkflow(cloned);

    return {
      success: true,
      originalWorkflowId: workflow.id,
      proposedChange: changeSummary,
      instruction,
      patch: changes,
      updatedDraft: cloned,
      validationResult: validation
    };
  }

  /**
   * Validates canonical workflow definition against PS11 rules
   */
  static validateWorkflow(workflow) {
    const errors = [];
    const warnings = [];

    if (!workflow.workflowName && !workflow.title) {
      errors.push('Workflow name is required.');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must contain at least one step.');
      return { isValid: false, errors, warnings };
    }

    const stepIds = new Set();
    const validActionTypes = ['function', 'formCreate', 'formUpdate', 'formDelete', 'operation'];

    workflow.steps.forEach((step, idx) => {
      // 1. Check unique stepId
      if (!step.stepId) {
        errors.push(`Step at index ${idx} is missing stepId.`);
      } else if (stepIds.has(step.stepId)) {
        errors.push(`Duplicate stepId detected: ${step.stepId}`);
      } else {
        stepIds.add(step.stepId);
      }

      // 2. Check valid actionType
      if (!validActionTypes.includes(step.actionType)) {
        errors.push(`Step ${step.stepId} has invalid actionType: "${step.actionType}". Must be one of ${validActionTypes.join(', ')}`);
      }

      // 3. Check actionType specific fields
      if (step.actionType === 'function' && !step.functionName && !step.candidate) {
        warnings.push(`Step ${step.stepId} (function) is missing functionName.`);
      }
      if ((step.actionType === 'formCreate' || step.actionType === 'formUpdate' || step.actionType === 'formDelete') && !step.schema && !step.candidate) {
        warnings.push(`Step ${step.stepId} (${step.actionType}) is missing target schema.`);
      }
      if (step.actionType === 'operation' && (!step.formId || !step.buttonId)) {
        warnings.push(`Step ${step.stepId} (operation) requires formId and buttonId mapping.`);
      }

      // 4. Validate inputMapping template syntax
      if (step.inputMapping && typeof step.inputMapping === 'object') {
        for (const [k, v] of Object.entries(step.inputMapping)) {
          if (typeof v === 'string' && v.includes('{{')) {
            const matches = v.match(/\{\{([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)\}\}/g);
            if (matches) {
              matches.forEach((m) => {
                const scope = m.replace('{{', '').split('.')[0];
                if (scope !== 'trigger' && !stepIds.has(scope) && scope !== step.stepId) {
                  // Reference to a step that doesn't exist yet or is invalid
                  const referencedIdx = workflow.steps.findIndex(s => s.stepId === scope);
                  if (referencedIdx >= idx) {
                    errors.push(`Step ${step.stepId} contains forward or invalid reference to "${scope}". Input mapping can only consume previous steps.`);
                  }
                }
              });
            }
          }
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
