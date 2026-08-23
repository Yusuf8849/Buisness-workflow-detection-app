import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Helper to simulate realistic latency (20-80ms)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. POST /forms/function/:name
router.post('/function/:name', async (req, res) => {
  const { name } = req.params;
  const payload = req.body || {};
  await sleep(40);

  const timestamp = new Date().toISOString();
  let result = {
    executed: true,
    functionName: name,
    timestamp,
    status: 'success'
  };

  if (name === 'NotifyVendorOnOrder') {
    result = {
      ...result,
      vendorNotificationId: `notif_v_${Date.now()}`,
      vendorId: payload.vendorId || 'VEND-8821',
      channel: 'email_and_webhook',
      message: 'Vendor notified of incoming order dispatch requirement.'
    };
  } else if (name === 'SendOrderConfirmation') {
    result = {
      ...result,
      confirmationId: `conf_${Date.now()}`,
      recipientEmail: payload.customerEmail || 'customer@enterprise.com',
      invoiceAttached: !!payload.invoiceId,
      dispatched: true
    };
  } else if (name === 'ValidateRequest') {
    result = {
      ...result,
      validationStatus: 'PASSED',
      riskScore: 98,
      validatedBy: 'Autonomous Rules Engine'
    };
  } else if (name === 'NotifyApprover') {
    result = {
      ...result,
      approverTaskId: `task_appr_${Date.now()}`,
      approverRole: 'Department Head',
      status: 'pending_response'
    };
  } else if (name === 'RejectAndNotify') {
    result = {
      ...result,
      adverseActionCode: 'REJECT-POL-402',
      notificationSent: true,
      reason: payload.reason || 'Request rejected by policy criteria.'
    };
  } else {
    result = {
      ...result,
      customExecutionId: `exec_${uuidv4().substring(0, 8)}`,
      receivedInput: payload
    };
  }

  res.json({ success: true, ...result });
});

// 2. POST /forms/formCreate/:schema
router.post('/formCreate/:schema', async (req, res) => {
  const { schema } = req.params;
  const payload = req.body || {};
  await sleep(50);

  const recordId = `${schema.substring(0, 3)}_${Date.now()}_${uuidv4().substring(0, 4)}`;
  res.status(201).json({
    success: true,
    action: 'formCreate',
    schema,
    _id: recordId,
    data: {
      ...payload,
      _id: recordId,
      createdAt: new Date().toISOString()
    }
  });
});

// 3. POST /forms/formUpdate/:schema
router.post('/formUpdate/:schema', async (req, res) => {
  const { schema } = req.params;
  const payload = req.body || {};
  await sleep(35);

  res.json({
    success: true,
    action: 'formUpdate',
    schema,
    modifiedCount: 1,
    updatedAt: new Date().toISOString(),
    record: payload
  });
});

// 4. POST /forms/formDelete/:schema
router.post('/formDelete/:schema', async (req, res) => {
  const { schema } = req.params;
  await sleep(30);

  res.json({
    success: true,
    action: 'formDelete',
    schema,
    deletedCount: 1,
    deletedAt: new Date().toISOString()
  });
});

// 5. POST /forms/operation
router.post('/operation', async (req, res) => {
  const { formId, buttonId, payload = {} } = req.body;
  await sleep(45);

  res.json({
    success: true,
    action: 'operation',
    formId: formId || 'defaultForm',
    buttonId: buttonId || 'actionButton',
    operationResult: {
      status: 'executed',
      effect: 'Inventory adjusted / state transitioned',
      inventoryUpdated: true,
      timestamp: new Date().toISOString()
    }
  });
});

export default router;
