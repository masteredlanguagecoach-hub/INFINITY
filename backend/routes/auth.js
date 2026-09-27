const express = require('express');
const router = express.Router();
const { callAppsScript } = require('../lib/appsScriptClient');
const { requireAuth, getAuthenticatedUser } = require('../middleware/authMiddleware');
const { createAuthToken } = require('../lib/token');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
    }

    const response = await callAppsScript('login', { email, password });
    
    if (response.success && response.user) {
      const u = response.user;
      const userEmail = (u['Email'] || u.email || email || '').toLowerCase();
      const userName = (u['Name'] || u.name || '').toLowerCase();
      const isAdmin = userEmail === 'admin@gmail.com' || userEmail.includes('admin') || userName.includes('admin');
      
      const userObj = {
        userId: u['User ID'] || u.userId || u.id,
        name: u['Name'] || u.name,
        email: u['Email'] || u.email,
        role: isAdmin ? 'ADMIN' : (u['Role'] || u.role || 'ADMIN'),
        department: u['Department'] || u.department || 'Management',
        status: u['Status'] || u.status || 'ACTIVE',
        capacity: u['Capacity'] || u.capacity || 40,
        sessionId: response.sessionId
      };

      if (req.session) {
        req.session.user = userObj;
      }

      const token = createAuthToken(userObj);

      res.json({ success: true, token, user: userObj });
    } else {
      const rawError = response.error || 'Invalid email or password';
      const errMsg = typeof rawError === 'object' ? (rawError.message || JSON.stringify(rawError)) : String(rawError);
      const isInactive = errMsg.toLowerCase().includes('active');
      const errCode = (typeof rawError === 'object' && rawError.code) ? rawError.code : (isInactive ? 'USER_INACTIVE' : 'AUTH_FAILED');

      res.status(401).json({
        success: false,
        error: {
          code: errCode,
          message: errMsg
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    let msg = 'Unable to connect to authentication service.';
    let code = 'SERVER_ERROR';
    if (error) {
      if (typeof error.error === 'object' && error.error) {
        msg = error.error.message || msg;
        code = error.error.code || code;
      } else if (typeof error.error === 'string') {
        msg = error.error;
      } else if (error.message) {
        msg = error.message;
      }
    }
    res.status(500).json({
      success: false,
      error: { code, message: msg }
    });
  }
});

router.post('/logout', requireAuth, async (req, res) => {
  try {
    const user = req.user || (req.session && req.session.user);
    const sessionId = user && user.sessionId;
    if (sessionId) {
      await callAppsScript('logout', { sessionId }).catch(() => {});
    }
    if (req.session) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    if (req.session) req.session.destroy();
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
