const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUserContext = (req) => req.user || (req.session && req.session.user) || {};

router.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { entityType, entityId, limit, offset } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('listAuditLog', { filters: { entityType, entityId, limit, offset }, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
