import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';

export const DecisionCenter = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Decision Center</h2>
        <span class="badge badge-primary">Operational Intelligence</span>
      </div>
      <div id="dc-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;

    try {
      const res = await api.getDecisionCenter();
      const raw = (res && res.data) ? res.data : res || {};
      const insights = raw.insights || {};
      const employeeList = raw.employeeStats || raw.employeeWorkload || raw.employees || [];
      const alerts = raw.alerts || [];

      let html = '';

      // Alerts
      if (alerts && alerts.length > 0) {
        html += `
          <div class="card mb-4" style="border-left: 4px solid var(--danger);">
            <h3 style="color:var(--danger)">⚠️ Action Required</h3>
            <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
              ${alerts.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Format insight values cleanly
      const hw = insights.highestWorkloadEmployee;
      const highestWorkloadStr = (hw && typeof hw === 'object' && hw.name) 
        ? `${hw.name} (${hw.utilizationPercent ?? hw.utilization ?? 0}%)` 
        : (typeof hw === 'string' ? hw : 'None');

      const ho = insights.highestOverdueEmployee;
      const highestOverdueStr = (ho && typeof ho === 'object' && ho.name) 
        ? `${ho.name} (${ho.overdueCount ?? ho.overdueTasks ?? 0} overdue)` 
        : (typeof ho === 'string' ? ho : 'None');

      const backlogTypeStr = insights.highestBacklogTaskType || 'None';
      const bottleneckDeptsStr = (insights.bottleneckDepartments && insights.bottleneckDepartments.length > 0) 
        ? insights.bottleneckDepartments.join(', ') 
        : 'None';

      // Insights Cards
      html += `
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="card">
            <div class="stat-title">Highest Workload</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--text);">${highestWorkloadStr}</div>
          </div>
          <div class="card">
            <div class="stat-title">Highest Overdue</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--danger);">${highestOverdueStr}</div>
          </div>
          <div class="card">
            <div class="stat-title">Highest Backlog Type</div>
            <div class="stat-value" style="font-size:1.15rem; color:var(--primary);">${backlogTypeStr}</div>
          </div>
          <div class="card">
            <div class="stat-title">Bottleneck Depts</div>
            <div class="stat-value" style="font-size:1.15rem; color:${bottleneckDeptsStr !== 'None' ? 'var(--warning)' : 'inherit'};">${bottleneckDeptsStr}</div>
          </div>
        </div>
      `;

      html += `
        <div class="card mb-4">
          <h3>Employee Workload & Capacity Signals</h3>
          <p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:1rem;">
            🟢 <strong>AVAILABLE</strong> (&lt;80%) &nbsp;|&nbsp; 
            🟠 <strong>HIGH</strong> (80-99%) &nbsp;|&nbsp; 
            🔴 <strong>OVERLOADED</strong> (≥100%)
          </p>
          <div id="emp-table-container"></div>
        </div>
      `;

      document.getElementById('dc-content').innerHTML = html;

      // Render employee table
      renderDataTable(document.getElementById('emp-table-container'), {
        columns: [
          { label: 'Employee', render: r => `<strong>${r.name || r.userName || '-'}</strong>` },
          { label: 'Department', render: r => r.department || r.Department || '-' },
          { label: 'Open Tasks', render: r => r.openCount ?? r.openTasks ?? 0 },
          { label: 'Completed', render: r => r.completedCount ?? r.completedTasks ?? 0 },
          { label: 'Overdue', render: r => {
            const count = r.overdueCount ?? r.overdueTasks ?? 0;
            return count > 0 ? `<span style="color:var(--danger);font-weight:bold;">${count}</span>` : '0';
          }},
          { label: 'Capacity', render: r => r.capacity ?? 40 },
          { label: 'Utilization', render: (r) => {
            const util = r.utilizationPercent !== undefined ? r.utilizationPercent : (r.utilization ?? 0);
            const color = util >= 100 ? 'progress-red' : (util >= 80 ? 'progress-orange' : 'progress-green');
            return `
              <div style="min-width:120px;">
                <div style="font-size:0.8rem; margin-bottom:2px;">${util}%</div>
                <div class="progress-bar-bg" style="height:6px;">
                  <div class="progress-bar-fill ${color}" style="width:${Math.min(util, 100)}%;"></div>
                </div>
              </div>
            `;
          }},
          { label: 'Signal', render: (r) => {
            const signal = r.signal || (r.utilizationPercent >= 100 ? 'OVERLOADED' : (r.utilizationPercent >= 80 ? 'HIGH' : 'AVAILABLE'));
            const badgeClass = signal === 'OVERLOADED' ? 'badge-danger' : (signal === 'HIGH' ? 'badge-warning' : 'badge-success');
            return `<span class="badge ${badgeClass}">${signal}</span>`;
          }}
        ],
        data: employeeList,
        emptyMessage: 'No employee workload records found.'
      });

    } catch (err) {
      document.getElementById('dc-content').innerHTML = `<div style="color:var(--danger); padding:1rem;">Failed to load Decision Center: ${err.message}</div>`;
    }
  }
};

