import { api } from '../api.js';

export const Dashboard = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Executive Dashboard</h2>
        <span class="badge badge-success">Live Google Sheets Sync</span>
      </div>
      <div id="dash-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;

    try {
      const res = await api.getDashboard();
      const raw = (res && res.data) ? res.data : res || {};
      const kpis = raw.kpis || {
        totalJobs: raw.totalJobs || 0,
        openTasks: raw.openTasks || 0,
        completedTasks: raw.completedTasks || 0,
        overdueTasks: raw.overdueTasks || 0,
        completionRate: raw.completionRate || 0,
        activeEmployees: raw.activeEmployees || 0,
        overloadedEmployees: raw.overloadedEmployees || 0,
        pendingPayments: raw.pendingPayments || 0,
        revenue: raw.totalRevenue || raw.revenue || 0,
        outstandingBalance: raw.outstandingBalance || 0
      };

      const taskStatusDist = raw.taskStatusDist || raw.taskStatusDistribution || {};
      const workTypeDist = raw.workTypeDist || raw.workTypeDistribution || {};
      const employeeWorkload = raw.employeeWorkload || raw.workloadByEmployee || [];
      const recentActivity = raw.recentActivity || [];

      const html = `
        <div class="dashboard-grid">
          <div class="card stat-card"><div class="stat-title">Total Jobs</div><div class="stat-value">${kpis.totalJobs ?? 0}</div></div>
          <div class="card stat-card"><div class="stat-title">Open Tasks</div><div class="stat-value">${kpis.openTasks ?? 0}</div></div>
          <div class="card stat-card"><div class="stat-title">Completed Tasks</div><div class="stat-value" style="color:var(--success)">${kpis.completedTasks ?? 0}</div></div>
          <div class="card stat-card"><div class="stat-title">Overdue Tasks</div><div class="stat-value" style="color:var(--danger)">${kpis.overdueTasks ?? 0}</div></div>
          <div class="card stat-card"><div class="stat-title">Completion Rate</div><div class="stat-value">${kpis.completionRate ?? 0}%</div></div>
          <div class="card stat-card"><div class="stat-title">Active Employees</div><div class="stat-value">${kpis.activeEmployees ?? 0}</div></div>
          <div class="card stat-card"><div class="stat-title">Overloaded Staff</div><div class="stat-value" style="color:${(kpis.overloadedEmployees || 0) > 0 ? 'var(--danger)' : 'inherit'}">${kpis.overloadedEmployees ?? 0}</div></div>
          <div class="card stat-card"><div class="stat-title">Pending Payments</div><div class="stat-value">${kpis.pendingPayments ?? 0}</div></div>
          <div class="card stat-card"><div class="stat-title">Total Revenue</div><div class="stat-value" style="color:var(--primary)">$${(kpis.revenue || 0).toLocaleString()}</div></div>
          <div class="card stat-card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${(kpis.outstandingBalance || 0).toLocaleString()}</div></div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="card">
            <h3>Task Status Distribution</h3>
            <div style="margin-top:1rem;">
              ${Object.keys(taskStatusDist).length === 0 ? '<p style="color:var(--text-muted);font-size:0.875rem;">No task data recorded yet.</p>' :
                Object.entries(taskStatusDist).map(([status, count]) => `
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                  <span class="badge badge-${status}">${status}</span>
                  <strong>${count}</strong>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="card">
            <h3>Work Type Distribution</h3>
            <div style="margin-top:1rem;">
              ${Object.keys(workTypeDist).length === 0 ? '<p style="color:var(--text-muted);font-size:0.875rem;">No jobs recorded yet.</p>' :
                Object.entries(workTypeDist).map(([type, count]) => `
                <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                  <span>${type}</span>
                  <strong>${count}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="card mb-4">
          <h3>Workload by Employee</h3>
          <div style="margin-top:1rem;">
            ${employeeWorkload.length === 0 ? '<p style="color:var(--text-muted);font-size:0.875rem;">No active employees found.</p>' :
              employeeWorkload.map(emp => {
                const util = emp.utilization !== undefined ? emp.utilization : (emp.capacity > 0 ? Math.round(((emp.open || emp.openTasks || 0) / emp.capacity) * 100) : 0);
                const openCount = emp.openTasks !== undefined ? emp.openTasks : (emp.open || 0);
                const color = util >= 100 ? 'progress-red' : (util >= 80 ? 'progress-orange' : 'progress-green');
                return `
                  <div style="margin-bottom:1rem;">
                    <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.3rem;">
                      <span><strong>${emp.name}</strong></span>
                      <span>${util}% (${openCount} / ${emp.capacity || 40} tasks)</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill ${color}" style="width: ${Math.min(util, 100)}%;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
          </div>
        </div>
        
        <div class="card">
          <h3>Recent Operational Activity</h3>
          <div style="margin-top:1rem;">
            ${recentActivity.length === 0 ? '<p style="color:var(--text-muted);font-size:0.875rem;">No audit activities recorded yet.</p>' :
              recentActivity.map(act => `
                <div style="padding:0.6rem 0; border-bottom:1px solid var(--border); font-size:0.875rem; display:flex; justify-content:space-between;">
                  <div>
                    <strong>${act.userName || 'System'}</strong>
                    <span style="color:var(--text-muted)"> ${act.action} ${act.module || ''} ${(act.recordId ? `[${act.recordId}]` : '')}</span>
                  </div>
                  <span style="color:var(--text-muted); font-size:0.8rem;">${act.timestamp ? new Date(act.timestamp).toLocaleString() : ''}</span>
                </div>
              `).join('')}
          </div>
        </div>
      `;
      
      document.getElementById('dash-content').innerHTML = html;
      
    } catch (err) {
      document.getElementById('dash-content').innerHTML = `<div style="color:var(--danger); padding:1rem;">Failed to load dashboard: ${err.message}</div>`;
    }
  }
};

