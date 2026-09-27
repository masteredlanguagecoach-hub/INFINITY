const { verifyAuthToken } = require('../lib/token');

const ROLE_PERMISSIONS = {
  ADMIN: ['ADMIN', 'MANAGER', 'TEAM_LEADER', 'EDITOR', 'DATA_ENTRY', 'VIEWER'],
  MANAGER: ['MANAGER', 'TEAM_LEADER', 'EDITOR', 'DATA_ENTRY', 'VIEWER'],
  TEAM_LEADER: ['TEAM_LEADER', 'EDITOR', 'VIEWER'],
  EDITOR: ['EDITOR', 'VIEWER'],
  DATA_ENTRY: ['DATA_ENTRY', 'VIEWER'],
  VIEWER: ['VIEWER']
};

/**
 * Extract authenticated user from session or Bearer token header
 */
function getAuthenticatedUser(req) {
  // 1. Check active in-memory session
  if (req.session && req.session.user) {
    return req.session.user;
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = verifyAuthToken(token);
    if (user) {
      // Sync back to session if session store exists
      if (req.session) req.session.user = user;
      return user;
    }
  }

  // 3. Check X-Auth-Token header
  const customHeader = req.headers['x-auth-token'];
  if (customHeader) {
    const user = verifyAuthToken(customHeader);
    if (user) {
      if (req.session) req.session.user = user;
      return user;
    }
  }

  return null;
}

/**
 * Require authentication middleware
 */
function requireAuth(req, res, next) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', message: 'You must be logged in' });
  }
  req.user = user;
  if (req.session) req.session.user = user;
  next();
}

/**
 * Require specific role middleware
 * @param {...string} roles Allowed roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'You must be logged in' });
    }
    req.user = user;
    if (req.session) req.session.user = user;

    const userRole = user.role;
    
    // Admin always has access
    if (userRole === 'ADMIN') {
      return next();
    }

    const hasRole = roles.includes(userRole);
    if (!hasRole) {
      return res.status(403).json({ success: false, error: 'Forbidden', message: 'You do not have permission to access this resource' });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
  getAuthenticatedUser,
  ROLE_PERMISSIONS
};

