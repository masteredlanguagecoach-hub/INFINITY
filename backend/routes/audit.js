const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUserContext = (req) => req.user || (req.session && req.session.user) || {};

const sendError = (res, error, defaultMsg = 'Audit log retrieval failed') => {
  console.error('Audit Route Error:', error);
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
    const { entityType, entityId, limit, offset, search, user, module } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('listAuditLog', { filters: { entityType, entityId, limit, offset, search, user, module }, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch audit log');
  }
});

module.exports = router;
