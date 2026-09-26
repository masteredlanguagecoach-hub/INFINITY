const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const response = await callAppsScript('login', { email, password });
    
    if (response.success && response.user) {
      // Apps Script returns fields with exact column header names from Google Sheets
      // Normalize to a consistent session user object
      const u = response.user;
      req.session.user = {
        userId: u['User ID'] || u.userId || u.id,
        name: u['Name'] || u.name,
        email: u['Email'] || u.email,
        role: u['Role'] || u.role,
        department: u['Department'] || u.department,
        status: u['Status'] || u.status,
        capacity: u['Capacity'] || u.capacity,
        sessionId: response.sessionId
      };

      res.json({ success: true, user: req.session.user });
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
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Unable to connect to authentication service.' }
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
  res.json({ success: true, user: req.session.user });
});

router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ active: true, user: req.session.user });
  } else {
    res.json({ active: false });
  }
});

module.exports = router;
