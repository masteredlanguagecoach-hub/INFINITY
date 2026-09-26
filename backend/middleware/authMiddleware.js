const ROLE_PERMISSIONS = {
  ADMIN: ['ADMIN', 'MANAGER', 'TEAM_LEADER', 'EDITOR', 'DATA_ENTRY', 'VIEWER'],
  MANAGER: ['MANAGER', 'TEAM_LEADER', 'EDITOR', 'DATA_ENTRY', 'VIEWER'],
  TEAM_LEADER: ['TEAM_LEADER', 'EDITOR', 'VIEWER'],
  EDITOR: ['EDITOR', 'VIEWER'],
  DATA_ENTRY: ['DATA_ENTRY', 'VIEWER'],
  VIEWER: ['VIEWER']
};

/**
 * Require authentication middleware
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized', message: 'You must be logged in' });
  }
  next();
}

/**
 * Require specific role middleware
 * @param {...string} roles Allowed roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized', message: 'You must be logged in' });
    }

    const userRole = req.session.user.role;
    
    // Admin always has access if ADMIN is in the list or if the user is an ADMIN.
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
  ROLE_PERMISSIONS
};
