const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount:   { type: Number, required: true, min: 1, max: 99999 },
  category: { type: String, required: true, trim: true },
  note:     { type: String, maxlength: 100, default: '' },
  date:     { type: Date, required: true, default: Date.now },
  location: {
    name: { type: String, default: '' },
    lat:  { type: Number },
    lng:  { type: Number }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
