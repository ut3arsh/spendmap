const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');
const Expense = require('../models/Expense');

router.use(auth);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, monthlyBudget, weeklyBudget, upiId, mapThreshold, onboardingComplete } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name               !== undefined) user.name               = name;
    if (email              !== undefined) user.email              = email;
    if (monthlyBudget      !== undefined) user.monthlyBudget      = Number(monthlyBudget);
    if (weeklyBudget       !== undefined) user.weeklyBudget       = Number(weeklyBudget);
    if (upiId              !== undefined) user.upiId              = upiId;
    if (mapThreshold       !== undefined) user.mapThreshold       = Number(mapThreshold);
    if (onboardingComplete !== undefined) user.onboardingComplete = onboardingComplete;

    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/user/categories
router.put('/categories', async (req, res) => {
  try {
    const { customCategories } = req.body;
    if (!Array.isArray(customCategories) || customCategories.length > 3)
      return res.status(400).json({ error: 'Maximum 3 custom categories allowed' });

    const user = await User.findById(req.userId);
    const deleted = user.customCategories.filter(c => !customCategories.includes(c));

    // Move orphaned expenses to Miscellaneous
    if (deleted.length) {
      await Expense.updateMany({ userId: req.userId, category: { $in: deleted } }, { category: 'Miscellaneous' });
    }
    user.customCategories = customCategories;
    await user.save();
    res.json({ customCategories: user.customCategories });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/user/data
router.delete('/data', async (req, res) => {
  try {
    await Expense.deleteMany({ userId: req.userId });
    res.json({ message: 'All expense data deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
