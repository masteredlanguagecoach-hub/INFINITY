import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';
import { router } from '../router.js';

export const Team = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Production Team Overview</h2>
        <span class="badge badge-primary">Staff Workload & Capacity</span>
      </div>
      <div id="team-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;

    try {
      const res = await api.getDecisionCenter();
      const raw = res.data || res || {};
      const teamData = raw.employeeStats || raw.employeeWorkload || raw.employees || [];

      const html = `
        <div class="card">
          <div id="team-table"></div>
        </div>
      `;
      
      document.getElementById('team-content').innerHTML = html;

      renderDataTable(document.getElementById('team-table'), {
        columns: [
          { label: 'Employee', render: r => `<strong>${r.name || r.userName || '-'}</strong>` },
          { label: 'Department', render: r => r.department || r.Department || 'Video Editing' },
          { label: 'Open Tasks', render: r => r.openCount ?? r.openTasks ?? 0 },
          { label: 'Completed Tasks', render: r => r.completedCount ?? r.completedTasks ?? 0 },
          { label: 'Overdue Tasks', render: (r) => {
            const count = r.overdueCount ?? r.overdueTasks ?? 0;
            return `<span style="color:${count > 0 ? 'var(--danger)' : 'inherit'}; font-weight:${count > 0 ? 'bold' : 'normal'}">${count}</span>`;
          }},
          { label: 'Capacity', render: r => r.capacity ?? 40 },
          { label: 'Utilization', render: (r) => {
            const util = r.utilizationPercent !== undefined ? r.utilizationPercent : (r.utilization ?? 0);
            const color = util >= 100 ? 'progress-red' : (util >= 80 ? 'progress-orange' : 'progress-green');
            return `
              <div style="min-width:120px;">
                <div style="font-size:0.8rem; margin-bottom:2px;">${util}%</div>
                <div class="progress-bar-bg" style="height:6px; margin:0;">
                  <div class="progress-bar-fill ${color}" style="width:${Math.min(util, 100)}%;"></div>
                </div>
              </div>
            `;
          }},
          { label: 'Workload Signal', render: (r) => {
            const signal = r.signal || (r.utilizationPercent >= 100 ? 'OVERLOADED' : (r.utilizationPercent >= 80 ? 'HIGH' : 'AVAILABLE'));
            const badge = signal === 'OVERLOADED' ? 'badge-danger' : (signal === 'HIGH' ? 'badge-warning' : 'badge-success');
            return `<span class="badge ${badge}">${signal}</span>`;
          }}
        ],
        data: teamData,
        emptyMessage: 'No team workload records found.',
        onRowClick: (row) => {
          window.location.hash = '#/tasks';
        }
      });
      
    } catch (err) {
      const msg = (typeof err === 'object') ? (err.message || JSON.stringify(err)) : String(err);
      document.getElementById('team-content').innerHTML = `<div style="color:var(--danger); padding:1rem;">Failed to load team data: ${msg}</div>`;
    }
  }
};
