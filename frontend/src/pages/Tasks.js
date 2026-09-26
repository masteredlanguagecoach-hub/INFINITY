import { api } from '../api.js';
import { auth } from '../auth.js';
import { renderDataTable } from '../components/DataTable.js';
import { openModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export const Tasks = {
  async render(container) {
    container.innerHTML = `
      <div class="page-header">
        <h2>Tasks Management</h2>
        ${auth.canAccess('jobs') ? `<button id="btn-new-task" class="btn btn-primary">+ New Task</button>` : ''}
      </div>
      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
        <select id="filter-status" class="form-control" style="max-width:160px;">
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="ON_HOLD">ON_HOLD</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select id="filter-assignee" class="form-control" style="max-width:200px;">
          <option value="">All Assignees</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      <div id="tasks-table-container"></div>
    `;

    const populateAssignees = async () => {
      try {
        if (auth.getRole() !== 'EDITOR') {
          const res = await api.getUsers();
          const list = Array.isArray(res.data) ? res.data : (res.data?.users || res.users || []);
          const select = document.getElementById('filter-assignee');
          if (select) {
            list.forEach(u => {
              const uId = u['User ID'] || u.id || u.userId;
              const uName = u.Name || u.name || 'User';
              const opt = document.createElement('option');
              opt.value = uId;
              opt.textContent = `${uName} (${u.Department || u.department || 'Staff'})`;
              select.appendChild(opt);
            });
          }
        }
      } catch (e) {}
    };
    await populateAssignees();

    const loadTasks = async () => {
      const status = document.getElementById('filter-status').value;
      const assigneeId = document.getElementById('filter-assignee') ? document.getElementById('filter-assignee').value : '';
      
      let params = new URLSearchParams();
      if (status) params.append('status', status);
      if (assigneeId) params.append('assignedTo', assigneeId);
      const query = params.toString() ? `?${params.toString()}` : '';

      const tContainer = document.getElementById('tasks-table-container');
      renderDataTable(tContainer, { loading: true });

      try {
        const res = await api.getTasks(query);
        const list = Array.isArray(res.data) ? res.data : (res.data?.tasks || res.tasks || []);

        renderDataTable(tContainer, {
          columns: [
            { label: 'Task ID', render: r => `<strong>${r['Task ID'] || r.id || r.taskId || '-'}</strong>` },
            { label: 'Title', render: r => `<strong>${r.Title || r.title || '-'}</strong>` },
            { label: 'Type', render: r => `<span class="badge badge-primary">${r['Task Type'] || r.taskType || '-'}</span>` },
            { label: 'Job ID', render: r => r['Job ID'] || r.jobId || '-' },
            { label: 'Assigned To', render: r => r['Assigned Name'] || r.assignedName || r['Assigned To'] || r.assignedTo || 'Unassigned' },
            { label: 'Priority', render: r => {
              const p = r.Priority || r.priority || 'MEDIUM';
              return `<span class="badge badge-${p}">${p}</span>`;
            }},
            { label: 'Status', render: r => {
              const s = r.Status || r.status || 'PENDING';
              return `<span class="badge badge-${s}">${s}</span>`;
            }},
            { label: 'Due Date', render: r => {
              const d = r['Due Date'] || r.dueDate;
              return d ? new Date(d).toLocaleDateString() : '-';
            }},
            { label: 'Actions', render: r => {
              const tId = r['Task ID'] || r.id || r.taskId;
              return `<button class="btn btn-sm btn-outline edit-btn" data-id="${tId}">Edit</button>`;
            }}
          ],
          data: list,
          emptyMessage: 'No tasks found. Click "+ New Task" to create one.',
          onRowClick: (row) => openTaskForm(row['Task ID'] || row.id || row.taskId)
        });

        tContainer.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openTaskForm(e.target.dataset.id);
          });
        });

      } catch (err) {
        renderDataTable(tContainer, { error: err.message });
      }
    };

    const openTaskForm = async (id = null) => {
      let task = {};
      let users = [];
      let jobs = [];
      try {
        if (id) {
          const res = await api.getTask(id);
          task = (res.data && res.data.task) ? res.data.task : (res.data || res);
        }
        if (auth.canAccess('jobs')) {
          const uRes = await api.getUsers();
          const jRes = await api.getJobs();
          const uList = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.users || uRes.users || []);
          const jList = Array.isArray(jRes.data) ? jRes.data : (jRes.data?.jobs || jRes.jobs || []);
          users = uList.filter(u => (u.Status || u.status) === 'ACTIVE');
          jobs = jList.filter(j => (j.Status || j.status) !== 'CANCELLED');
        }
      } catch (e) {
        return showToast(e.message, 'error');
      }

      const isEditor = auth.getRole() === 'EDITOR';
      const tJobId = task['Job ID'] || task.jobId || '';
      const tType = task['Task Type'] || task.taskType || 'HIGHLIGHTS';
      const tTitle = task.Title || task.title || '';
      const tAssignee = task['Assigned To'] || task.assignedTo || '';
      const tPrio = task.Priority || task.priority || 'MEDIUM';
      const tStat = task.Status || task.status || 'PENDING';
      const tDueDate = task['Due Date'] || task.dueDate ? (task['Due Date'] || task.dueDate).substring(0,10) : '';
      const tNotes = task.Notes || task.notes || '';
      
      const taskTypes = ['HIGHLIGHTS', 'CUT', 'PRE WED', 'REEL', 'TEASER', 'SYSTEM', 'DELIVERY', 'CORRECTION', 'OTHER'];

      const html = `
        <form id="task-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="form-label">Job Reference *</label>
              ${id || isEditor ? `<input type="text" id="tf-job" class="form-control" value="${tJobId}" disabled>` : `
                <select id="tf-job" class="form-control" required>
                  <option value="">Select Associated Job...</option>
                  ${jobs.map(j => {
                    const jId = j['Job ID'] || j.id;
                    const jClient = j.Client || j.clientName || 'Job';
                    return `<option value="${jId}" ${tJobId===jId?'selected':''}>${jId} - ${jClient}</option>`;
                  }).join('')}
                </select>
              `}
            </div>
            
            <div class="form-group">
              <label class="form-label">Task Type *</label>
              <select id="tf-type" class="form-control" ${isEditor ? 'disabled' : 'required'}>
                ${taskTypes.map(tt => `<option value="${tt}" ${tType===tt?'selected':''}>${tt}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group" style="grid-column: span 2">
              <label class="form-label">Task Title *</label>
              <input type="text" id="tf-title" class="form-control" placeholder="e.g. Color grading highlight reel" value="${tTitle}" ${isEditor ? 'disabled' : 'required'}>
            </div>
            
            ${!isEditor ? `
              <div class="form-group">
                <label class="form-label">Assign To</label>
                <select id="tf-assignee" class="form-control">
                  <option value="">Unassigned</option>
                  ${users.map(u => {
                    const uId = u['User ID'] || u.id;
                    const uName = u.Name || u.name;
                    return `<option value="${uId}" ${tAssignee===uId?'selected':''}>${uName} (${u.Department || u.department || 'Staff'})</option>`;
                  }).join('')}
                </select>
              </div>
            ` : ''}
            
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select id="tf-priority" class="form-control" ${isEditor ? 'disabled' : ''}>
                ${['LOW','MEDIUM','HIGH','CRITICAL'].map(p => `<option value="${p}" ${tPrio===p?'selected':''}>${p}</option>`).join('')}
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Due Date *</label>
              <input type="date" id="tf-duedate" class="form-control" value="${tDueDate}" ${isEditor ? 'disabled' : 'required'}>
            </div>
            
            ${id ? `
              <div class="form-group">
                <label class="form-label">Status</label>
                <select id="tf-status" class="form-control">
                  ${['PENDING','IN_PROGRESS','ON_HOLD','COMPLETED','CANCELLED'].map(s => `<option value="${s}" ${tStat===s?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
            ` : ''}
          </div>
          
          <div class="form-group mt-4">
            <label class="form-label">Task Instructions / Notes</label>
            <textarea id="tf-notes" class="form-control" rows="3" placeholder="Additional notes or specifications...">${tNotes}</textarea>
          </div>
          
          <button type="submit" class="btn btn-primary w-full mt-4">Save Task Record</button>
        </form>
      `;

      openModal({ title: id ? `Edit Task: ${id}` : 'Create New Task', content: html, size: 'lg' });

      document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          if (id) {
            const data = {
              Notes: document.getElementById('tf-notes').value.trim()
            };
            if (document.getElementById('tf-status')) {
              data.Status = document.getElementById('tf-status').value;
            }
            if (!isEditor) {
              data.Title = document.getElementById('tf-title').value.trim();
              data.TaskType = document.getElementById('tf-type').value;
              data.Priority = document.getElementById('tf-priority').value;
              data.DueDate = document.getElementById('tf-duedate').value;
              const newAssignee = document.getElementById('tf-assignee') ? document.getElementById('tf-assignee').value : null;
              if (newAssignee && newAssignee !== tAssignee) {
                data.AssignedTo = newAssignee;
              }
            }
            await api.updateTask(id, data);
            showToast('Task updated successfully', 'success');
          } else {
            const data = {
              JobId: document.getElementById('tf-job').value,
              TaskType: document.getElementById('tf-type').value,
              Title: document.getElementById('tf-title').value.trim(),
              Priority: document.getElementById('tf-priority').value,
              DueDate: document.getElementById('tf-duedate').value,
              Notes: document.getElementById('tf-notes').value.trim(),
            };
            const assigneeId = document.getElementById('tf-assignee') ? document.getElementById('tf-assignee').value : '';
            if (assigneeId) data.AssignedTo = assigneeId;
            await api.createTask(data);
            showToast('Task created successfully', 'success');
          }
          closeModal();
          loadTasks();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    };

    if (document.getElementById('btn-new-task')) {
      document.getElementById('btn-new-task').addEventListener('click', () => openTaskForm());
    }
    document.getElementById('btn-refresh').addEventListener('click', loadTasks);
    document.getElementById('filter-status').addEventListener('change', loadTasks);
    if (document.getElementById('filter-assignee')) {
      document.getElementById('filter-assignee').addEventListener('change', loadTasks);
    }

    loadTasks();
  }
};

