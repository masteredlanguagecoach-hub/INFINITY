const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const sendError = (res, error, defaultMsg = 'Unable to fetch dashboard data') => {
  console.error('Dashboard Error:', error);
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

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user || (req.session && req.session.user) || {};
    const { userId, role, sessionId } = user;
    
    const response = await callAppsScript('getDashboard', { userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
