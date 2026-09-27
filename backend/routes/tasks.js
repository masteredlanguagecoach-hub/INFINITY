const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUser = (req) => req.user || (req.session && req.session.user) || {};

const sendError = (res, error, defaultMsg = 'Tasks operation failed') => {
  console.error('Tasks Route Error:', error);
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
    const { jobId, status, assigneeId, search } = req.query;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('listTasks', { userId, role, sessionId, filters: { jobId, status, assigneeId, search } });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to list tasks');
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('getTask', { taskId: id, id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch task');
  }
});

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'DATA_ENTRY'), async (req, res) => {
  try {
    const data = req.body;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('createTask', { data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to create task');
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
    sendError(res, error, 'Failed to update task');
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
    sendError(res, error, 'Failed to assign task');
  }
});

module.exports = router;
