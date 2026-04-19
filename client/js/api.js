// =============================================================
//  SpendMap — Centralised API helper
//  All fetch calls go through here. Token is auto-attached.
//  401 → clears storage and redirects to login.
// =============================================================

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('sm_token');
}

async function apiRequest(method, endpoint, body = null) {
  const token   = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const res  = await fetch(`${API_BASE}${endpoint}`, config);

    if (res.status === 401) {
      localStorage.removeItem('sm_token');
      localStorage.removeItem('sm_user');
      window.location.href = '/index.html';
      return;
    }

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Something went wrong');
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Connection error. Check your internet connection.');
    }
    throw err;
  }
}

// Browser UTC offset in minutes (e.g. 330 for IST UTC+5:30).
// Note: getTimezoneOffset() returns NEGATIVE for ahead-of-UTC zones, so we negate it.
function tzOffset() { return -new Date().getTimezoneOffset(); }

function periodQuery(period) {
  const parts = [];
  if (period) parts.push(`period=${period}`);
  parts.push(`tz=${tzOffset()}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

const API = {
  // Auth
  signup: (d)   => apiRequest('POST', '/auth/signup', d),
  login:  (d)   => apiRequest('POST', '/auth/login',  d),

  // Expenses — always send tz so server can use user's local calendar
  getExpenses:   (period) => apiRequest('GET',    `/expenses${periodQuery(period)}`),
  addExpense:    (d)      => apiRequest('POST',   '/expenses', d),
  updateExpense: (id, d)  => apiRequest('PUT',    `/expenses/${id}`, d),
  deleteExpense: (id)     => apiRequest('DELETE', `/expenses/${id}`),
  getSummary:    (period) => apiRequest('GET',    `/expenses/summary${periodQuery(period)}`),
  getMapData:    (period) => apiRequest('GET',    `/expenses/map${periodQuery(period)}`),

  // User
  getProfile:      ()    => apiRequest('GET',    '/user/profile'),
  updateProfile:   (d)   => apiRequest('PUT',    '/user/profile', d),
  updateCategories:(cats) => apiRequest('PUT',   '/user/categories', { customCategories: cats }),
  deleteAllData:   ()    => apiRequest('DELETE', '/user/data'),
};
