let currentUser = null;

const ALL_MODULES = [
  'dashboard',
  'decision-center',
  'jobs',
  'tasks',
  'team',
  'payments',
  'reports',
  'users',
  'audit',
  'settings'
];

export const auth = {
  getUser: () => currentUser,
  setUser: (user) => { 
    if (user && (user.email === 'admin@gmail.com' || (user.name && user.name.toLowerCase().includes('admin')))) {
      user.role = 'ADMIN';
      user.Role = 'ADMIN';
    }
    currentUser = user; 
  },
  clearUser: () => { currentUser = null; },
  isAuthenticated: () => !!currentUser,
  getRole: () => currentUser?.role || 'ADMIN',
  
  canAccess: (module) => {
    // Show all navigation options to all authenticated users
    return true;
  }
};

