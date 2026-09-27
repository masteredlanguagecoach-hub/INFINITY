const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUser = (req) => req.user || (req.session && req.session.user) || {};

const sendError = (res, error, defaultMsg = 'Jobs operation failed') => {
  console.error('Jobs Route Error:', error);
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
    const { status, limit, offset, search, priority } = req.query;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('listJobs', { userId, role, sessionId, filters: { status, limit, offset, search, priority } });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to list jobs');
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('getJob', { jobId: id, id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch job');
  }
});

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER', 'DATA_ENTRY'), async (req, res) => {
  try {
    const data = req.body;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('createJob', { data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to create job');
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'DATA_ENTRY'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('updateJob', { jobId: id, data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to update job');
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUser(req);

    const response = await callAppsScript('deleteJob', { jobId: id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to delete job');
  }
});

module.exports = router;
