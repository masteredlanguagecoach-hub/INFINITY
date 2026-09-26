import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';
import { router } from '../router.js';

export const Team = {
  async render(container) {
    container.innerHTML = `
      <h2>Team Overview</h2>
      <div id="team-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;

    try {
      const res = await api.getDecisionCenter();
      const teamData = res.data.employeeWorkload;

      const html = `
        <div class="card">
          <div id="team-table"></div>
        </div>
      `;
      
      document.getElementById('team-content').innerHTML = html;

      renderDataTable(document.getElementById('team-table'), {
        columns: [
          { label: 'Employee', key: 'name' },
          { label: 'Department', key: 'department' },
          { label: 'Open Tasks', key: 'openTasks' },
          { label: 'Capacity', key: 'capacity' },
          { label: 'Utilization', render: (r) => {
            const util = r.utilization;
            const color = util > 90 ? 'var(--danger)' : (util > 75 ? 'var(--warning)' : 'var(--success)');
            return `<div style="display:flex;align-items:center;gap:0.5rem">
              <div style="width:50px">${util}%</div>
              <div class="progress-bar-bg" style="width:100px;margin:0"><div class="progress-bar-fill" style="background-color:${color};width:${Math.min(util,100)}%"></div></div>
            </div>`;
          }},
          { label: 'Completed', key: 'completedTasks' },
          { label: 'Overdue', render: (r) => `<span style="color:${r.overdueTasks>0?'var(--danger)':'inherit'}">${r.overdueTasks}</span>` },
          { label: 'Signal', render: (r) => `<span class="badge badge-${r.signal.includes('OVERLOADED') ? 'OVERLOADED' : (r.signal==='HIGH'?'HIGH-SIGNAL':'AVAILABLE')}">${r.signal}</span>` }
        ],
        data: teamData,
        onRowClick: (row) => {
          router.navigate(`/tasks?assigneeId=${row.id}`); // This requires router support for query params, or just navigate to tasks and let user filter.
          // For simplicity, just navigate to tasks
          window.location.hash = '#/tasks';
          setTimeout(() => {
            const sel = document.getElementById('filter-assignee');
            if (sel) {
              sel.value = row.id;
              sel.dispatchEvent(new Event('change'));
            }
          }, 100);
        }
      });
      
    } catch (err) {
      document.getElementById('team-content').innerHTML = `<div style="color:var(--danger)">Failed to load team data: ${err.message}</div>`;
    }
  }
};
