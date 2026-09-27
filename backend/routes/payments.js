const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUserContext = (req) => req.user || (req.session && req.session.user) || {};

const sendError = (res, error, defaultMsg = 'Payment operation failed') => {
  console.error('Payments Route Error:', error);
  let message = defaultMsg;
  let code = 'SERVER_ERROR';
  if (error) {
    if (typeof error.error === 'object' && error.error) {
      message = error.error.message || defaultMsg;
      code = error.error.code || code;
    } else if (typeof error.error === 'string') {
      message = error.error;
    } else if (error.message) {
      message = error.message;
    }
  }
  res.status(500).json({ success: false, error: { code, message: String(message) } });
};

router.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('listPayments', { userId, role, sessionId, filters: { status, limit, offset } });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to list payments');
  }
});

router.get('/summary', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getPaymentSummary', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch payment summary');
  }
});

router.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getPayment', { paymentId: id, id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch payment');
  }
});

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const data = req.body;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('createPayment', { data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to create payment');
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('updatePayment', { paymentId: id, data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to update payment');
  }
});

module.exports = router;
