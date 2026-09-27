const BASE_URL = '/api';

const TOKEN_KEY = 'pdc_token';
const USER_KEY = 'pdc_user';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (e) {}
}

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getStoredToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-auth-token'] = token;
  }

  const fetchOptions = {
    credentials: 'include',   // Always send session cookie when available
    ...options,
    headers,
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
      if (response.status === 401) {
        setStoredToken(null);
        setStoredUser(null);
      }
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
  login: async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    const token = res.token || (res.data && res.data.token);
    const user = res.user || (res.data && res.data.user) || res.data;
    if (token) setStoredToken(token);
    if (user) setStoredUser(user);
    return res;
  },
  
  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setStoredToken(null);
      setStoredUser(null);
    }
  },

  getMe: async () => {
    const res = await apiFetch('/auth/me');
    const user = res.user || (res.data && res.data.user) || res.data;
    if (user) setStoredUser(user);
    return res;
  },
  
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
  changeRole: (id, role) => apiFetch(`/users/${id}/role`, { method: 'POST', body: JSON.stringify({ role, newRole: role }) }),
  resetPassword: (id, password) => apiFetch(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password, newPassword: password }) }),
  
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
  testDbConnection: () => apiFetch('/settings/db-test'),
  discoverSheets: () => apiFetch('/settings/discover-sheets')
};
