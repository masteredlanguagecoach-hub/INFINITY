import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';
import { openModal, closeModal, confirmModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export const Jobs = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2>Jobs Management</h2>
          <span class="badge badge-primary">Historical & Operational Jobs</span>
        </div>
        <button id="btn-new-job" class="btn btn-primary">+ New Job</button>
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <input type="text" id="search-job" class="form-control" placeholder="Search Client / Company..." style="max-width:220px;">
        <select id="filter-month" class="form-control" style="max-width:180px;">
          <option value="">All Months (2026)</option>
          <option value="JAN">January 2026</option>
          <option value="FEB">February 2026</option>
          <option value="MAR">March 2026</option>
          <option value="APR">April 2026</option>
          <option value="MAY">May 2026</option>
          <option value="JUNE">June 2026</option>
          <option value="JULY">July 2026</option>
          <option value="AUG">August 2026</option>
          <option value="SEP">September 2026</option>
          <option value="OCT">October 2026</option>
          <option value="NOV">November 2026</option>
          <option value="DEC">December 2026</option>
        </select>
        <select id="filter-status" class="form-control" style="max-width:150px;">
          <option value="">All Statuses</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="ON_HOLD">ON_HOLD</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="jobs-table-container"></div>
    `;

    const loadJobs = async () => {
      const search = document.getElementById('search-job').value.trim().toLowerCase();
      const monthFilter = document.getElementById('filter-month').value;
      const status = document.getElementById('filter-status').value;

      const tContainer = document.getElementById('jobs-table-container');
      renderDataTable(tContainer, { loading: true });

      try {
        const res = await api.getJobs();
        let list = Array.isArray(res.data) ? res.data : (res.data?.jobs || res.jobs || []);

        if (search) {
          list = list.filter(j => {
            const client = (j.Client || j.client || '').toLowerCase();
            const comp = (j.Company || j.company || '').toLowerCase();
            const loc = (j.Location || j.location || '').toLowerCase();
            const wt = (j['Work Type'] || j.workType || '').toLowerCase();
            const id = (j['Job ID'] || j.jobId || '').toLowerCase();
            return client.includes(search) || comp.includes(search) || loc.includes(search) || wt.includes(search) || id.includes(search);
          });
        }

        if (status) {
          list = list.filter(j => (j.Status || j.status) === status);
        }

        if (monthFilter) {
          list = list.filter(j => {
            const inD = j['In Date'] || j.inDate || '';
            const dueD = j['Due Date'] || j.dueDate || '';
            const notes = j.Notes || j.notes || '';
            const id = j['Job ID'] || j.jobId || '';
            return id.toUpperCase().includes(monthFilter) || notes.toUpperCase().includes(monthFilter) || inD.includes(monthFilter) || dueD.includes(monthFilter);
          });
        }

        if (monthFilter && list.length === 0) {
          renderDataTable(tContainer, {
            data: [],
            emptyMessage: `No historical production data for ${document.getElementById('filter-month').selectedOptions[0].text}.`
          });
          return;
        }

        renderDataTable(tContainer, {
          columns: [
            { label: 'Job / Legacy ID', render: r => `<strong>${r['Job ID'] || r.id || r.jobId || '-'}</strong>` },
            { label: 'Client / Company', render: r => r.Client || r.Company || r.client || '-' },
            { label: 'Location', render: r => r.Location || r.location || '-' },
            { label: 'Work Description', render: r => r['Work Type'] || r.workType || r.Function || '-' },
            { label: 'In Date', render: r => r['In Date'] || r.inDate || '-' },
            { label: 'Due / Out Date', render: r => r['Due Date'] || r.dueDate || '-' },
            { label: 'Status', render: r => {
              const s = r.Status || r.status || 'COMPLETED';
              const badge = s === 'COMPLETED' ? 'badge-success' : (s === 'CANCELLED' ? 'badge-danger' : 'badge-warning');
              return `<span class="badge ${badge}">${s}</span>`;
            }},
            { label: 'Actions', render: (r) => `
              <div style="display:flex; gap:0.4rem;">
                <button class="btn btn-outline btn-sm btn-view-job" data-id="${r['Job ID'] || r.jobId}">Details</button>
              </div>
            `}
          ],
          data: list,
          emptyMessage: 'No jobs found matching your filter criteria.',
          onRowClick: (job) => showJobModal(job)
        });

        // Bind View buttons
        tContainer.querySelectorAll('.btn-view-job').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const jId = btn.getAttribute('data-id');
            const found = list.find(x => (x['Job ID'] || x.jobId) === jId);
            if (found) showJobModal(found);
          });
        });

      } catch (err) {
        renderDataTable(tContainer, { error: err.message || err });
      }
    };

    const showJobModal = async (job) => {
      const jobId = job['Job ID'] || job.jobId || job.id;
      let relatedTasks = [];
      try {
        const taskRes = await api.getTasks();
        const allTasks = taskRes.tasks || (taskRes.data && taskRes.data.tasks) || (Array.isArray(taskRes.data) ? taskRes.data : []);
        relatedTasks = allTasks.filter(t => (t['Job ID'] || t.jobId) === jobId);
      } catch (e) {}

      const content = `
        <div style="font-size:0.9rem;">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Job / Legacy ID</p>
              <strong style="font-size:1.05rem; color:var(--primary);">${jobId}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Status</p>
              <span class="badge badge-${(job.Status || 'COMPLETED').toLowerCase()}">${job.Status || 'COMPLETED'}</span>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Client / Company</p>
              <strong>${job.Client || job.Company || '-'}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Location</p>
              <strong>${job.Location || '-'}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">In Date</p>
              <strong>${job['In Date'] || '-'}</strong>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Due / Out Date</p>
              <strong>${job['Due Date'] || '-'}</strong>
            </div>
            <div style="grid-column: span 2;">
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Function & Work Description</p>
              <strong>${job['Work Type'] || job.Function || '-'}</strong>
            </div>
            <div style="grid-column: span 2;">
              <p style="color:var(--text-muted); font-size:0.8rem; margin-bottom:2px;">Historical Notes & Source Traceability</p>
              <div style="background:var(--bg); padding:0.6rem; border-radius:6px; font-family:monospace; font-size:0.8rem;">
                ${job.Notes || 'No additional notes'}
              </div>
            </div>
          </div>

          <h4 style="margin-top:1.2rem; margin-bottom:0.6rem; border-top:1px solid var(--border); padding-top:0.8rem;">
            Assigned Production Stages & Tasks (${relatedTasks.length})
          </h4>
          <div>
            ${relatedTasks.length === 0 ? '<p style="color:var(--text-muted); font-size:0.85rem;">No stage task assignments for this job.</p>' :
              `<div class="table-container">
                <table>
                  <thead>
                    <tr><th>Stage</th><th>Assigned Staff</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    ${relatedTasks.map(t => `
                      <tr>
                        <td><strong>${t['Task Type'] || t.taskType}</strong></td>
                        <td>${t['Assigned Name'] || t['Assigned To'] || 'Unassigned'}</td>
                        <td><span class="badge badge-${(t.Status || 'COMPLETED').toLowerCase()}">${t.Status || 'COMPLETED'}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>`
            }
          </div>
        </div>
      `;

      openModal({
        title: `Production Job: ${jobId}`,
        content: content,
        actions: [
          { label: 'Close', class: 'btn-secondary', onClick: closeModal }
        ]
      });
    };

    const showNewJobModal = () => {
      const content = `
        <form id="form-new-job">
          <div class="form-group">
            <label class="form-label">Client / Wedding Company *</label>
            <input type="text" id="new-client" class="form-control" required placeholder="e.g. Iconic Photography">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input type="text" id="new-location" class="form-control" placeholder="e.g. Chennai">
            </div>
            <div class="form-group">
              <label class="form-label">Work Type / Function</label>
              <input type="text" id="new-worktype" class="form-control" placeholder="e.g. Highlights + Reel">
            </div>
            <div class="form-group">
              <label class="form-label">In Date</label>
              <input type="date" id="new-indate" class="form-control" value="${new Date().toISOString().slice(0,10)}">
            </div>
            <div class="form-group">
              <label class="form-label">Due Date</label>
              <input type="date" id="new-duedate" class="form-control">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <textarea id="new-notes" class="form-control" rows="2" placeholder="System, Link, Camera details..."></textarea>
          </div>
        </form>
      `;

      openModal({
        title: 'Create New Production Job',
        content,
        actions: [
          { label: 'Cancel', class: 'btn-secondary', onClick: closeModal },
          {
            label: 'Create Job',
            class: 'btn-primary',
            onClick: async () => {
              const client = document.getElementById('new-client').value.trim();
              if (!client) {
                alert('Client name is required.');
                return;
              }
              const location = document.getElementById('new-location').value.trim();
              const workType = document.getElementById('new-worktype').value.trim();
              const inDate = document.getElementById('new-indate').value;
              const dueDate = document.getElementById('new-duedate').value;
              const notes = document.getElementById('new-notes').value.trim();

              try {
                await api.createJob({
                  Client: client,
                  Company: client,
                  Location: location,
                  WorkType: workType,
                  Function: workType,
                  InDate: inDate,
                  DueDate: dueDate,
                  Notes: notes,
                  Status: 'IN_PROGRESS'
                });
                showToast('New job created successfully!', 'success');
                closeModal();
                loadJobs();
              } catch (err) {
                alert('Failed to create job: ' + err.message);
              }
            }
          }
        ]
      });
    };

    document.getElementById('search-job').addEventListener('input', loadJobs);
    document.getElementById('filter-month').addEventListener('change', loadJobs);
    document.getElementById('filter-status').addEventListener('change', loadJobs);
    document.getElementById('btn-refresh').addEventListener('click', loadJobs);
    document.getElementById('btn-new-job').addEventListener('click', showNewJobModal);

    loadJobs();
  }
};
