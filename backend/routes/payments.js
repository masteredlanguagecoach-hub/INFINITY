const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

router.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('listPayments', { userId, role, sessionId, status, limit, offset });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/summary', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('getPaymentSummary', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('getPayment', { paymentId: id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const data = req.body;
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('createPayment', { data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('updatePayment', { paymentId: id, data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
