const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Expense = require('../models/Expense');
const User    = require('../models/User');

router.use(auth);

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDateRange(period, tzOffsetMinutes) {
  // tzOffsetMinutes: browser's UTC offset in minutes (e.g. 330 for IST UTC+5:30)
  // We build local-midnight boundaries in UTC by subtracting the offset.
  const offsetMs = (typeof tzOffsetMinutes === 'number' ? tzOffsetMinutes : 0) * 60 * 1000;

  // "now" expressed as local date components
  const localNow = new Date(Date.now() + offsetMs);
  const localY   = localNow.getUTCFullYear();
  const localM   = localNow.getUTCMonth();
  const localD   = localNow.getUTCDate();
  const localDay = localNow.getUTCDay(); // 0 = Sunday

  let startUTC;
  if (period === 'weekly') {
    // Start of local week (Sunday) at local midnight → UTC
    const daysBack  = localDay;         // days since last Sunday
    const localSun  = new Date(Date.UTC(localY, localM, localD - daysBack)); // local midnight Sun in UTC
    startUTC = new Date(localSun.getTime() - offsetMs);
  } else {
    // Start of local month at local midnight → UTC
    const localMonthStart = new Date(Date.UTC(localY, localM, 1)); // local 1st at midnight in UTC
    startUTC = new Date(localMonthStart.getTime() - offsetMs);
  }

  return { start: startUTC, end: new Date() };
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R  = 6371;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a  = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── GET /api/expenses ─────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { period, tz } = req.query;
    const tzOff = tz !== undefined ? Number(tz) : 0;
    const query = { userId: req.userId };
    if (period) {
      const { start, end } = getDateRange(period, tzOff);
      query.date = { $gte: start, $lte: end };
    }
    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/expenses/summary ─────────────────────────────────────────────────

router.get('/summary', async (req, res) => {
  try {
    const { period, tz } = req.query;
    const tzOff = tz !== undefined ? Number(tz) : 0;
    const user           = await User.findById(req.userId);
    const { start, end } = getDateRange(period || 'monthly', tzOff);

    const expenses = await Expense.find({ userId: req.userId, date: { $gte: start, $lte: end } });

    // Total
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    // By category
    const byCategory = {};
    expenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    // Biggest splurge
    const biggestSplurge = expenses.length
      ? expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0])
      : null;

    // Streak: consecutive days (going backwards from today)
    const allExpenses = await Expense.find({ userId: req.userId }).sort({ date: -1 });
    const today       = new Date(); today.setHours(0, 0, 0, 0);
    const loggedDays  = new Set(
      allExpenses.map(e => { const d = new Date(e.date); d.setHours(0, 0, 0, 0); return d.getTime(); })
    );

    let streak    = 0;
    let checkDate = new Date(today);
    while (true) {
      if (loggedDays.has(checkDate.getTime())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (checkDate.getTime() === today.getTime()) {
        // Today not logged yet — don't break streak
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Budget
    const budget       = period === 'weekly' ? user.weeklyBudget : user.monthlyBudget;
    const budgetPercent = budget > 0 ? Math.round((total / budget) * 100) : null;

    // Days remaining in month
    const lastDay      = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = lastDay.getDate() - today.getDate();

    res.json({ total, byCategory, biggestSplurge, streak, budget, budgetPercent, daysRemaining, period: period || 'monthly' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET /api/expenses/map ─────────────────────────────────────────────────────

router.get('/map', async (req, res) => {
  try {
    const { period, tz } = req.query;
    const tzOff = tz !== undefined ? Number(tz) : 0;
    const user  = await User.findById(req.userId);
    const query = {
      userId:        req.userId,
      'location.lat': { $exists: true, $ne: null }
    };
    if (period) {
      const { start, end } = getDateRange(period, tzOff);
      query.date = { $gte: start, $lte: end };
    }

    const expenses  = await Expense.find(query);
    const threshold = user.mapThreshold || 500;

    // Stack by location name (or coordinates within 100 m)
    const locationMap = {};
    expenses.forEach(e => {
      const key = e.location.name || `${e.location.lat.toFixed(4)},${e.location.lng.toFixed(4)}`;
      if (!locationMap[key]) {
        locationMap[key] = { name: e.location.name, lat: e.location.lat, lng: e.location.lng, total: 0, visits: 0, lastVisited: e.date };
      }
      locationMap[key].total += e.amount;
      locationMap[key].visits++;
      if (new Date(e.date) > new Date(locationMap[key].lastVisited)) locationMap[key].lastVisited = e.date;
    });

    const locations = Object.values(locationMap).map(loc => ({
      ...loc,
      color: loc.total < threshold ? 'green' : loc.total < threshold * 2 ? 'orange' : 'red'
    }));

    res.json({ locations, threshold });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── POST /api/expenses ────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { amount, category, note, date, location } = req.body;
    if (!amount || !category) return res.status(400).json({ error: 'Amount and category are required' });
    if (Number(amount) < 1 || Number(amount) > 99999) return res.status(400).json({ error: 'Amount must be between ₹1 and ₹99,999' });
    if (date && new Date(date) > new Date()) return res.status(400).json({ error: 'Date cannot be in the future' });

    const expense = await Expense.create({
      userId:   req.userId,
      amount:   Number(amount),
      category,
      note:     note || '',
      date:     date ? new Date(date) : new Date(),
      location: location || {}
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PUT /api/expenses/:id ─────────────────────────────────────────────────────

router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const { amount, category, note, date, location } = req.body;
    if (amount   !== undefined) expense.amount   = Number(amount);
    if (category !== undefined) expense.category = category;
    if (note     !== undefined) expense.note     = note;
    if (date     !== undefined) expense.date     = new Date(date);
    if (location !== undefined) expense.location = location;

    await expense.save();
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE /api/expenses/:id ──────────────────────────────────────────────────

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
