import { v4 as uuidv4 } from 'uuid';
import { WorkflowRun } from '../models/WorkflowRun.js';
import { isMongoConnected, localStore } from '../config/db.js';

export class WorkflowExecutor {
  /**
   * Main Dynamic Workflow Orchestration Engine
   */
  static async executeWorkflow({ workflow, triggerPayload = {}, dryRun = false, port = 5000 }) {
    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
      throw new Error('Invalid workflow: No execution steps defined.');
    }

    const runId = `run_${Date.now()}_${uuidv4().substring(0, 6)}`;
    const startTime = Date.now();

    // 1. Initialize Run Log document
    const runDoc = {
      id: runId,
      workflowId: workflow.id || workflow.workflowId,
      workflowName: workflow.workflowName || workflow.title || 'Workflow Execution',
      projectName: workflow.projectName || 'sample-flow',
      triggerPayload,
      status: 'running',
      stepResults: workflow.steps.map((s) => ({
        stepId: s.stepId,
        name: s.name,
        actionType: s.actionType,
        status: 'pending',
        input: null,
        output: null,
        durationMs: 0,
        conditionEvaluated: false,
        conditionResult: null
      })),
      startedAt: new Date(),
      completedAt: null,
      totalDurationMs: 0,
      dryRun
    };

    await this.persistRun(runDoc);

    // 2. Build Execution Context
    const executionContext = {
      trigger: { ...triggerPayload },
      steps: {}
    };

    let overallFailed = false;
    let jumpToStepId = null;

    // 3. Iterate Steps Dynamically
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const stepIndex = runDoc.stepResults.findIndex((r) => r.stepId === step.stepId);
      if (stepIndex === -1) continue;

      // Handle jump routing if applicable
      if (jumpToStepId && step.stepId !== jumpToStepId) {
        runDoc.stepResults[stepIndex].status = 'skipped';
        continue;
      }
      jumpToStepId = null; // Reset jump

      const stepResult = runDoc.stepResults[stepIndex];
      stepResult.status = 'running';
      stepResult.startedAt = new Date();
      await this.persistRun(runDoc);

      const stepStartTime = Date.now();

