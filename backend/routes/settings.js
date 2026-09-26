const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('getSettings', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.put('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const settings = req.body;
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('updateSettings', { settings, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/db-test', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('testConnection', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/discover-sheets', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId, role, sessionId } = req.session.user;
    const response = await callAppsScript('discoverSheets', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
