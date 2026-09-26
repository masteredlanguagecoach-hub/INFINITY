import { api } from './api.js';
import { auth } from './auth.js';
import { router } from './router.js';
import { renderLayout } from './components/Layout.js';
import { showToast } from './components/Toast.js';

import { Login } from './pages/Login.js';
import { Dashboard } from './pages/Dashboard.js';
import { DecisionCenter } from './pages/DecisionCenter.js';
import { Jobs } from './pages/Jobs.js';
import { Tasks } from './pages/Tasks.js';
import { Team } from './pages/Team.js';
import { Payments } from './pages/Payments.js';
import { Reports } from './pages/Reports.js';
import { Users } from './pages/Users.js';
import { Audit } from './pages/Audit.js';
import { Settings } from './pages/Settings.js';

const app = document.getElementById('app');

const routes = {
  '/login': { page: Login },
  '/': { page: Dashboard, module: 'dashboard' },
  '/decision-center': { page: DecisionCenter, module: 'decision-center' },
  '/jobs': { page: Jobs, module: 'jobs' },
  '/tasks': { page: Tasks, module: 'tasks' },
  '/team': { page: Team, module: 'team' },
  '/payments': { page: Payments, module: 'payments' },
  '/reports': { page: Reports, module: 'reports' },
  '/users': { page: Users, module: 'users' },
  '/audit': { page: Audit, module: 'audit' },
  '/settings': { page: Settings, module: 'settings' },
  '*': { page: Dashboard, module: 'dashboard' }
};

function renderPage(routeObj, container) {
  if (!routeObj || !container) return;
  const target = routeObj.page || routeObj.render;
  if (target && typeof target.render === 'function') {
    target.render(container);
  } else if (typeof target === 'function') {
    target(container);
  }
}

async function init() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  try {
    const res = await api.getMe();
    const user = res.user || (res.data && res.data.user) || res.data;
    if (user) {
      auth.setUser(user);
    }
  } catch (err) {
    auth.clearUser();
  }

  // Create toast container if not exists
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  router.onRoute((route) => {
    if (!auth.isAuthenticated()) {
      appContainer.innerHTML = '';
      renderPage(route, appContainer);
    } else {
      renderLayout(appContainer, auth.getUser());
      const contentArea = document.getElementById('page-content');
      if (contentArea) {
        contentArea.innerHTML = '';
        renderPage(route, contentArea);
      }
    }
  });

  router.init(routes);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


