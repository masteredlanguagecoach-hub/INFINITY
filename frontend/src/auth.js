let currentUser = null;

const ROLE_PERMISSIONS = {
  ADMIN: ['dashboard', 'decision-center', 'jobs', 'tasks', 'team', 'payments', 'reports', 'users', 'audit', 'settings'],
  MANAGER: ['dashboard', 'decision-center', 'jobs', 'tasks', 'team', 'payments', 'reports', 'audit'],
  TEAM_LEADER: ['dashboard', 'decision-center', 'jobs', 'tasks', 'team'],
  EDITOR: ['dashboard', 'tasks', 'jobs', 'team'],
  DATA_ENTRY: ['jobs', 'tasks'],
  VIEWER: ['dashboard', 'decision-center', 'reports']
};

export const auth = {
  getUser: () => currentUser,
  setUser: (user) => { currentUser = user; },
  clearUser: () => { currentUser = null; },
  isAuthenticated: () => !!currentUser,
  getRole: () => currentUser?.role || null,
  
  canAccess: (module) => {
    if (!currentUser || !currentUser.role) return false;
    if (currentUser.role === 'ADMIN') return true;
    const permissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return permissions.includes(module);
  }
};

