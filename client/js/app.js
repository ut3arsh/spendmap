// =============================================================
//  SpendMap — Shared utilities, auth guards, theme, toast
// =============================================================

// ── Auth guards ───────────────────────────────────────────────

function requireAuth() {
  if (!localStorage.getItem('sm_token')) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function redirectIfLoggedIn() {
  if (localStorage.getItem('sm_token')) {
    window.location.href = '/dashboard.html';
  }
}

// ── User storage ──────────────────────────────────────────────

function getUser() {
  try { return JSON.parse(localStorage.getItem('sm_user') || '{}'); }
  catch { return {}; }
}

function saveUser(user) {
  localStorage.setItem('sm_user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('sm_token');
  localStorage.removeItem('sm_user');
  window.location.href = '/login.html';
}

// ── Currency formatter ────────────────────────────────────────

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// ── Date formatters ───────────────────────────────────────────

function formatDate(date) {
  const d   = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0 && d.getDate() === now.getDate()) return 'Today';
  if (diffDays < 2) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatDateFull(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── Greeting (time-based, rotated messages) ───────────────────

const GREETINGS = {
  morning: [
    'Good morning', 'Rise and shine', 'Morning hustle',
    'New day, new goals', 'Start smart'
  ],
  afternoon: [
    'Good afternoon', 'Keep it up', 'Halfway there',
    'Stay on budget', 'Afternoon check-in'
  ],
  evening: [
    'Good evening', 'Wind down wisely', 'End well',
    'Evening review', 'Almost done today'
  ],
};

function getGreeting() {
  const h   = new Date().getHours();
  const key = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const pool = GREETINGS[key];
  // Rotate daily so it feels fresh
  const idx = Math.floor(Date.now() / 86400000) % pool.length;
  return pool[idx];
}

// ── Profile avatar ─────────────────────────────────────────────
// Renders into `el`: profile photo if stored, else initial circle.
function renderProfileAvatar(el) {
  if (!el) return;
  const user  = getUser();
  const photo = user.profilePhoto || localStorage.getItem('sm_profile_photo');
  if (photo) {
    el.innerHTML = `<img src="${photo}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
  } else {
    const initial = (user.name || 'U').trim()[0].toUpperCase();
    el.textContent  = initial;
    el.style.cssText += ';display:flex;align-items:center;justify-content:center;background:var(--color-accent);color:#fff;font-weight:700;font-size:1rem;border-radius:50%;';
  }
}


const CAT_COLORS = {
  Food:          '#F59E0B',
  Transport:     '#3B82F6',
  College:       '#8B5CF6',
  Shopping:      '#EC4899',
  Health:        '#10B981',
  Entertainment: '#F97316',
  Subscriptions: '#06B6D4',
  Miscellaneous: '#6B7280',
};

function getCatColor(category) {
  return CAT_COLORS[category] || '#A78BFA';
}

function getCatPillClass(category) {
  return 'pill-' + category.toLowerCase().replace(/\s+/g, '-');
}

// ── Preset categories ─────────────────────────────────────────

const PRESET_CATEGORIES = [
  'Food', 'Transport', 'College', 'Shopping',
  'Health', 'Entertainment', 'Subscriptions', 'Miscellaneous'
];

async function getAllCategories() {
  try {
    const user = await API.getProfile();
    return [...PRESET_CATEGORIES, ...(user.customCategories || [])];
  } catch {
    return [...PRESET_CATEGORIES];
  }
}

// ── Theme ─────────────────────────────────────────────────────

function initTheme() {
  if (localStorage.getItem('sm_theme') === 'light') {
    document.documentElement.classList.add('light');
  }
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('sm_theme', isLight ? 'light' : 'dark');
  return isLight;
}

// ── Active nav item ───────────────────────────────────────────

function setActiveNav(page) {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

// ── Toast notification ────────────────────────────────────────

function showToast(message, type = 'info') {
  document.querySelector('.sm-toast')?.remove();

  const bg = type === 'error'   ? 'var(--color-danger)'
           : type === 'success' ? 'var(--color-success)'
           :                      'var(--color-bg-tertiary)';

  const toast = document.createElement('div');
  toast.className = 'sm-toast';
  toast.style.cssText = `
    position:fixed; bottom:80px; left:50%;
    transform:translateX(-50%) translateY(16px);
    background:${bg}; color:#fff;
    padding:10px 20px; border-radius:999px;
    font-family:Inter,sans-serif; font-size:.875rem; font-weight:500;
    z-index:9999; opacity:0; transition:all .28s ease;
    box-shadow:0 8px 32px rgba(0,0,0,.4);
    white-space:nowrap; max-width:90vw; text-align:center;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// ── Init theme on every page load ─────────────────────────────
initTheme();
