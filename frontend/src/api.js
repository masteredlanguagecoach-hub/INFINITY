const BASE_URL = '/api';

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const fetchOptions = {
    credentials: 'include',   // Always send session cookie
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  try {
    const response = await fetch(url, fetchOptions);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return null;
    }

    if (!response.ok || data.success === false) {
      // Extract message from structured error { code, message } or plain string
      const err = data.error;
      const message = (err && err.message) ? err.message
        : (typeof err === 'string') ? err
        : data.message || `Request failed (${response.status})`;
      const e = new Error(message);
      e.code = (err && err.code) || null;
      e.statusCode = response.status;
      throw e;
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${path}:`, error.message);
    throw error;
  }
}

export const api = {
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  getMe: () => apiFetch('/auth/me'),
  
  getDashboard: () => apiFetch('/dashboard'),
  getDecisionCenter: () => apiFetch('/decision-center'),
  
  getJobs: (filters = '') => apiFetch(`/jobs${filters}`),
  getJob: (id) => apiFetch(`/jobs/${id}`),
  createJob: (data) => apiFetch('/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id, data) => apiFetch(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id) => apiFetch(`/jobs/${id}`, { method: 'DELETE' }),
  
  getTasks: (filters = '') => apiFetch(`/tasks${filters}`),
  getTask: (id) => apiFetch(`/tasks/${id}`),
  createTask: (data) => apiFetch('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => apiFetch(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  assignTask: (id, data) => apiFetch(`/tasks/${id}/assign`, { method: 'POST', body: JSON.stringify(data) }),
  
  getUsers: () => apiFetch('/users'),
  getUser: (id) => apiFetch(`/users/${id}`),
  createUser: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  activateUser: (id) => apiFetch(`/users/${id}/activate`, { method: 'POST' }),
  deactivateUser: (id) => apiFetch(`/users/${id}/deactivate`, { method: 'POST' }),
  changeRole: (id, role) => apiFetch(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  resetPassword: (id, password) => apiFetch(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),
  
  getPayments: (filters = '') => apiFetch(`/payments${filters}`),
  getPayment: (id) => apiFetch(`/payments/${id}`),
  createPayment: (data) => apiFetch('/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id, data) => apiFetch(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPaymentSummary: () => apiFetch('/payments/summary'),
  
  getMonthlyReport: (year, month) => apiFetch(`/reports/monthly?year=${year}&month=${month}`),
  getEmployeePerformanceReport: (start, end) => apiFetch(`/reports/employee-performance?startDate=${start}&endDate=${end}`),
  getWorkTypeReport: (start, end) => apiFetch(`/reports/work-type?startDate=${start}&endDate=${end}`),
  getDepartmentReport: (start, end) => apiFetch(`/reports/department?startDate=${start}&endDate=${end}`),
  
  getAuditLog: (filters = '') => apiFetch(`/audit${filters}`),
  
  getSettings: () => apiFetch('/settings'),
  updateSettings: (data) => apiFetch('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  testDbConnection: () => apiFetch('/settings/test-db'),
  discoverSheets: () => apiFetch('/settings/discover')
};
