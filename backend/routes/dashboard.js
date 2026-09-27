const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user || (req.session && req.session.user) || {};
    const { userId, role, sessionId } = user;
    
    const response = await callAppsScript('getDashboard', { userId, role, sessionId });
    res.json(response.success !== undefined ? response : { success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }

});

module.exports = router;