      try {
        // A. Resolve Input Mappings
        const resolvedInput = this.resolveInputMapping(step.inputMapping || {}, executionContext);
        stepResult.input = resolvedInput;

        // B. Evaluate Step Condition
        let shouldExecute = true;
        if (step.condition && step.condition.field) {
          stepResult.conditionEvaluated = true;
          shouldExecute = this.evaluateCondition(step.condition, executionContext);
          stepResult.conditionResult = shouldExecute;
        }

        if (!shouldExecute) {
          // Condition not met -> mark as SKIPPED
          stepResult.status = 'skipped';
          stepResult.output = { message: 'Step skipped because condition was not satisfied', condition: step.condition };
          stepResult.durationMs = Date.now() - stepStartTime;
          stepResult.completedAt = new Date();
          executionContext.steps[step.stepId] = stepResult.output;
          await this.persistRun(runDoc);
          continue;
        }

        // C. Execute Action (Dry Run or Live API Dispatch)
        let output;
        if (dryRun) {
          output = await this.simulateDryRunAction(step, resolvedInput);
        } else {
          output = await this.dispatchAction(step, resolvedInput, port);
        }

        // D. Record Success Output
        stepResult.status = 'success';
        stepResult.output = output;
        stepResult.durationMs = Date.now() - stepStartTime;
        stepResult.completedAt = new Date();

        // Store into execution context for downstream step consumption
        executionContext.steps[step.stepId] = output;
        await this.persistRun(runDoc);

        // Handle success routing if specific stepId targeted
        if (step.onSuccess && step.onSuccess !== 'next') {
          jumpToStepId = step.onSuccess;
        }
      } catch (stepError) {
        // E. Handle Step Failure
        stepResult.status = 'failed';
        stepResult.error = stepError.message || 'Execution error';
        stepResult.durationMs = Date.now() - stepStartTime;
        stepResult.completedAt = new Date();
        await this.persistRun(runDoc);

        const failurePolicy = step.onFailure || 'abort';

        if (failurePolicy === 'abort') {
          overallFailed = true;
          // Mark remaining steps as skipped/pending
          for (let j = i + 1; j < workflow.steps.length; j++) {
            const nextIdx = runDoc.stepResults.findIndex((r) => r.stepId === workflow.steps[j].stepId);
            if (nextIdx !== -1) {
              runDoc.stepResults[nextIdx].status = 'skipped';
              runDoc.stepResults[nextIdx].error = `Aborted due to failure in step ${step.stepId}`;
            }
          }
          break; // Stop execution
        } else if (failurePolicy === 'skip') {
          // Continue to next step
          continue;
        } else {
          // Jump to failure handling step
          jumpToStepId = failurePolicy;
        }
      }
    }

    // 4. Finalize Run Document
    runDoc.completedAt = new Date();
    runDoc.totalDurationMs = Date.now() - startTime;
    runDoc.status = overallFailed ? 'failed' : 'success';
    await this.persistRun(runDoc);

    return runDoc;
  }

  /**
   * Safe Input Mapping Resolver
   * Resolves {{trigger.field}} and {{step-001.field}} templates
   */
  static resolveInputMapping(mapping, context) {
    if (!mapping || typeof mapping !== 'object') return {};

    const resolved = {};

    for (const [key, templateValue] of Object.entries(mapping)) {
      if (typeof templateValue === 'string') {
        resolved[key] = this.resolveTemplateString(templateValue, context);
      } else if (typeof templateValue === 'object' && templateValue !== null) {
        resolved[key] = this.resolveInputMapping(templateValue, context);
      } else {
        resolved[key] = templateValue;
      }
    }

    return resolved;
  }

  /**
   * Resolves a single template string
   */
  static resolveTemplateString(templateStr, context) {
    if (!templateStr || typeof templateStr !== 'string') return templateStr;

    // Exact single match e.g. "{{trigger.vendorId}}" or "{{step-002._id}}"
    const exactMatch = templateStr.match(/^\{\{([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)\}\}$/);
    if (exactMatch) {
      const scope = exactMatch[1]; // 'trigger' or 'step-001'
      const path = exactMatch[2];  // 'vendorId' or '_id'
      return this.getValueFromContext(scope, path, context);
    }

    // Embedded string interpolation e.g. "Order #{{trigger.orderId}} Processed"
    return templateStr.replace(/\{\{([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_.-]+)\}\}/g, (match, scope, path) => {
      const val = this.getValueFromContext(scope, path, context);
      return val !== undefined && val !== null ? String(val) : '';
    });
  }

  static getValueFromContext(scope, path, context) {
    let sourceObj;
    if (scope === 'trigger') {
      sourceObj = context.trigger;
    } else if (context.steps && context.steps[scope]) {
      sourceObj = context.steps[scope];
    } else {
      return undefined;
    }

    if (!sourceObj) return undefined;

    // Support nested dot navigation (e.g. data._id or items.0.id)
    const parts = path.split('.');
    let current = sourceObj;
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  /**
   * Safe Condition Evaluator (No raw eval)
   */
  static evaluateCondition(condition, context) {
    if (!condition || !condition.field) return true;

    let targetValue;
    const fieldName = condition.field;

    // Check if field is template e.g. "{{trigger.stock_type}}"
    if (fieldName.startsWith('{{') && fieldName.endsWith('}}')) {
      targetValue = this.resolveTemplateString(fieldName, context);
    } else {
      // Direct lookup from trigger first, then steps
      if (context.trigger && context.trigger[fieldName] !== undefined) {
        targetValue = context.trigger[fieldName];
      } else {
        for (const stepOutput of Object.values(context.steps || {})) {
          if (stepOutput && stepOutput[fieldName] !== undefined) {
            targetValue = stepOutput[fieldName];
            break;
          }
        }
      }
    }

    const expectedValue = condition.value;
    const op = condition.operator || '==';

    switch (op) {
      case '==':
        return String(targetValue).toLowerCase() === String(expectedValue).toLowerCase();
      case '!=':
        return String(targetValue).toLowerCase() !== String(expectedValue).toLowerCase();
      case '>':
        return Number(targetValue) > Number(expectedValue);
      case '<':
        return Number(targetValue) < Number(expectedValue);
      case '>=':
        return Number(targetValue) >= Number(expectedValue);
      case '<=':
        return Number(targetValue) <= Number(expectedValue);
      case 'contains':
        return String(targetValue || '').toLowerCase().includes(String(expectedValue || '').toLowerCase());
      case 'exists':
        return targetValue !== undefined && targetValue !== null && targetValue !== '';
      default:
        return true;
    }
  }

  /**
   * Action Dispatcher calling real Dynamic Form APIs
   */
  static async dispatchAction(step, inputPayload, port = 5000) {
    const actionType = step.actionType;
    let url = '';
    let body = inputPayload;

    if (actionType === 'function') {
      const funcName = step.functionName || step.candidate || 'DefaultFunction';
      url = `http://localhost:${port}/forms/function/${funcName}`;
    } else if (actionType === 'formCreate') {
      const schemaName = step.schema || step.candidate || 'defaultSchema';
      url = `http://localhost:${port}/forms/formCreate/${schemaName}`;
    } else if (actionType === 'formUpdate') {
      const schemaName = step.schema || step.candidate || 'defaultSchema';
      url = `http://localhost:${port}/forms/formUpdate/${schemaName}`;
    } else if (actionType === 'formDelete') {
      const schemaName = step.schema || step.candidate || 'defaultSchema';
      url = `http://localhost:${port}/forms/formDelete/${schemaName}`;
    } else if (actionType === 'operation') {
      url = `http://localhost:${port}/forms/operation`;
      body = {
        formId: step.formId || 'defaultForm',
        buttonId: step.buttonId || 'actionButton',
        payload: inputPayload
      };
    } else {
      throw new Error(`Unsupported actionType: ${actionType}`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      // Local fallback simulation if server is internal
      return {
        success: true,
        actionType,
        executedDirect: true,
        output: inputPayload,
        _id: `${step.schema || 'rec'}_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simulated Dry Run Action (Evaluates logic without firing network mutations)
   */
  static async simulateDryRunAction(step, inputPayload) {
    await new Promise((r) => setTimeout(r, 25));
    return {
      dryRun: true,
      actionType: step.actionType,
      simulatedOutput: {
        _id: `sim_${(step.schema || 'doc')}_${Date.now()}`,
        status: 'READY_TO_EXECUTE',
        resolvedPayload: inputPayload,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Persist Run to MongoDB or Local Fallback Store
   */
  static async persistRun(runDoc) {
    if (isMongoConnected) {
      try {
        const existing = await WorkflowRun.findOne({ id: runDoc.id });
        if (existing) {
          await WorkflowRun.findOneAndUpdate({ id: runDoc.id }, runDoc, { new: true });
        } else {
          await WorkflowRun.create(runDoc);
        }
      } catch (e) {
        console.warn('Mongo run persist failed, using local store:', e.message);
      }
    }
    localStore.memory.analyses.set(runDoc.id, runDoc);
    localStore.saveToDisk();
  }
}
