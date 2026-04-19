// =============================================================
//  SpendMap — Add / Edit Expense (bottom-sheet, GPS, geocoding)
// =============================================================

(function () {
  let editingId        = null;
  let selectedCategory = null;
  let locationData     = null;
  let locationConfirmed = false;

  // ── OPEN / CLOSE ─────────────────────────────────────────────

  window.openExpenseSheet = function (expenseToEdit = null) {
    editingId = expenseToEdit?._id ?? null;

    resetForm();

    if (expenseToEdit) {
      document.getElementById('sheet-title').textContent = 'Edit Expense';
      document.getElementById('expense-amount').value   = expenseToEdit.amount;
      const d = new Date(expenseToEdit.date);
      document.getElementById('expense-date').value     = d.toISOString().split('T')[0];
      document.getElementById('expense-note').value     = expenseToEdit.note || '';
      document.getElementById('expense-submit').textContent = 'Save Changes';
      selectCategory(expenseToEdit.category);

      if (expenseToEdit.location?.name) {
        locationData      = expenseToEdit.location;
        locationConfirmed = true;
        setLocationDisplay(expenseToEdit.location.name, true);
      }
    } else {
      document.getElementById('sheet-title').textContent = 'Add Expense';
      document.getElementById('expense-submit').textContent = 'Add Expense';
      document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
      grabLocation(); // Silently request GPS
    }

    document.getElementById('sheet-overlay')?.classList.add('open');
    document.getElementById('expense-sheet')?.classList.add('open');

    setTimeout(() => document.getElementById('expense-amount')?.focus(), 360);
  };

  window.closeExpenseSheet = function () {
    document.getElementById('sheet-overlay')?.classList.remove('open');
    document.getElementById('expense-sheet')?.classList.remove('open');
  };

  // ── FORM RESET ────────────────────────────────────────────────

  function resetForm() {
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-note').value   = '';
    document.getElementById('expense-date').value   = new Date().toISOString().split('T')[0];
    document.getElementById('expense-error').textContent = '';
    document.getElementById('expense-submit').disabled = false;

    selectedCategory  = null;
    locationData      = null;
    locationConfirmed = false;
    editingId         = null;

    document.querySelectorAll('.cat-pill-btn').forEach(p => p.classList.remove('selected'));
    setLocationDisplay('Fetching location…', false, true);

    // Restore original body
    const body = document.getElementById('sheet-body');
    if (body && !body.querySelector('#expense-form')) {
      body.innerHTML = getSheetBodyHTML();
      attachFormListeners();
      initCategoryPills();
    }
  }

  function getSheetBodyHTML() {
    return `
      <form id="expense-form">
        <div class="amount-input-wrap">
          <span class="amount-prefix">₹</span>
          <input type="number" id="expense-amount" placeholder="0" min="1" max="99999" inputmode="decimal" required>
        </div>
        <div class="form-group">
          <label>Category</label>
          <div class="category-pills-row" id="category-pills"></div>
        </div>
        <div class="form-group">
          <label for="expense-date">Date</label>
          <input type="date" id="expense-date">
        </div>
        <div class="form-group">
          <label for="expense-note">Note <span style="color:var(--color-text-disabled)">(optional)</span></label>
          <input type="text" id="expense-note" placeholder="e.g. Lunch with friends" maxlength="100">
        </div>
        <div class="form-group">
          <label>Location</label>
          <div class="location-preview" id="loc-preview">
            <span class="location-icon" id="loc-icon">📍</span>
            <span class="location-name"  id="loc-name">Fetching location…</span>
            <div class="location-actions">
              <button type="button" class="loc-btn confirm hidden" id="loc-confirm">✓</button>
              <button type="button" class="loc-btn clear   hidden" id="loc-clear">✕</button>
            </div>
          </div>
        </div>
        <div style="color:var(--color-danger);font-size:var(--text-sm);margin-bottom:12px" id="expense-error"></div>
        <button type="submit" class="btn btn-primary btn-full" id="expense-submit">Add Expense</button>
      </form>`;
  }

  // ── CATEGORY PILLS ────────────────────────────────────────────

  async function initCategoryPills() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    let cats = [...PRESET_CATEGORIES];
    try {
      const profile = await API.getProfile();
      cats = [...PRESET_CATEGORIES, ...(profile.customCategories || [])];
    } catch { /* use presets */ }

    container.innerHTML = cats.map(cat => {
      const cls = getCatPillClass(cat);
      return `<button class="category-pill cat-pill-btn ${cls}" data-category="${cat}" type="button">${cat}</button>`;
    }).join('');

    container.querySelectorAll('.cat-pill-btn').forEach(btn =>
      btn.addEventListener('click', () => selectCategory(btn.dataset.category))
    );
  }

  function selectCategory(cat) {
    selectedCategory = cat;
    document.querySelectorAll('.cat-pill-btn').forEach(btn =>
      btn.classList.toggle('selected', btn.dataset.category === cat)
    );
  }

  // ── GPS + REVERSE GEOCODING ───────────────────────────────────

  async function grabLocation() {
    if (!navigator.geolocation) {
      setLocationDisplay('', false);
      return;
    }
    setLocationDisplay('Fetching location…', false, true);

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;

        // Check saved locations for repeat recognition
        try {
          const past   = await API.getExpenses();
          const nearby = findNearby(past, lat, lng);
          if (nearby) {
            locationData = { name: nearby, lat, lng };
            setLocationDisplay(nearby, false); // still suggest, not confirmed
            return;
          }
        } catch { /* continue to Nominatim */ }

        // Nominatim reverse geocode
        try {
          const r    = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const json = await r.json();
          const name = extractPlaceName(json);
          locationData = { name, lat, lng };
          setLocationDisplay(name, false); // show as suggestion
        } catch {
          setLocationDisplay('', false);
        }
      },
      () => setLocationDisplay('', false),
      { timeout: 8000, maximumAge: 60000 }
    );
  }

  function extractPlaceName(result) {
    const addr  = result.address || {};
    const parts = [];
    const place = addr.shop || addr.amenity || addr.building || addr.retail || addr.leisure;
    if (place) parts.push(place);
    const road  = addr.road || addr.pedestrian || addr.footway || addr.path;
    if (road)  parts.push(road);
    if (parts.length) return parts.join(', ');
    return (result.display_name || '').split(',').slice(0, 2).join(',').trim() || 'Current location';
  }

  function findNearby(expenses, lat, lng) {
    for (const e of expenses) {
      if (!e.location?.lat || !e.location?.name) continue;
      if (haversineKm(lat, lng, e.location.lat, e.location.lng) < 0.1) return e.location.name;
    }
    return null;
  }

  function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── LOCATION DISPLAY ─────────────────────────────────────────

  function setLocationDisplay(name, confirmed, loading = false) {
    const icon    = document.getElementById('loc-icon');
    const namEl   = document.getElementById('loc-name');
    const preview = document.getElementById('loc-preview');
    const cfm     = document.getElementById('loc-confirm');
    const clr     = document.getElementById('loc-clear');

    if (loading) {
      if (icon)    icon.textContent    = '⏳';
      if (namEl)   namEl.textContent   = 'Fetching location…';
      if (preview) preview.classList.remove('has-location');
      return;
    }

    if (!name) {
      if (icon)    icon.textContent    = '📍';
      if (namEl)   namEl.textContent   = 'No location tagged';
      if (preview) preview.classList.remove('has-location');
      cfm?.classList.add('hidden');
      clr?.classList.add('hidden');
      return;
    }

    if (icon)    icon.textContent    = confirmed ? '✅' : '📍';
    if (namEl)   namEl.textContent   = name;
    if (preview) preview.classList.toggle('has-location', confirmed);
    cfm?.classList.toggle('hidden', confirmed);
    clr?.classList.remove('hidden');
  }

  // ── SUBMIT ────────────────────────────────────────────────────

  async function submitExpense(e) {
    e.preventDefault();

    const errEl  = document.getElementById('expense-error');
    const btn    = document.getElementById('expense-submit');
    errEl.textContent = '';

    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date   = document.getElementById('expense-date').value;
    const note   = document.getElementById('expense-note').value.trim();

    if (!amount || amount < 1 || amount > 99999) {
      errEl.textContent = 'Amount must be between ₹1 and ₹99,999'; return;
    }
    if (!selectedCategory) {
      errEl.textContent = 'Please select a category'; return;
    }
    if (date && new Date(date) > new Date()) {
      errEl.textContent = 'Date cannot be in the future'; return;
    }

    btn.disabled     = true;
    btn.textContent  = 'Saving…';

    const payload = {
      amount, category: selectedCategory, note, date,
      location: (locationConfirmed && locationData) ? locationData : {}
    };

    try {
      editingId
        ? await API.updateExpense(editingId, payload)
        : await API.addExpense(payload);

      showSuccessAndClose(amount);
      // Refresh data on dashboard / history if those functions exist
      if (typeof loadDashboard === 'function') setTimeout(loadDashboard, 700);
      if (typeof loadHistory   === 'function') setTimeout(loadHistory,   700);
    } catch (err) {
      errEl.textContent   = err.message;
      btn.disabled        = false;
      btn.textContent     = editingId ? 'Save Changes' : 'Add Expense';
    }
  }

  function showSuccessAndClose(amount) {
    const body = document.getElementById('sheet-body');
    if (!body) { closeExpenseSheet(); return; }

    body.innerHTML = `
      <div style="text-align:center;padding:48px 0">
        <div class="success-check">✓</div>
        <div style="font-size:var(--text-lg);font-weight:var(--weight-bold);margin-bottom:8px">
          ${editingId ? 'Updated!' : 'Logged!'}
        </div>
        <div style="color:var(--color-text-secondary);font-size:var(--text-sm)">
          ${formatCurrency(amount)}
        </div>
      </div>`;

    setTimeout(closeExpenseSheet, 900);
  }

  // ── ATTACH LISTENERS ─────────────────────────────────────────

  function attachFormListeners() {
    document.getElementById('expense-form')?.addEventListener('submit', submitExpense);

    document.getElementById('sheet-overlay')?.addEventListener('click', closeExpenseSheet);

    document.getElementById('loc-confirm')?.addEventListener('click', () => {
      locationConfirmed = true;
      if (locationData) setLocationDisplay(locationData.name, true);
    });

    document.getElementById('loc-clear')?.addEventListener('click', () => {
      locationData = null; locationConfirmed = false;
      setLocationDisplay('', false);
    });

    document.getElementById('loc-name')?.addEventListener('click', () => {
      const current = locationData?.name || '';
      const edited  = prompt('Edit location name:', current);
      if (edited === null) return;              // user cancelled
      if (!locationData) locationData = {};
      locationData.name   = edited;
      locationConfirmed   = !!edited;
      setLocationDisplay(edited, !!edited);
    });
  }

  // ── INIT (called from each page's inline script) ──────────────

  window.initExpenseSheet = function () {
    initCategoryPills();
    attachFormListeners();
  };
})();
