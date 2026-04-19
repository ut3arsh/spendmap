// =============================================================
//  SpendMap — Spending Map (Leaflet, CartoDB dark tiles)
// =============================================================

(function () {
  if (!requireAuth()) return;

  let currentPeriod = 'monthly';
  let map    = null;
  let markers = [];

  // ── INIT MAP ──────────────────────────────────────────────────

  function initMap() {
    map = L.map('spending-map', { center: [20.5937, 78.9629], zoom: 5 });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }

  // ── CLEAR MARKERS ─────────────────────────────────────────────

  function clearMarkers() {
    markers.forEach(m => m.remove());
    markers = [];
  }

  // ── RENDER MARKERS ────────────────────────────────────────────

  function renderMarkers(locations) {
    if (!locations.length) return;

    const bounds = [];

    locations.forEach((loc, i) => {
      const color = loc.color === 'red'    ? '#EF4444'
                  : loc.color === 'orange' ? '#F59E0B'
                  :                          '#10B981';

      // Custom SVG circle marker (no default Leaflet pin)
      const m = L.circleMarker([loc.lat, loc.lng], {
        radius:      12,
        fillColor:   color,
        color:       color,
        fillOpacity: 0,   // starts invisible — fade in below
        weight:      2,
        opacity:     0,
      }).addTo(map);

      markers.push(m);
      bounds.push([loc.lat, loc.lng]);

      // Staggered fade-in (scale 0.5→1 approximated via opacity)
      setTimeout(() => m.setStyle({ fillOpacity: 0.85, opacity: 1 }), i * 50);

      // Popup
      const lastVisited = new Date(loc.lastVisited).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      m.bindPopup(`
        <div style="min-width:160px;font-family:Inter,sans-serif">
          <div style="font-weight:700;margin-bottom:6px">${loc.name}</div>
          <div style="font-size:13px;margin-bottom:3px">
            Total — <strong style="color:${color}">₹${loc.total.toLocaleString('en-IN')}</strong>
          </div>
          <div style="font-size:13px;color:#A09BB8">Visits: ${loc.visits}</div>
          <div style="font-size:13px;color:#A09BB8">Last: ${lastVisited}</div>
        </div>
      `);
    });

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  // ── LOCATION LIST ─────────────────────────────────────────────

  function renderLocationList(locations) {
    const el = document.getElementById('location-list');
    if (!el) return;

    if (!locations.length) {
      el.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🗺️</div>
          <div class="empty-state-title">No mapped locations</div>
          <div class="empty-state-text">Add expenses with location tags to see them here.</div>
        </div>`;
      return;
    }

    const sorted = [...locations].sort((a, b) => b.total - a.total);
    el.innerHTML = sorted.map(loc => {
      const color = loc.color === 'red' ? '#EF4444' : loc.color === 'orange' ? '#F59E0B' : '#10B981';
      return `
        <div class="location-list-item">
          <div class="loc-marker" style="background:${color}"></div>
          <div class="loc-name">${loc.name}</div>
          <div class="loc-total">${formatCurrency(loc.total)}</div>
        </div>`;
    }).join('');
  }

  // ── LOAD MAP DATA ─────────────────────────────────────────────

  async function loadMap() {
    try {
      const data = await API.getMapData(currentPeriod);

      if (!map) initMap();
      clearMarkers();

      const threshold = data.threshold || 500;
      document.getElementById('threshold-input').value = threshold;

      renderMarkers(data.locations || []);
      renderLocationList(data.locations || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // ── THRESHOLD EDITOR ──────────────────────────────────────────

  document.getElementById('threshold-input')?.addEventListener('change', async e => {
    const val = parseInt(e.target.value, 10);
    if (!val || val < 1) return;
    try {
      await API.updateProfile({ mapThreshold: val });
      loadMap();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // ── PERIOD TOGGLE ─────────────────────────────────────────────

  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPeriod = btn.dataset.period;
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
      loadMap();
    });
  });

  setActiveNav('map');
  loadMap();
})();
