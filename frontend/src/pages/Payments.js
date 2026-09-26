import { api } from '../api.js';
import { renderDataTable } from '../components/DataTable.js';
import { openModal, closeModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export const Payments = {
  async render(container) {
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2>Payments</h2>
        <button id="btn-new-payment" class="btn btn-primary">+ New Payment</button>
      </div>
      
      <div id="payment-summary" class="grid grid-cols-4 gap-4 mb-4">
        <!-- Summary cards -->
      </div>

      <div class="card mb-4" style="display:flex; gap:1rem; align-items:center;">
        <select id="filter-status" class="form-control" style="max-width:200px;">
          <option value="">All Statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="PARTIAL">PARTIAL</option>
          <option value="PAID">PAID</option>
        </select>
        <button id="btn-refresh" class="btn btn-outline">Refresh</button>
      </div>
      
      <div id="payments-table-container"></div>
    `;

    const loadSummary = async () => {
      try {
        const res = await api.getPaymentSummary();
        const sum = res.data;
        document.getElementById('payment-summary').innerHTML = `
          <div class="card"><div class="stat-title">Total Revenue</div><div class="stat-value">$${sum.totalRevenue.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Total Advance</div><div class="stat-value">$${sum.totalAdvance.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Outstanding Balance</div><div class="stat-value" style="color:var(--warning)">$${sum.totalOutstanding.toLocaleString()}</div></div>
          <div class="card"><div class="stat-title">Pending Count</div><div class="stat-value">${sum.pendingCount}</div></div>
        `;
      } catch (e) {
        console.error('Failed to load payment summary', e);
      }
    };

    const loadPayments = async () => {
      const status = document.getElementById('filter-status').value;
      let query = status ? `?status=${status}` : '';

      const tContainer = document.getElementById('payments-table-container');
      renderDataTable(tContainer, { loading: true });

      try {
        const res = await api.getPayments(query);
        renderDataTable(tContainer, {
          columns: [
            { label: 'ID', key: 'id' },
            { label: 'Client', key: 'clientName' },
            { label: 'Job ID', key: 'jobId' },
            { label: 'Amount', render: r => `$${r.totalAmount.toLocaleString()}` },
            { label: 'Advance', render: r => `$${r.advancePayment.toLocaleString()}` },
            { label: 'Balance', render: r => `$${r.balance.toLocaleString()}` },
            { label: 'Status', render: r => `<span class="badge badge-${r.status}">${r.status}</span>` },
            { label: 'Date', render: r => new Date(r.dateStr).toLocaleDateString() },
            { label: 'Actions', render: r => `
                <button class="btn btn-sm btn-outline edit-btn" data-id="${r.id}">Edit</button>
              ` }
          ],
          data: res.data,
          onRowClick: (row) => openPaymentForm(row.id)
        });

        tContainer.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openPaymentForm(e.target.dataset.id);
          });
        });
      } catch (err) {
        renderDataTable(tContainer, { error: err.message });
      }
    };

    const openPaymentForm = async (id = null) => {
      let payment = { totalAmount: 0, advancePayment: 0 };
      if (id) {
        try {
          const res = await api.getPayment(id);
          payment = res.data;
        } catch (e) {
          return showToast(e.message, 'error');
        }
      }

      const html = `
        <form id="payment-form">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="form-label">Job ID</label><input type="text" id="pf-job" class="form-control" value="${payment.jobId||''}" ${id?'disabled':'required'}></div>
            <div class="form-group"><label class="form-label">Client Name</label><input type="text" id="pf-client" class="form-control" value="${payment.clientName||''}" required></div>
            <div class="form-group"><label class="form-label">Total Amount</label><input type="number" step="0.01" id="pf-total" class="form-control" value="${payment.totalAmount}" required></div>
            <div class="form-group"><label class="form-label">Advance Payment</label><input type="number" step="0.01" id="pf-advance" class="form-control" value="${payment.advancePayment}" required></div>
            <div class="form-group"><label class="form-label">Date</label><input type="date" id="pf-date" class="form-control" value="${payment.dateStr ? payment.dateStr.substring(0,10) : new Date().toISOString().substring(0,10)}" required></div>
            ${id ? `
              <div class="form-group"><label class="form-label">Status</label>
                <select id="pf-status" class="form-control">
                  ${['PENDING','PARTIAL','PAID'].map(s => `<option value="${s}" ${payment.status===s?'selected':''}>${s}</option>`).join('')}
                </select>
              </div>
            ` : ''}
          </div>
          <button type="submit" class="btn btn-primary w-full mt-4">Save Payment</button>
        </form>
      `;

      openModal({ title: id ? 'Edit Payment' : 'New Payment', content: html });

      document.getElementById('payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
          clientName: document.getElementById('pf-client').value,
          totalAmount: parseFloat(document.getElementById('pf-total').value),
          advancePayment: parseFloat(document.getElementById('pf-advance').value),
          dateStr: document.getElementById('pf-date').value
        };
        if (!id) data.jobId = document.getElementById('pf-job').value;
        if (id) data.status = document.getElementById('pf-status').value;

        try {
          if (id) await api.updatePayment(id, data);
          else await api.createPayment(data);
          showToast(`Payment ${id ? 'updated' : 'created'}`, 'success');
          closeModal();
          loadSummary();
          loadPayments();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    };

    document.getElementById('btn-new-payment').addEventListener('click', () => openPaymentForm());
    document.getElementById('btn-refresh').addEventListener('click', () => { loadSummary(); loadPayments(); });
    document.getElementById('filter-status').addEventListener('change', loadPayments);

    loadSummary();
    loadPayments();
  }
};
