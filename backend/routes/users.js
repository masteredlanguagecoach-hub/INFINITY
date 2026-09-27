const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const formatResponse = (response) => response.success !== undefined ? response : { success: true, data: response };

const getUserContext = (req) => req.user || (req.session && req.session.user) || {};

const sendError = (res, error, defaultMsg = 'User operation failed') => {
  console.error('Users Route Error:', error);
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
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('listUsers', { userId, role: 'ADMIN', sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to list users');
  }
});

router.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('getUser', { id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to fetch user');
  }
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const data = req.body;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('createUser', { data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to create user');
  }
});

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('updateUser', { targetUserId: id, data, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to update user');
  }
});

router.post('/:id/activate', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('activateUser', { targetUserId: id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to activate user');
  }
});

router.post('/:id/deactivate', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('deactivateUser', { targetUserId: id, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to deactivate user');
  }
});

router.post('/:id/role', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole, role: roleFromBody } = req.body;
    const roleToSet = newRole || roleFromBody;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('changeRole', { targetUserId: id, newRole: roleToSet, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to update user role');
  }
});

router.post('/:id/reset-password', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, password } = req.body;
    const pwToSet = newPassword || password;
    const { userId, role, sessionId } = getUserContext(req);
    const response = await callAppsScript('resetPassword', { targetUserId: id, newPassword: pwToSet, userId, role, sessionId });
    res.json(formatResponse(response));
  } catch (error) {
    sendError(res, error, 'Failed to reset password');
  }
});

module.exports = router;
