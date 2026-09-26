import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';
import { openModal, closeModal, confirmModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export const Users = {
  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Users</h2>
        <button id="btn-new-user" class="btn btn-primary">+ New User</button>
      </div>
      <div id="users-table-container"></div>
    `;

    const loadUsers = async () => {
      const tContainer = document.getElementById('users-table-container');
      renderDataTable(tContainer, { loading: true });

      try {
        const res = await api.getUsers();
        renderDataTable(tContainer, {
          columns: [
            { label: 'ID', key: 'id' },
            { label: 'Name', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Role', render: r => `<span class="badge badge-IN_PROGRESS">${r.role}</span>` },
            { label: 'Department', key: 'department' },
            { label: 'Capacity', key: 'capacity' },
            { label: 'Status', render: r => `<span class="badge badge-${r.status}">${r.status}</span>` },
            { label: 'Actions', render: r => `
                <button class="btn btn-sm btn-outline edit-btn" data-id="${r.id}">Edit</button>
                <button class="btn btn-sm btn-outline pw-btn" data-id="${r.id}">Reset PW</button>
                ${r.status === 'ACTIVE' 
                  ? `<button class="btn btn-sm btn-danger deact-btn" data-id="${r.id}">Deactivate</button>`
                  : `<button class="btn btn-sm btn-success act-btn" data-id="${r.id}">Activate</button>`
                }
              ` }
          ],
          data: res.data
        });

        tContainer.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', e => openUserForm(e.target.dataset.id)));
        tContainer.querySelectorAll('.pw-btn').forEach(btn => btn.addEventListener('click', e => resetPassword(e.target.dataset.id)));
        tContainer.querySelectorAll('.deact-btn').forEach(btn => btn.addEventListener('click', e => toggleStatus(e.target.dataset.id, false)));
        tContainer.querySelectorAll('.act-btn').forEach(btn => btn.addEventListener('click', e => toggleStatus(e.target.dataset.id, true)));

      } catch (err) {
        renderDataTable(tContainer, { error: err.message });
      }
    };

    const toggleStatus = async (id, activate) => {
      try {
        if (activate) await api.activateUser(id);
        else await api.deactivateUser(id);
        showToast(`User ${activate ? 'activated' : 'deactivated'}`, 'success');
        loadUsers();
      } catch (e) {
        showToast(e.message, 'error');
      }
    };

    const resetPassword = (id) => {
      openModal({
        title: 'Reset Password',
        content: `
          <div class="form-group"><label class="form-label">New Password</label><input type="password" id="pw-new" class="form-control" required></div>
          <button id="btn-reset-pw" class="btn btn-primary w-full mt-4">Update Password</button>
        `
      });
      document.getElementById('btn-reset-pw').addEventListener('click', async () => {
        const pw = document.getElementById('pw-new').value;
        if (!pw) return showToast('Password required', 'warning');
        try {
          await api.resetPassword(id, pw);
          showToast('Password updated', 'success');
          closeModal();
        } catch (e) {
          showToast(e.message, 'error');
        }
      });
    };

    const openUserForm = async (id = null) => {
      let user = { capacity: 10, role: 'EDITOR' };
      if (id) {
        try {
          const res = await api.getUser(id);
          user = res.data;
        } catch (e) {
          return showToast(e.message, 'error');
        }
      }

      const html = `
        <form id="user-form">
          <div class="form-group"><label class="form-label">Name</label><input type="text" id="uf-name" class="form-control" value="${user.name||''}" required></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" id="uf-email" class="form-control" value="${user.email||''}" ${id?'disabled':'required'}></div>
          ${!id ? `<div class="form-group"><label class="form-label">Password</label><input type="password" id="uf-pw" class="form-control" required></div>` : ''}
          <div class="form-group"><label class="form-label">Role</label>
            <select id="uf-role" class="form-control">
              ${['ADMIN','MANAGER','EDITOR','VIEWER'].map(r => `<option value="${r}" ${user.role===r?'selected':''}>${r}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Department</label><input type="text" id="uf-dept" class="form-control" value="${user.department||''}"></div>
          <div class="form-group"><label class="form-label">Capacity (Max open tasks)</label><input type="number" id="uf-cap" class="form-control" value="${user.capacity}" required></div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save User</button>
        </form>
      `;

      openModal({ title: id ? 'Edit User' : 'New User', content: html });

      document.getElementById('user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          name: document.getElementById('uf-name').value,
          role: document.getElementById('uf-role').value,
          department: document.getElementById('uf-dept').value,
          capacity: parseInt(document.getElementById('uf-cap').value)
        };
        try {
          if (id) {
            await api.updateUser(id, data);
            if (data.role !== user.role) await api.changeRole(id, data.role);
            showToast('User updated', 'success');
          } else {
            data.email = document.getElementById('uf-email').value;
            data.password = document.getElementById('uf-pw').value;
            await api.createUser(data);
            showToast('User created', 'success');
          }
          closeModal();
          loadUsers();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    };

    document.getElementById('btn-new-user').addEventListener('click', () => openUserForm());

    loadUsers();
  }
};
