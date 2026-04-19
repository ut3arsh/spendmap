// =============================================================
//  SpendMap — Charts (Chart.js, dark theme)
// =============================================================

(function () {
  if (!requireAuth()) return;

  let currentPeriod = 'monthly';
  let barChart = null, pieChart = null, lineChart = null;

  // Dark theme defaults
  Chart.defaults.color      = '#A09BB8';
  Chart.defaults.borderColor = '#2E2B42';
  Chart.defaults.font.family = 'Inter, sans-serif';

  const CAT_CHART_COLORS = {
    Food: '#F59E0B', Transport: '#3B82F6', College: '#8B5CF6',
    Shopping: '#EC4899', Health: '#10B981', Entertainment: '#F97316',
    Subscriptions: '#06B6D4', Miscellaneous: '#6B7280',
  };

  function getCatChartColor(cat) {
    return CAT_CHART_COLORS[cat] || '#A78BFA';
  }

  // ── BAR CHART — Daily Spending ────────────────────────────────

  function renderBarChart(expenses) {
    const ctx = document.getElementById('bar-chart');
    if (!ctx) return;

    // Group totals by day label
    const dayMap = {};
    expenses.forEach(e => {
      const label = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (!dayMap[label]) dayMap[label] = { total: 0, cat: e.category };
      dayMap[label].total += e.amount;
      dayMap[label].cat    = e.category; // dominant = last (simplified)
    });

    const labels = Object.keys(dayMap);
    const values = labels.map(l => dayMap[l].total);
    const colors = labels.map(l => getCatChartColor(dayMap[l].cat));

    barChart?.destroy();
    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Spent',
          data:  values,
          backgroundColor: colors.map(c => c + 'BB'),
          borderColor:     colors,
          borderWidth:     1,
          borderRadius:    6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: ctx => '₹' + ctx.parsed.y.toLocaleString('en-IN') }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: v => '₹' + Number(v).toLocaleString('en-IN') }
          }
        }
      }
    });
  }

  // ── PIE CHART — Category Breakdown ───────────────────────────

  function renderPieChart(byCategory) {
    const ctx = document.getElementById('pie-chart');
    if (!ctx) return;

    const entries = Object.entries(byCategory || {}).filter(([, v]) => v > 0);
    const labels  = entries.map(([c]) => c);
    const values  = entries.map(([, v]) => v);
    const colors  = labels.map(getCatChartColor);

    pieChart?.destroy();
    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data:            values,
          backgroundColor: colors.map(c => c + 'BB'),
          borderColor:     colors,
          borderWidth:     2,
          hoverOffset:     8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, usePointStyle: true, pointStyleWidth: 8 }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct   = Math.round((ctx.parsed / total) * 100);
                return `₹${ctx.parsed.toLocaleString('en-IN')} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // ── LINE CHART — Cumulative Spending ──────────────────────────

  function renderLineChart(expenses, budget) {
    const ctx = document.getElementById('line-chart');
    if (!ctx) return;

    const sorted = [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
    const dateMap = new Map();
    let running = 0;
    sorted.forEach(e => {
      const day = new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      running += e.amount;
      dateMap.set(day, running);
    });

    const labels   = [...dateMap.keys()];
    const data     = [...dateMap.values()];

    const datasets = [{
      label:           'Cumulative Spend',
      data,
      borderColor:     '#7C3AED',
      backgroundColor: 'rgba(124,58,237,0.08)',
      fill:            true,
      tension:         0.4,
      pointRadius:     3,
      pointHoverRadius: 6,
    }];

    if (budget > 0) {
      datasets.push({
        label:           'Budget',
        data:            new Array(labels.length).fill(budget),
        borderColor:     '#EF4444',
        backgroundColor: 'transparent',
        borderDash:      [6, 4],
        borderWidth:     1.5,
        pointRadius:     0,
        tension:         0,
      });
    }

    lineChart?.destroy();
    lineChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { labels: { usePointStyle: true } },
          tooltip: {
            callbacks: { label: ctx => '₹' + ctx.parsed.y.toLocaleString('en-IN') }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: v => '₹' + Number(v).toLocaleString('en-IN') }
          }
        }
      }
    });
  }

  // ── LOAD ALL ──────────────────────────────────────────────────

  async function loadCharts() {
    try {
      const [expenses, summary] = await Promise.all([
        API.getExpenses(currentPeriod),
        API.getSummary(currentPeriod),
      ]);
      renderBarChart(expenses);
      renderPieChart(summary.byCategory);
      renderLineChart(expenses, summary.budget);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  // Period toggle
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPeriod = btn.dataset.period;
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
      loadCharts();
    });
  });

  setActiveNav('charts');
  loadCharts();
})();
