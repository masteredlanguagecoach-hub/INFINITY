const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, async (req, res) => {
  try {
    const { userId, role, sessionId } = req.session.user;
    
    const response = await callAppsScript('getDashboard', { userId, role, sessionId });
    res.json(response.success !== undefined ? response : { success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
