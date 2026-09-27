const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

router.get('/', requireAuth, requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'VIEWER'), async (req, res) => {
  try {
    const user = req.user || (req.session && req.session.user) || {};
    const { userId, role, sessionId } = user;
    
    const response = await callAppsScript('getDecisionCenter', { userId, role, sessionId });
    res.json(formatResponse(response));

  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
