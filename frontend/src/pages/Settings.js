import { api } from '../api.js';
import { showToast } from '../components/Toast.js';

export const Settings = {
  async render(container) {
    container.innerHTML = `
      <h2>Settings</h2>
      
      <div class="card mb-4">
        <h3>System Status</h3>
        <div class="mt-4" style="display:flex; gap:1rem;">
          <button id="btn-test-db" class="btn btn-outline">Test Database Connection</button>
          <button id="btn-discover" class="btn btn-outline">Discover Sheets</button>
        </div>
        <pre id="sys-output" style="margin-top:1rem; padding:1rem; background:var(--bg); border:1px solid var(--border); border-radius:var(--radius); display:none; white-space:pre-wrap;"></pre>
      </div>
      
      <div class="card">
        <h3>Application Settings</h3>
        <div id="settings-form-container" class="mt-4">
          <div class="loader-container"><div class="loader"></div></div>
        </div>
      </div>
    `;

    const sysOut = document.getElementById('sys-output');
    
    document.getElementById('btn-test-db').addEventListener('click', async () => {
      sysOut.style.display = 'block';
      sysOut.textContent = 'Testing connection...';
      try {
        const res = await api.testDbConnection();
        sysOut.textContent = JSON.stringify(res.data, null, 2);
      } catch (e) {
        sysOut.textContent = `Error: ${e.message}`;
      }
    });

    document.getElementById('btn-discover').addEventListener('click', async () => {
      sysOut.style.display = 'block';
      sysOut.textContent = 'Discovering sheets...';
      try {
        const res = await api.discoverSheets();
        sysOut.textContent = JSON.stringify(res.data, null, 2);
      } catch (e) {
        sysOut.textContent = `Error: ${e.message}`;
      }
    });

    try {
      const res = await api.getSettings();
      const settings = res.data;
      
      let html = '<form id="settings-form" class="grid grid-cols-2 gap-4">';
      for (const [key, val] of Object.entries(settings)) {
        html += `
          <div class="form-group">
            <label class="form-label">${key}</label>
            <input type="text" name="${key}" class="form-control" value="${val}">
          </div>
        `;
      }
      html += '<div style="grid-column: span 2"><button type="submit" class="btn btn-primary">Save Settings</button></div>';
      html += '</form>';
      
      document.getElementById('settings-form-container').innerHTML = html;
      
      document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
          await api.updateSettings(data);
          showToast('Settings saved successfully', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
      
    } catch (e) {
      document.getElementById('settings-form-container').innerHTML = `<div style="color:var(--danger)">Error loading settings: ${e.message}</div>`;
    }
  }
};
