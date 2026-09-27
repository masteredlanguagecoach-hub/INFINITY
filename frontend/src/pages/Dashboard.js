import { api } from '../api.js';

export const Dashboard = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2>Executive Dashboard</h2>
          <span class="badge badge-success">Live Google Sheets Database</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <label for="dashboard-month-filter" style="font-size:0.875rem; font-weight:600; color:var(--text-muted);">Period:</label>
          <select id="dashboard-month-filter" class="form-control" style="width:190px; padding:0.4rem 0.6rem; font-size:0.875rem;">
            <option value="ALL">All (Full 2026)</option>
            <option value="2026-01">January 2026</option>
            <option value="2026-02">February 2026</option>
            <option value="2026-03">March 2026</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-06">June 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-11">November 2026</option>
            <option value="2026-12">December 2026</option>
          </select>
        </div>
      </div>
      <div id="dash-content">
        <div class="loader-container"><div class="loader"></div></div>
      </div>
    `;

    const monthSelect = document.getElementById('dashboard-month-filter');

    const loadDashboard = async () => {
      const selectedMonth = monthSelect.value;
      const contentEl = document.getElementById('dash-content');
      contentEl.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

      try {
        const [dashRes, jobsRes, tasksRes, usersRes] = await Promise.all([
          api.getDashboard().catch(() => ({})),
          api.getJobs().catch(() => ({ jobs: [] })),
          api.getTasks().catch(() => ({ tasks: [] })),
          api.getUsers().catch(() => ({ users: [] }))
        ]);

        const allJobs = (jobsRes && jobsRes.data && jobsRes.data.jobs) || jobsRes.jobs || (Array.isArray(jobsRes.data) ? jobsRes.data : []);
        const allTasks = (tasksRes && tasksRes.data && tasksRes.data.tasks) || tasksRes.tasks || (Array.isArray(tasksRes.data) ? tasksRes.data : []);
        const allUsers = (usersRes && usersRes.data && usersRes.data.users) || usersRes.users || (Array.isArray(usersRes.data) ? usersRes.data : []);

        // Filter by month if selected
        let filteredJobs = allJobs;
        let filteredTasks = allTasks;

        if (selectedMonth !== 'ALL') {
          filteredJobs = allJobs.filter(j => {
            const inD = j['In Date'] || j.inDate || '';
            const dueD = j['Due Date'] || j.dueDate || '';
            const notes = j.Notes || j.notes || '';
            const sheet = (notes.match(/Sheet:\s*([A-Za-z0-9_\s]+)/i) || [])[1] || '';
            
            const monthMap = {
              '2026-01': ['2026-01', 'JAN', 'JAN 26', 'JAN_26'],
              '2026-02': ['2026-02', 'FEB', 'FEB 26', 'FEB_26'],
              '2026-03': ['2026-03', 'MAR'],
              '2026-04': ['2026-04', 'APR'],
              '2026-05': ['2026-05', 'MAY'],
              '2026-06': ['2026-06', 'JUNE', 'JUN'],
              '2026-07': ['2026-07', 'JULY', 'JUL'],
              '2026-08': ['2026-08', 'AUG'],
              '2026-09': ['2026-09', 'SEP'],
              '2026-10': ['2026-10', 'OCT'],
              '2026-11': ['2026-11', 'NOV'],
              '2026-12': ['2026-12', 'DEC']
            };
            const tags = monthMap[selectedMonth] || [selectedMonth];
            return tags.some(t => sheet.toUpperCase().includes(t) || inD.includes(t) || dueD.includes(t));
          });

          const jobIds = new Set(filteredJobs.map(j => j['Job ID'] || j.jobId));
          filteredTasks = allTasks.filter(t => jobIds.has(t['Job ID'] || t.jobId));
        }

        // If a future / template month has 0 jobs
        if (selectedMonth !== 'ALL' && filteredJobs.length === 0) {
          contentEl.innerHTML = `
            <div class="card" style="padding: 3rem 1.5rem; text-align: center; color: var(--text-muted);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📅</div>
              <h3>No historical production data.</h3>
              <p style="font-size:0.9rem; margin-top:0.3rem;">There are no recorded jobs or task assignments for the selected period in the historical workbook.</p>
            </div>
          `;
          return;
        }

        // Calculate KPI values
        const totalJobs = filteredJobs.length;
        const openTasks = filteredTasks.filter(t => t.Status !== 'COMPLETED').length;
        const completedTasks = filteredTasks.filter(t => t.Status === 'COMPLETED').length;
        const now = new Date();
        const overdueTasks = filteredTasks.filter(t => t.Status !== 'COMPLETED' && t['Due Date'] && new Date(t['Due Date']) < now).length;
        const totalTaskCount = filteredTasks.length;
        const completionRate = totalTaskCount > 0 ? Math.round((completedTasks / totalTaskCount) * 100) : (totalJobs > 0 ? 100 : 0);

        // Task distribution
        const taskStatusDist = {};
        filteredTasks.forEach(t => {
          const s = t.Status || 'COMPLETED';
          taskStatusDist[s] = (taskStatusDist[s] || 0) + 1;
        });

        // Work type distribution
        const workTypeDist = {};
        filteredJobs.forEach(j => {
          const wt = j['Work Type'] || j.workType || 'Video Editing';
          workTypeDist[wt] = (workTypeDist[wt] || 0) + 1;
        });

        // Workload by employee
        const empWorkloadMap = {};
        allUsers.filter(u => u.Role !== 'ADMIN').forEach(u => {
          empWorkloadMap[u.Name] = {
            id: u['User ID'] || u.id,
            name: u.Name,
            capacity: parseInt(u.Capacity) || 40,
            open: 0,
            completed: 0
          };
        });

        filteredTasks.forEach(t => {
          const assignee = t['Assigned Name'] || t['Assigned To'] || '';
          if (assignee && empWorkloadMap[assignee]) {
            if (t.Status === 'COMPLETED') empWorkloadMap[assignee].completed++;
            else empWorkloadMap[assignee].open++;
          }
        });

        const employeeWorkload = Object.values(empWorkloadMap);
        const activeEmployees = allUsers.filter(u => u.Status === 'ACTIVE').length;
        const overloadedStaff = employeeWorkload.filter(e => (e.open / (e.capacity || 40)) >= 1.0).length;

        const html = `
          <div class="dashboard-grid">
            <div class="card stat-card"><div class="stat-title">Total Jobs</div><div class="stat-value">${totalJobs}</div></div>
            <div class="card stat-card"><div class="stat-title">Open Tasks</div><div class="stat-value">${openTasks}</div></div>
            <div class="card stat-card"><div class="stat-title">Completed Tasks</div><div class="stat-value" style="color:var(--success)">${completedTasks}</div></div>
            <div class="card stat-card"><div class="stat-title">Overdue Tasks</div><div class="stat-value" style="color:var(--danger)">${overdueTasks}</div></div>
            <div class="card stat-card"><div class="stat-title">Completion Rate</div><div class="stat-value">${completionRate}%</div></div>
            <div class="card stat-card"><div class="stat-title">Active Staff</div><div class="stat-value">${activeEmployees}</div></div>
            <div class="card stat-card"><div class="stat-title">Overloaded Staff</div><div class="stat-value" style="color:${overloadedStaff > 0 ? 'var(--danger)' : 'inherit'}">${overloadedStaff}</div></div>
            <div class="card stat-card"><div class="stat-title">Total Tasks</div><div class="stat-value" style="color:var(--primary)">${totalTaskCount}</div></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="card">
              <h3>Task Status Distribution</h3>
              <div style="margin-top:1rem;">
                ${Object.keys(taskStatusDist).length === 0 ? '<p style="color:var(--text-muted);font-size:0.875rem;">No tasks recorded for this period.</p>' :
                  Object.entries(taskStatusDist).map(([status, count]) => `
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border);">
                    <span class="badge badge-${status}">${status}</span>
                    <strong>${count}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="card">
              <h3>Top Work Types</h3>
              <div style="margin-top:1rem; max-height:260px; overflow-y:auto;">
                ${Object.keys(workTypeDist).length === 0 ? '<p style="color:var(--text-muted);font-size:0.875rem;">No jobs recorded for this period.</p>' :
                  Object.entries(workTypeDist).slice(0, 8).map(([type, count]) => `
                  <div style="display:flex; justify-content:space-between; margin-bottom:0.6rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border); font-size:0.85rem;">
                    <span>${type}</span>
                    <strong>${count}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          
          <div class="card mb-4">
            <h3>Employee Workload & Capacity</h3>
            <div style="margin-top:1rem;">
              ${employeeWorkload.length === 0 ? '<p style="color:var(--text-muted);font-size:0.875rem;">No active production staff found.</p>' :
                employeeWorkload.map(emp => {
                  const util = emp.capacity > 0 ? Math.round((emp.open / emp.capacity) * 100) : 0;
                  const color = util >= 100 ? 'progress-red' : (util >= 80 ? 'progress-orange' : 'progress-green');
                  return `
                    <div style="margin-bottom:1rem;">
                      <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:0.3rem;">
                        <span><strong>${emp.name}</strong></span>
                        <span>${util}% (${emp.open} open / ${emp.completed} completed)</span>
                      </div>
                      <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${color}" style="width: ${Math.min(util, 100)}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
            </div>
          </div>
        `;
        
        contentEl.innerHTML = html;
        
      } catch (err) {
        const msg = (typeof err === 'object') ? (err.message || JSON.stringify(err)) : String(err);
        contentEl.innerHTML = `<div style="color:var(--danger); padding:1rem;">Failed to load dashboard: ${msg}</div>`;
      }
    };

    monthSelect.addEventListener('change', loadDashboard);
    loadDashboard();
  }
};
