import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';

export const Reports = {
  render(container) {
    container.innerHTML = `
      <h2>Reports</h2>
      <div class="card mb-4">
        <div style="display:flex; gap:1rem; border-bottom:1px solid var(--border); margin-bottom:1rem; padding-bottom:0.5rem;">
          <button class="btn btn-outline rep-tab active" data-type="monthly">Monthly Overview</button>
          <button class="btn btn-outline rep-tab" data-type="employee">Employee Performance</button>
          <button class="btn btn-outline rep-tab" data-type="worktype">Work Type</button>
        </div>
        
        <div id="report-filters" style="display:flex; gap:1rem; align-items:end; margin-bottom:1rem;">
          <!-- dynamic filters -->
        </div>
        
        <button id="btn-load-report" class="btn btn-primary">Load Report</button>
      </div>
      
      <div class="card">
        <div id="report-results">Please select parameters and load report.</div>
      </div>
    `;

    let currentType = 'monthly';

    const renderFilters = () => {
      const filters = document.getElementById('report-filters');
      if (currentType === 'monthly') {
        const d = new Date();
        filters.innerHTML = `
          <div class="form-group" style="margin:0"><label class="form-label">Year</label><input type="number" id="rf-year" class="form-control" value="${d.getFullYear()}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">Month</label>
            <select id="rf-month" class="form-control">
              ${Array.from({length:12}, (_,i) => `<option value="${i+1}" ${d.getMonth()===i?'selected':''}>${new Date(2000,i,1).toLocaleString('default',{month:'long'})}</option>`).join('')}
            </select>
          </div>
        `;
      } else {
        const end = new Date().toISOString().substring(0,10);
        const start = new Date(Date.now() - 30*24*60*60*1000).toISOString().substring(0,10);
        filters.innerHTML = `
          <div class="form-group" style="margin:0"><label class="form-label">Start Date</label><input type="date" id="rf-start" class="form-control" value="${start}"></div>
          <div class="form-group" style="margin:0"><label class="form-label">End Date</label><input type="date" id="rf-end" class="form-control" value="${end}"></div>
        `;
      }
    };

    const loadReport = async () => {
      const resContainer = document.getElementById('report-results');
      resContainer.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
      
      try {
        let res;
        if (currentType === 'monthly') {
          const y = document.getElementById('rf-year').value;
          const m = document.getElementById('rf-month').value;
          res = await api.getMonthlyReport(y, m);
          
          resContainer.innerHTML = `
            <h3>Summary for ${y}-${m.padStart(2,'0')}</h3>
            <div class="grid grid-cols-4 gap-4 mt-4 mb-4">
              <div class="card"><div class="stat-title">Completed Jobs</div><div class="stat-value">${res.data.summary.completedJobs}</div></div>
              <div class="card"><div class="stat-title">New Jobs</div><div class="stat-value">${res.data.summary.newJobs}</div></div>
              <div class="card"><div class="stat-title">Revenue Received</div><div class="stat-value">$${res.data.summary.revenueReceived.toLocaleString()}</div></div>
            </div>
            <h4>Jobs Breakdown</h4>
            <div id="rep-table"></div>
          `;
          renderDataTable(document.getElementById('rep-table'), {
            columns: [
              { label: 'Job ID', key: 'id' },
              { label: 'Client', key: 'clientName' },
              { label: 'Work Type', key: 'workType' },
              { label: 'Status', key: 'status' }
            ],
            data: res.data.jobs
          });

        } else if (currentType === 'employee') {
          const s = document.getElementById('rf-start').value;
          const e = document.getElementById('rf-end').value;
          res = await api.getEmployeePerformanceReport(s, e);
          
          resContainer.innerHTML = `<h3>Employee Performance (${s} to ${e})</h3><div id="rep-table" class="mt-4"></div>`;
          renderDataTable(document.getElementById('rep-table'), {
            columns: [
              { label: 'Employee ID', key: 'employeeId' },
              { label: 'Tasks Completed', key: 'completedTasks' },
              { label: 'Overdue Tasks', key: 'overdueTasks' }
            ],
            data: res.data
          });

        } else if (currentType === 'worktype') {
          const s = document.getElementById('rf-start').value;
          const e = document.getElementById('rf-end').value;
          res = await api.getWorkTypeReport(s, e);
          
          resContainer.innerHTML = `<h3>Work Type Summary (${s} to ${e})</h3><div id="rep-table" class="mt-4"></div>`;
          renderDataTable(document.getElementById('rep-table'), {
            columns: [
              { label: 'Work Type', key: 'workType' },
              { label: 'Total Jobs', key: 'count' },
              { label: 'Total Value', render: r => `$${r.totalValue.toLocaleString()}` }
            ],
            data: res.data
          });
        }
      } catch (err) {
        resContainer.innerHTML = `<div style="color:var(--danger)">Error: ${err.message}</div>`;
      }
    };

    document.querySelectorAll('.rep-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.rep-tab').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentType = e.target.dataset.type;
        renderFilters();
        document.getElementById('report-results').innerHTML = 'Please select parameters and load report.';
      });
    });

    document.getElementById('btn-load-report').addEventListener('click', loadReport);

    renderFilters();
  }
};
