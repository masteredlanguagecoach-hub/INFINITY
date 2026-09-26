import { api } from '../api.js';
import { auth } from '../auth.js';
import { router } from '../router.js';

export const Login = {
  render(container) {
    container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card">
          <div class="login-brand">
            <div class="brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h1>PRODUCTION DECISION CENTER</h1>
            <p class="brand-subtitle">Operations & Decision Intelligence System</p>
          </div>

          <form id="login-form" class="login-form">
            <div id="login-error" class="login-error-alert" style="display:none;"></div>
            
            <div class="form-group">
              <label class="form-label" for="email">Work Email</label>
              <div class="input-with-icon">
                <span class="input-icon">✉️</span>
                <input type="email" id="email" class="form-control" placeholder="admin@gmail.com" required autocomplete="username">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="input-with-icon">
                <span class="input-icon">🔒</span>
                <input type="password" id="password" class="form-control" placeholder="••••••••" required autocomplete="current-password">
                <button type="button" id="toggle-pw" class="pw-toggle-btn" title="Toggle password visibility">👁️</button>
              </div>
            </div>

            <button type="submit" id="submit-btn" class="btn btn-primary btn-block btn-lg">
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          <div class="login-footer">
            <span>Connected to Google Sheets Database</span>
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('login-form');
    const togglePw = document.getElementById('toggle-pw');
    const pwInput = document.getElementById('password');
    const errorDiv = document.getElementById('login-error');
    const submitBtn = document.getElementById('submit-btn');

    togglePw.addEventListener('click', () => {
      if (pwInput.type === 'password') {
        pwInput.type = 'text';
      } else {
        pwInput.type = 'password';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = pwInput.value;

      errorDiv.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loader-sm"></span> Signing In...';

      try {
        const res = await api.login(email, password);
        const loggedInUser = res.user || (res.data && res.data.user) || res.data;
        if (loggedInUser) {
          auth.setUser(loggedInUser);
          router.navigate('/');
        } else {
          throw new Error('Invalid login response from server');
        }
      } catch (error) {
        errorDiv.textContent = error.message || 'Authentication failed. Please check your credentials.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In to Dashboard</span>';
      }
    });
  }
};

