import { auth } from '../auth.js';
import { api } from '../api.js';

export function renderLayout(container, user) {
  if (document.getElementById('sidebar')) return; // Already rendered
  
  const navItems = [
    { name: 'Dashboard', path: '#/', module: 'dashboard', icon: '📊' },
    { name: 'Decision Center', path: '#/decision-center', module: 'decision-center', icon: '🎯' },
    { name: 'Jobs', path: '#/jobs', module: 'jobs', icon: '💼' },
    { name: 'Tasks', path: '#/tasks', module: 'tasks', icon: '📋' },
    { name: 'Team', path: '#/team', module: 'team', icon: '👥' },
    { name: 'Payments', path: '#/payments', module: 'payments', icon: '💰' },
    { name: 'Reports', path: '#/reports', module: 'reports', icon: '📈' },
    { name: 'Users', path: '#/users', module: 'users', icon: '⚙️' },
    { name: 'Audit Log', path: '#/audit', module: 'audit', icon: '📝' },
    { name: 'Settings', path: '#/settings', module: 'settings', icon: '🔧' }
  ];

  const filteredNav = navItems.filter(item => auth.canAccess(item.module));

  container.innerHTML = `
    <div id="sidebar">
      <div class="sidebar-header">PDC Center</div>
      <nav class="sidebar-nav">
        ${filteredNav.map(item => `
          <a href="${item.path}" class="nav-link" data-path="${item.path}">
            ${item.icon} ${item.name}
          </a>
        `).join('')}
      </nav>
    </div>
    <div id="main-wrapper">
      <header id="header">
        <button id="menu-toggle">☰</button>
        <div class="header-right" style="display:flex; gap:1rem; align-items:center;">
          <span class="user-info">${user ? (user.name || user.Name || user.email || 'User') : ''} (${user ? (user.role || user.Role || 'ADMIN') : ''})</span>
          <button id="logout-btn" class="btn btn-outline btn-sm">Logout</button>
        </div>

      </header>
      <main id="page-content"></main>
    </div>
  `;

  // Highlight active link
  const updateActiveLink = () => {
    const hash = window.location.hash || '#/';
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === hash) link.classList.add('active');
      else link.classList.remove('active');
    });
  };
  window.addEventListener('hashchange', updateActiveLink);
  updateActiveLink();

  // Mobile menu toggle
  const sidebar = document.getElementById('sidebar');
  document.getElementById('menu-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
  
  // Close sidebar when clicking outside on mobile
  document.getElementById('main-wrapper').addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && e.target.id !== 'menu-toggle') {
      sidebar.classList.remove('open');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    }
    auth.clearUser();
    window.location.hash = '#/login';
    window.location.reload();
  });
}
