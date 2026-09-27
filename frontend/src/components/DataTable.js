export function renderDataTable(container, { columns, data, loading, error, onRowClick, emptyMessage = 'No records found' }) {
  if (loading) {
    container.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    return;
  }
  if (error) {
    let errorMsg = 'Error loading data';
    if (typeof error === 'string') {
      errorMsg = error;
    } else if (typeof error === 'object' && error !== null) {
      errorMsg = error.message || error.code || (error.error ? (error.error.message || error.error) : JSON.stringify(error));
    }
    if (errorMsg === '[object Object]' || !errorMsg) {
      errorMsg = 'Error loading data from database.';
    }
    container.innerHTML = `<div style="color:var(--danger); padding: 1rem;">Error loading data: ${errorMsg}</div>`;
    return;
  }
  
  // Extract array safely from data
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === 'object') {
    list = data.items || data.jobs || data.tasks || data.users || data.payments || data.logs || data.report || data.employeeStats || [];
  }
  
  if (!list || list.length === 0) {
    container.innerHTML = `<div style="padding: 2.5rem 1rem; color: var(--text-muted); text-align: center; font-size: 0.9rem;">${emptyMessage}</div>`;
    return;
  }

  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-container table-responsive-mobile';
  
  const table = document.createElement('table');
  
  // Header
  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    hRow.appendChild(th);
  });
  thead.appendChild(hRow);
  table.appendChild(thead);
  
  // Body
  const tbody = document.createElement('tbody');
  list.forEach((row, index) => {
    const tr = document.createElement('tr');
    if (onRowClick) {
      tr.classList.add('clickable');
      tr.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button') || e.target.tagName.toLowerCase() === 'a') return;
        onRowClick(row);
      });
    }
    
    columns.forEach(col => {
      const td = document.createElement('td');
      td.setAttribute('data-label', col.label);
      if (col.render) {
        td.innerHTML = col.render(row, index);
      } else {
        const val = (col.key && row[col.key] !== undefined) ? row[col.key] :
                    (col.label && row[col.label] !== undefined) ? row[col.label] : '';
        td.textContent = (val !== null && val !== undefined) ? val : '';
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  
  container.innerHTML = '';
  container.appendChild(tableContainer);
}
