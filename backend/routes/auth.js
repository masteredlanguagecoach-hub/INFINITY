const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, getAuthenticatedUser } = require('../middleware/authMiddleware');
const { createAuthToken } = require('../lib/token');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const response = await callAppsScript('login', { email, password });
    
    if (response.success && response.user) {
      const u = response.user;
      const userObj = {
        userId: u['User ID'] || u.userId || u.id,
        name: u['Name'] || u.name,
        email: u['Email'] || u.email,
        role: u['Role'] || u.role,
        department: u['Department'] || u.department,
        status: u['Status'] || u.status,
        capacity: u['Capacity'] || u.capacity,
        sessionId: response.sessionId
      };

      if (req.session) {
        req.session.user = userObj;
      }

      const token = createAuthToken(userObj);

      res.json({ success: true, token, user: userObj });
    } else {

      const errMsg = response.error || 'Invalid email or password';
      const isInactive = typeof errMsg === 'string' && errMsg.toLowerCase().includes('active');
      res.status(401).json({
        success: false,
        error: {
          code: isInactive ? 'USER_INACTIVE' : 'AUTH_FAILED',
          message: errMsg
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    const msg = (error && error.error && error.error.message) || error.message || 'Unable to connect to authentication service.';
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: msg }
    });
  }
});


router.post('/logout', requireAuth, async (req, res) => {
  try {
    const sessionId = req.session.user.sessionId;
    // Best-effort: invalidate Apps Script session too
    if (sessionId) {
      await callAppsScript('logout', { sessionId }).catch(() => {});
    }
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
    });
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  const user = req.user || getAuthenticatedUser(req);
  res.json({ success: true, user });
});

router.get('/session', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    res.json({ active: true, user });
  } else {
    res.json({ active: false });
  }
});

module.exports = router;

