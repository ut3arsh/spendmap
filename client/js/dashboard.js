// =============================================================
//  SpendMap — Dashboard
//
//  ANIMATION SPEC (per user requirement):
//  • Hero total   → count-up from 0 → actual value, 800 ms, ease-out cubic
//  • Budget bar   → width from 0% → actual %, 600 ms, ease-out (CSS cubic-bezier)
//  Both animations fire on EVERY dashboard load / period switch.
// =============================================================

(function () {
  if (!requireAuth()) return;

  let currentPeriod = 'monthly';
  let mapSnapshot   = null;

  // ── COUNT-UP ANIMATION ──────────────────────────────────────
  // Animates element's text from 0 to targetAmount over `duration` ms.
  // Easing: ease-out cubic  →  deceleration curve  →  y = 1-(1-t)³
  function animateCountUp(element, targetAmount, duration) {
    const start    = performance.now();
    const easeOut  = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);           // clamp 0-1
      const value    = Math.round(easeOut(progress) * targetAmount);

      element.textContent = '₹' + value.toLocaleString('en-IN');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Guarantee exact final value (no floating-point residue)
        element.textContent = '₹' + targetAmount.toLocaleString('en-IN');
      }
    }

    requestAnimationFrame(tick);
  }

  // ── BUDGET BAR ANIMATION ────────────────────────────────────
  // Resets fill to 0% instantly (no transition), forces a layout
  // flush, then adds a CSS transition and sets the target width.
  // Result: bar grows from 0 → actual % over `duration` ms, every load.
  function animateBudgetBar(fillEl, targetPct, duration) {
    // 1. Strip any previous transition and snap width to 0
    fillEl.style.transition = 'none';
    fillEl.style.width      = '0%';

    // 2. Set colour class before animating
    fillEl.classList.remove('warning', 'danger');
    if      (targetPct >= 90) fillEl.classList.add('danger');
    else if (targetPct >= 70) fillEl.classList.add('warning');

    // 3. Force reflow — browser must commit the 0% width before we animate
    //    (reading any layout property is sufficient)
    void fillEl.getBoundingClientRect();

    // 4. Add ease-out transition and animate to target in the next frame
    requestAnimationFrame(() => {
      fillEl.style.transition = `width ${duration}ms cubic-bezier(0.0, 0.0, 0.2, 1)`;
      fillEl.style.width      = Math.min(targetPct, 100) + '%';
    });
  }

  // ── RENDER SUMMARY ──────────────────────────────────────────
  function renderSummary(data) {
    // Hero total → count-up 0 → actual, 800 ms
    const heroEl = document.getElementById('hero-total');
    if (heroEl) animateCountUp(heroEl, data.total || 0, 800);

    // Period subtitle
    const subtitleEl = document.getElementById('hero-subtitle');
    if (subtitleEl) subtitleEl.textContent = currentPeriod === 'weekly' ? 'This week' : 'This month';

    // Budget health bar → width 0 → %, 600 ms
    const barFill    = document.getElementById('budget-bar-fill');
    const barLeft    = document.getElementById('budget-bar-left');
    const barRight   = document.getElementById('budget-bar-right');
    const barWrap    = document.getElementById('budget-bar-wrap');
    const noBudget   = document.getElementById('no-budget-msg');

    if (data.budget > 0) {
      barWrap?.classList.remove('hidden');
      noBudget?.classList.add('hidden');

      const pct = Math.max(0, data.budgetPercent || 0);
      if (barFill) animateBudgetBar(barFill, pct, 600);
      if (barLeft)  barLeft.textContent  = `${formatCurrency(data.total || 0)} of ${formatCurrency(data.budget)}`;
      if (barRight) barRight.textContent = `${pct}%`;

      renderNudge(pct, data.budget, data.total || 0);
    } else {
      barWrap?.classList.add('hidden');
      noBudget?.classList.remove('hidden');
      document.getElementById('nudge-banner')?.classList.add('hidden');
    }

    // Streak
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = data.streak || 0;

    // Days remaining
    const daysEl = document.getElementById('days-remaining');
    if (daysEl) daysEl.textContent = data.daysRemaining ?? '—';

    // Biggest splurge
    const splurgeCard   = document.getElementById('splurge-card');
    const splurgeAmt    = document.getElementById('splurge-amount');
    const splurgeDetail = document.getElementById('splurge-detail');

    if (data.biggestSplurge) {
      splurgeCard?.classList.remove('hidden');
      if (splurgeAmt) splurgeAmt.textContent = formatCurrency(data.biggestSplurge.amount);
      if (splurgeDetail) {
        const where = data.biggestSplurge.location?.name || data.biggestSplurge.category;
        splurgeDetail.textContent = `${where} · ${formatDate(data.biggestSplurge.date)}`;
      }
    } else {
      splurgeCard?.classList.add('hidden');
    }
  }

  // ── NUDGE BANNER ────────────────────────────────────────────
  function renderNudge(pct, budget, total) {
    const banner = document.getElementById('nudge-banner');
    if (!banner) return;
    banner.classList.add('hidden');
    banner.className = 'nudge-banner hidden';

    const remaining = formatCurrency(budget - total);

    if (pct >= 100) {
      banner.innerHTML = `<span>🚩</span> You've hit your budget for this period.`;
      banner.classList.add('danger');
    } else if (pct >= 90) {
      banner.innerHTML = `<span>⚠️</span> Almost there. Only ${remaining} left.`;
      banner.classList.add('danger');
    } else if (pct >= 70) {
      banner.innerHTML = `<span>💡</span> You've used ${pct}% of your budget. ${remaining} remaining.`;
      banner.classList.add('warning');
    } else {
      return; // Nothing to show below 70%
    }
    banner.classList.remove('hidden');
  }

  // ── RECENT EXPENSES ──────────────────────────────────────────
  function renderRecent(expenses) {
    const list = document.getElementById('recent-list');
    if (!list) return;

    if (!expenses.length) {
      list.innerHTML = `<p class="text-muted text-sm" style="text-align:center;padding:20px 0">
        No expenses yet — add your first one!
      </p>`;
      return;
    }

    list.innerHTML = expenses.map(e => {
      const color = getCatColor(e.category);
      return `
        <div class="expense-item">
          <div class="expense-cat-dot" style="background:${color}"></div>
          <div class="expense-info">
            <div class="expense-category">${e.category}</div>
            <div class="expense-meta">
              <span>${formatDate(e.date)}</span>
              ${e.location?.name ? `<span>📍 ${e.location.name}</span>` : ''}
              ${e.note ? `<span class="note-pill">${e.note.slice(0, 30)}${e.note.length > 30 ? '…' : ''}</span>` : ''}
            </div>
          </div>
          <div class="expense-amount">${formatCurrency(e.amount)}</div>
        </div>`;
    }).join('');
  }

  // ── MAP SNAPSHOT ─────────────────────────────────────────────
  async function initMapSnapshot() {
    const el = document.getElementById('map-snapshot');
    if (!el || mapSnapshot || typeof L === 'undefined') return;

    try {
      const data = await API.getMapData(currentPeriod);

      mapSnapshot = L.map('map-snapshot', {
        zoomControl: false, attributionControl: false,
        dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
        touchZoom: false
      });

      applySnapshotTheme();

      if (data.locations?.length) {
        const markerList = [];
        data.locations.forEach((loc, i) => {
          const color = loc.color === 'red' ? '#EF4444' : loc.color === 'orange' ? '#F59E0B' : '#10B981';
          const m = L.circleMarker([loc.lat, loc.lng], {
            radius: 8, fillColor: color, color, fillOpacity: 0, weight: 2, opacity: 0
          }).addTo(mapSnapshot);
          markerList.push(m);
          // Staggered fade-in
          setTimeout(() => m.setStyle({ fillOpacity: 0.9, opacity: 1 }), 100 + i * 50);
        });
        if (markerList.length === 1) {
          const loc = data.locations[0];
          mapSnapshot.setView([loc.lat, loc.lng], 13);
        } else {
          mapSnapshot.fitBounds(L.featureGroup(markerList).getBounds(), { padding: [20, 20], maxZoom: 14 });
        }
      } else {
        mapSnapshot.setView([20.5937, 78.9629], 5);
      }
    } catch {
      // Silently fail — map snapshot is non-critical
    }
  }

  let snapshotTileLayer = null;
  function applySnapshotTheme() {
    if (!mapSnapshot) return;
    const isLight = document.documentElement.classList.contains('light');
    const tileUrl = isLight 
      ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    if (snapshotTileLayer) {
      mapSnapshot.removeLayer(snapshotTileLayer);
    }

    snapshotTileLayer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapSnapshot);
  }
  
  // Expose it globally so `updateChartThemes` or `handleThemeToggle` can call it
  window.updateSnapshotTheme = applySnapshotTheme;

  // ── LOAD DASHBOARD ───────────────────────────────────────────
  async function loadDashboard() {
    // Show loading spinners
    const heroEl = document.getElementById('hero-total');
    if (heroEl) heroEl.textContent = '₹0';

    try {
      const [summary, expenses] = await Promise.all([
        API.getSummary(currentPeriod),
        API.getExpenses(currentPeriod),
      ]);

      renderSummary(summary);
      renderRecent(expenses.slice(0, 3));
      initMapSnapshot();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Re-expose so expense.js success callback can trigger refresh
  window.loadDashboard = loadDashboard;

  // ── PERIOD TOGGLE ────────────────────────────────────────────
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPeriod = btn.dataset.period;
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
      loadDashboard();
    });
  });

  // ── FAB ──────────────────────────────────────────────────────
  document.getElementById('fab-add')?.addEventListener('click', () => openExpenseSheet());

  // ── GREETING + AVATAR ────────────────────────────────────────
  function renderGreetingAndAvatar() {
    const user      = getUser();
    const firstName = (user.name || '').split(' ')[0] || 'there';
    const greeting  = getGreeting();

    const greetEl = document.getElementById('greeting-text');
    const subEl   = document.getElementById('greeting-sub');
    if (greetEl) greetEl.textContent = `${greeting}, ${firstName}!`;
    if (subEl)   subEl.textContent   = "Here's your spending summary";

    // Header avatar (mobile / tablet)
    renderProfileAvatar(document.getElementById('header-avatar'));

    // Sidebar user info (desktop)
    renderProfileAvatar(document.getElementById('sidebar-avatar'));
    const sidebarName  = document.getElementById('sidebar-name');
    const sidebarEmail = document.getElementById('sidebar-email');
    if (sidebarName)  sidebarName.textContent  = user.name  || '—';
    if (sidebarEmail) sidebarEmail.textContent = user.email || '—';
  }

  // ── INIT ─────────────────────────────────────────────────────
  setActiveNav('dashboard');
  renderGreetingAndAvatar();
  loadDashboard();
})();
