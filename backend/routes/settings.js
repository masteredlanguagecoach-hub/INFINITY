const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUserContext = (req) => req.user || (req.session && req.session.user) || {};

const sendError = (res, error, defaultMsg = 'Settings operation failed') => {
  console.error('Settings Route Error:', error);
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

router.get('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getSettings', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch settings');
  }
});

router.put('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const settings = req.body;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('updateSettings', { settings, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to update settings');
  }
});

// Support both /db-test and /test-db
router.get(['/db-test', '/test-db'], requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('testConnection', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Database connection test failed');
  }
});

// Support both /discover-sheets and /discover
router.get(['/discover-sheets', '/discover'], requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('discoverSheets', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Sheet discovery failed');
  }
});

module.exports = router;
