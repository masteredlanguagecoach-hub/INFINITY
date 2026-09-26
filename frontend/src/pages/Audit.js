import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';

export const Audit = {
  async render(container) {
    container.innerHTML = `
      <h2>Audit Log</h2>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center;">
        <select id="filter-module" class="form-control" style="max-width:200px;">
          <option value="">All Modules</option>
          <option value="JOBS">JOBS</option>
          <option value="TASKS">TASKS</option>
          <option value="PAYMENTS">PAYMENTS</option>
          <option value="USERS">USERS</option>
        </select>
        <select id="filter-action" class="form-control" style="max-width:200px;">
          <option value="">All Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="audit-table-container"></div>
    `;

    const loadAudit = async () => {
      const module = document.getElementById('filter-module').value;
      const action = document.getElementById('filter-action').value;
      
      let query = '?';
      if (module) query += `module=${module}&`;
      if (action) query += `action=${action}`;

      const tContainer = document.getElementById('audit-table-container');
      renderDataTable(tContainer, { loading: true });

      try {
        const res = await api.getAuditLog(query);
        renderDataTable(tContainer, {
          columns: [
            { label: 'Timestamp', render: r => new Date(r.timestamp).toLocaleString() },
            { label: 'User', key: 'userName' },
            { label: 'Action', key: 'action' },
            { label: 'Module', key: 'module' },
            { label: 'Record ID', key: 'recordId' },
            { label: 'Changes', render: r => {
              if (r.action === 'UPDATE' && r.changes) {
                return `<div style="font-size:0.75rem; max-width:300px; overflow-x:auto;">
                  ${Object.entries(r.changes).map(([k,v]) => `${k}: ${v.old} → ${v.new}`).join('<br>')}
                </div>`;
              }
              return '-';
            }}
          ],
          data: res.data
        });
      } catch (err) {
        renderDataTable(tContainer, { error: err.message });
      }
    };

    document.getElementById('btn-refresh').addEventListener('click', loadAudit);
    document.getElementById('filter-module').addEventListener('change', loadAudit);
    document.getElementById('filter-action').addEventListener('change', loadAudit);

    loadAudit();
  }
};
