const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUserContext = (req) => req.user || (req.session && req.session.user) || {};

const reportRoles = ['ADMIN', 'MANAGER', 'VIEWER'];

router.get('/monthly', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { month, year } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getMonthlyReport', { month, year, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/employee-performance', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getEmployeePerformanceReport', { startDate, endDate, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/work-type', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getWorkTypeReport', { startDate, endDate, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/department', requireAuth, requireRole(...reportRoles), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getDepartmentReport', { startDate, endDate, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
