const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:         { type: String, required: true },
  upiId: {
    type: String,
    default: '',
    validate: {
      validator: v => !v || /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/.test(v),
      message: 'Invalid UPI ID format. Use format: user@bankname'
    }
  },
  monthlyBudget:    { type: Number, default: 0 },
  weeklyBudget:     { type: Number, default: 0 },
  mapThreshold:     { type: Number, default: 500 },
  customCategories: {
    type: [String],
    default: [],
    validate: {
      validator: v => v.length <= 3,
      message: 'Maximum 3 custom categories allowed'
    }
  },
  onboardingComplete: { type: Boolean, default: false },
  createdAt:        { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
