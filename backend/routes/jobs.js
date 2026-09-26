const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    const { userId, role, sessionId } = req.session.user;

    const response = await callAppsScript('listJobs', { userId, role, sessionId, status, limit, offset });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = req.session.user;

    const response = await callAppsScript('getJob', { id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.post('/', requireAuth, requireRole('ADMIN', 'MANAGER', 'DATA_ENTRY'), async (req, res) => {
  try {
    const data = req.body;
    const { userId, role, sessionId } = req.session.user;

    const response = await callAppsScript('createJob', { data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER', 'TEAM_LEADER', 'DATA_ENTRY'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { userId, role, sessionId } = req.session.user;

    const response = await callAppsScript('updateJob', { jobId: id, data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

router.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = req.session.user;

    const response = await callAppsScript('deleteJob', { jobId: id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

module.exports = router;
