import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';
import { openModal, closeModal, confirmModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export const Jobs = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Jobs Management</h2>
        <button id="btn-new-job" class="btn btn-primary">+ New Job</button>
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <input type="text" id="search-job" class="form-control" placeholder="Search Client / Company..." style="max-width:240px;">
        <select id="filter-status" class="form-control" style="max-width:160px;">
          <option value="">All Statuses</option>
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="ON_HOLD">ON_HOLD</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select id="filter-priority" class="form-control" style="max-width:160px;">
          <option value="">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="jobs-table-container"></div>
    `;

    const loadJobs = async () => {
      const search = document.getElementById('search-job').value.trim();
      const status = document.getElementById('filter-status').value;
      const priority = document.getElementById('filter-priority').value;
      
      let params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      const query = params.toString() ? `?${params.toString()}` : '';

      const tContainer = document.getElementById('jobs-table-container');
      renderDataTable(tContainer, { loading: true });

      try {
        const res = await api.getJobs(query);
        const list = Array.isArray(res.data) ? res.data : (res.data?.jobs || res.jobs || []);
        
        renderDataTable(tContainer, {
          columns: [
            { label: 'Job ID', render: r => `<strong>${r['Job ID'] || r.id || r.jobId || '-'}</strong>` },
            { label: 'Client', render: r => r.Client || r.clientName || r.client || '-' },
            { label: 'Company', render: r => r.Company || r.companyName || r.company || '-' },
            { label: 'Work Type', render: r => r['Work Type'] || r.workType || '-' },
            { label: 'Priority', render: r => {
              const p = r.Priority || r.priority || 'MEDIUM';
              return `<span class="badge badge-${p}">${p}</span>`;
            }},
            { label: 'Status', render: r => {
              const s = r.Status || r.status || 'NEW';
              return `<span class="badge badge-${s}">${s}</span>`;
            }},
            { label: 'Due Date', render: r => {
              const d = r['Due Date'] || r.dueDate;
              return d ? new Date(d).toLocaleDateString() : '-';
            }},
            { label: 'Actions', render: r => {
              const jId = r['Job ID'] || r.id || r.jobId;
              return `
                <div style="display:flex;gap:0.5rem;">
                  <button class="btn btn-sm btn-outline edit-btn" data-id="${jId}">Edit</button>
                  <button class="btn btn-sm btn-danger del-btn" data-id="${jId}">Del</button>
                </div>
              `;
            }}
          ],
          data: list,
          emptyMessage: 'No jobs found. Click "+ New Job" to create your first job.',
          onRowClick: (row) => openJobDetail(row['Job ID'] || row.id || row.jobId)
        });

        tContainer.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openJobForm(e.target.dataset.id);
          });
        });
        tContainer.querySelectorAll('.del-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteJob(e.target.dataset.id);
          });
        });

      } catch (err) {
        renderDataTable(tContainer, { error: err.message });
      }
    };

    const deleteJob = (id) => {
      confirmModal({
        title: 'Delete Job',
        message: `Are you sure you want to cancel / delete job ${id}?`,
        onConfirm: async () => {
          try {
            await api.deleteJob(id);
            showToast('Job cancelled successfully', 'success');
            loadJobs();
          } catch (e) {
            showToast(e.message, 'error');
          }
        }
      });
    };

    const openJobDetail = async (id) => {
      try {
        const res = await api.getJob(id);
        const job = (res.data && res.data.job) ? res.data.job : (res.data || res);
        const jId = job['Job ID'] || job.id || id;
        const html = `
          <div class="grid grid-cols-2 gap-4">
            <div><strong>Client:</strong> ${job.Client || job.clientName || '-'}</div>
            <div><strong>Company:</strong> ${job.Company || job.companyName || '-'}</div>
            <div><strong>Work Type:</strong> ${job['Work Type'] || job.workType || '-'}</div>
            <div><strong>Location:</strong> ${job.Location || job.location || '-'}</div>
            <div><strong>Function:</strong> ${job.Function || job.function || '-'}</div>
            <div><strong>Status:</strong> <span class="badge badge-${job.Status || job.status}">${job.Status || job.status || 'NEW'}</span></div>
            <div><strong>Priority:</strong> <span class="badge badge-${job.Priority || job.priority}">${job.Priority || job.priority || 'MEDIUM'}</span></div>
            <div><strong>In Date:</strong> ${job['In Date'] || job.inDate ? new Date(job['In Date'] || job.inDate).toLocaleDateString() : '-'}</div>
            <div><strong>Due Date:</strong> ${job['Due Date'] || job.dueDate ? new Date(job['Due Date'] || job.dueDate).toLocaleDateString() : '-'}</div>
          </div>
          <div class="mt-4">
            <strong>Notes:</strong>
            <p style="background:var(--bg);padding:0.75rem;border-radius:4px;margin-top:0.3rem;">${job.Notes || job.notes || 'No notes provided.'}</p>
          </div>
        `;
        openModal({ title: `Job Details: ${jId}`, content: html, size: 'lg' });
      } catch (e) {
        showToast(e.message, 'error');
      }
    };

    const openJobForm = async (id = null) => {
      let job = {};
      if (id) {
        try {
          const res = await api.getJob(id);
          job = (res.data && res.data.job) ? res.data.job : (res.data || res);
        } catch (e) {
          return showToast(e.message, 'error');
        }
      }

      const clientVal = job.Client || job.clientName || '';
      const compVal = job.Company || job.companyName || '';
      const locVal = job.Location || job.location || '';
      const funcVal = job.Function || job.function || '';
      const typeVal = job['Work Type'] || job.workType || '';
      const prioVal = job.Priority || job.priority || 'MEDIUM';
      const statVal = job.Status || job.status || 'NEW';
      const inDateVal = job['In Date'] || job.inDate ? (job['In Date'] || job.inDate).substring(0,10) : new Date().toISOString().substring(0,10);
      const dueDateVal = job['Due Date'] || job.dueDate ? (job['Due Date'] || job.dueDate).substring(0,10) : '';
      const notesVal = job.Notes || job.notes || '';

      const html = `
        <form id="job-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Client Name *</label><input type="text" id="jf-client" class="form-control" value="${clientVal}" required></div>
            <div class="form-group"><label class="form-label">Company Name</label><input type="text" id="jf-company" class="form-control" value="${compVal}"></div>
            <div class="form-group"><label class="form-label">Location</label><input type="text" id="jf-location" class="form-control" value="${locVal}"></div>
            <div class="form-group"><label class="form-label">Function</label><input type="text" id="jf-function" class="form-control" value="${funcVal}"></div>
            <div class="form-group"><label class="form-label">Work Type *</label><input type="text" id="jf-type" class="form-control" value="${typeVal}" placeholder="e.g. Photography / Video Edit" required></div>
            <div class="form-group"><label class="form-label">Priority</label>
              <select id="jf-priority" class="form-control">
                ${['LOW','MEDIUM','HIGH','CRITICAL'].map(p => `<option value="${p}" ${prioVal===p?'selected':''}>${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">In Date *</label><input type="date" id="jf-indate" class="form-control" value="${inDateVal}" required></div>
            <div class="form-group"><label class="form-label">Due Date *</label><input type="date" id="jf-duedate" class="form-control" value="${dueDateVal}" required></div>
            ${id ? `
              <div class="form-group"><label class="form-label">Status</label>
                <select id="jf-status" class="form-control">
                  ${['NEW','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED'].map(s => `<option value="${s}" ${statVal===s?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
            ` : ''}
          </div>
          <div class="form-group mt-4"><label class="form-label">Notes</label><textarea id="jf-notes" class="form-control" rows="3" placeholder="Job instructions and notes...">${notesVal}</textarea></div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Job Record</button>
        </form>
      `;

      openModal({ title: id ? `Edit Job: ${id}` : 'Create New Job', content: html, size: 'lg' });

      document.getElementById('job-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          Client: document.getElementById('jf-client').value.trim(),
          Company: document.getElementById('jf-company').value.trim(),
          Location: document.getElementById('jf-location').value.trim(),
          Function: document.getElementById('jf-function').value.trim(),
          WorkType: document.getElementById('jf-type').value.trim(),
          Priority: document.getElementById('jf-priority').value,
          InDate: document.getElementById('jf-indate').value,
          DueDate: document.getElementById('jf-duedate').value,
          Notes: document.getElementById('jf-notes').value.trim()
        };
        if (id && document.getElementById('jf-status')) {
          data.Status = document.getElementById('jf-status').value;
        }

        try {
          if (id) await api.updateJob(id, data);
          else await api.createJob(data);
          showToast(`Job ${id ? 'updated' : 'created'} successfully`, 'success');
          closeModal();
          loadJobs();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    };

    document.getElementById('btn-new-job').addEventListener('click', () => openJobForm());
    document.getElementById('btn-refresh').addEventListener('click', loadJobs);
    document.getElementById('search-job').addEventListener('input', (e) => {
      if (e.target.timeout) clearTimeout(e.target.timeout);
      e.target.timeout = setTimeout(loadJobs, 400);
    });
    document.getElementById('filter-status').addEventListener('change', loadJobs);
    document.getElementById('filter-priority').addEventListener('change', loadJobs);

    loadJobs();
  }
};

