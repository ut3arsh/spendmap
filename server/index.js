require('dotenv').config();
if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve static client files ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../client')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/user',     require('./routes/user'));

// ── Catch-all: serve index.html for SPA navigation ───────────────────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  } else {
    res.status(404).json({ error: 'Route not found' });
  }
});

// ── Connect & Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (!process.env.MONGODB_URI) {
  throw new Error('🚨 FATAL: MONGODB_URI environment variable is missing. You MUST add this to your Render Environment Variables.');
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () =>
      console.log(`🚀 SpendMap running → http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:');
    console.error(err);
    if (!process.env.MONGODB_URI) {
      console.error('🚨 FATAL: MONGODB_URI environment variable is missing!');
    }
    process.exit(1);
  });
