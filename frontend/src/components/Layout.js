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
    { name: 'Users', path: '#/users', module: 'users', icon: '👤' },
    { name: 'Audit Log', path: '#/audit', module: 'audit', icon: '📝' },
    { name: 'Settings', path: '#/settings', module: 'settings', icon: '⚙️' }
  ];

  const filteredNav = navItems.filter(item => auth.canAccess(item.module));
  const userName = user ? (user.name || user.Name || user.email || 'Admin') : 'Admin';
  const userRole = user ? (user.role || user.Role || 'ADMIN') : 'ADMIN';
  const userInitials = userName.slice(0, 2).toUpperCase();

  container.innerHTML = `
    <aside id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        </div>
        <div class="sidebar-brand-text">
          <span class="brand-title">PDC CENTER</span>
          <span class="brand-sub">Production Intelligence</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-label">MAIN NAVIGATION</div>
        ${filteredNav.map(item => `
          <a href="${item.path}" class="nav-link" data-path="${item.path}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.name}</span>
            <span class="nav-arrow">›</span>
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-card">
          <div class="user-avatar">${userInitials}</div>
          <div class="user-details">
            <span class="user-name">${userName}</span>
            <span class="user-role-badge">${userRole}</span>
          </div>
          <button id="sidebar-logout-btn" class="logout-icon-btn" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div id="main-wrapper">
      <header id="header">
        <button id="menu-toggle" aria-label="Toggle Navigation">☰</button>
        <div class="header-breadcrumb" id="header-breadcrumb">Operations Dashboard</div>
        <div class="header-right">
          <span class="status-indicator-badge">🟢 Live DB</span>
          <span class="user-greeting">Hi, <strong>${userName}</strong></span>
          <button id="logout-btn" class="btn btn-outline btn-sm">Sign Out</button>
        </div>
      </header>
      <main id="page-content"></main>
    </div>
  `;

  // Highlight active link
  const updateActiveLink = () => {
    const hash = window.location.hash || '#/';
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
        const label = link.querySelector('.nav-label');
        if (label && document.getElementById('header-breadcrumb')) {
          document.getElementById('header-breadcrumb').textContent = label.textContent;
        }
      } else {
        link.classList.remove('active');
      }
    });
  };
  window.addEventListener('hashchange', updateActiveLink);
  updateActiveLink();

  // Mobile menu toggle
  const sidebar = document.getElementById('sidebar');
  document.getElementById('menu-toggle').addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
  });
  
  // Close sidebar when clicking outside on mobile
  document.getElementById('main-wrapper').addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && e.target.id !== 'menu-toggle') {
      sidebar.classList.remove('open');
    }
  });

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    }
    auth.clearUser();
    window.location.hash = '#/login';
    window.location.reload();
  };

  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  const sideLogout = document.getElementById('sidebar-logout-btn');
  if (sideLogout) sideLogout.addEventListener('click', handleLogout);
}
