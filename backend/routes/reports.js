const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUserContext = (req) => req.user || (req.session && req.session.user) || {};

const sendError = (res, error, defaultMsg = 'Report generation failed') => {
  console.error('Reports Route Error:', error);
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

const reportRoles = ['ADMIN', 'MANAGER', 'VIEWER'];

router.get('/monthly', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { month, year } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getMonthlyReport', { month, year, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch monthly report');
  }
});

router.get('/employee-performance', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getEmployeePerformanceReport', { startDate, endDate, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch performance report');
  }
});

router.get('/work-type', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getWorkTypeReport', { startDate, endDate, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch work type report');
  }
});

router.get('/department', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getDepartmentReport', { startDate, endDate, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch department report');
  }
});

module.exports = router;
