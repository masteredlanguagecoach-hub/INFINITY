const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUser = (req) => req.user || (req.session && req.session.user) || {};

router.get('/', requireAuth, async (req, res) => {
  try {
    const { jobId, status, assigneeId } = req.query;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('listTasks', { userId, role, sessionId, jobId, status, assigneeId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('getTask', { id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'DATA_ENTRY'), async (req, res) => {
  try {
    const data = req.body;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('createTask', { data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('updateTask', { taskId: id, data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.post('/:id/assign', requireAuth, requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('assignTask', { taskId: id, assignedTo, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;

