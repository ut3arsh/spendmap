# SpendMap 💸

> *Most expense apps tell you to spend less. SpendMap just shows you where it all went.*

---

## What is SpendMap?

SpendMap is a personal expense tracker built specifically for college students — the ones who get pocket money or a fixed monthly budget and somehow hit zero before the month ends without ever feeling like they spent big on anything.

SpendMap doesn't lecture you. It doesn't block your spending or flash warnings at you like a disappointed parent. It just shows you — clearly, visually, honestly — where your money quietly disappeared. Category by category. Day by day. Location by location.

The core insight: **awareness is the first step, not budgeting rules.**

---

## Who is it for?

Primary audience: College students on a low to medium monthly budget (₹2,000 – ₹15,000/month).

Secondary: Anyone who wants a clean, no-nonsense way to track daily spending without connecting to a bank or committing to a rigid budgeting system.

---

## Features (V1)

### Dashboard
- Total spent this week and this month at a glance
- Budget health bar showing how far along you are
- Biggest splurge callout — your single largest expense this period
- Logging streak badge — how many consecutive days you've tracked
- Days remaining in the month
- Live map snapshot of your top spending locations

### Add Expense
- Enter amount, pick category, optional note
- App silently grabs GPS on entry
- Reverse geocodes to nearest real place name (e.g. "Reliance Fresh, Boring Road")
- User confirms, edits, or skips the location tag — never forced
- Repeat locations are recognised and suggested automatically

### Categories
**Presets:** Food, Transport, College, Shopping, Health, Entertainment, Subscriptions, Miscellaneous

**Custom:** Up to 3 user-defined categories

### Charts & Graphs
- Bar chart: Daily spending over the current week/month
- Pie chart: Category-wise spending breakdown
- Line graph: Cumulative spending curve — see exactly when money accelerated

Weekly / Monthly view toggle across all charts.

### Spending Map
SpendMap's standout feature. Every location-tagged expense is plotted on an interactive map.

Color coded by spend amount against a user-set threshold:
- 🟢 **Green** — low spend location
- 🟠 **Orange** — medium spend location  
- 🔴 **Red** — high spend location

Default view shows only above-threshold locations. Zoom in to reveal all. Revisit the same location and the spend stacks — the map gets smarter the more you use it.

### Soft Limit Reminder
Set a weekly or monthly budget. SpendMap nudges you at 70% and 90% of your limit. It never blocks a transaction. You're an adult — it just keeps you aware.

### Dark Mode
Default dark. Because you're a college student and you're using this at midnight wondering where ₹2,700 went.

### Streak Tracker
Consecutive days of logging. Small thing. Weirdly motivating.

### Biggest Splurge Callout
One line on the dashboard: *"Your biggest single spend this month was ₹1,500 at a restaurant on the 14th."* No judgment. Just the mirror.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (free tier) |
| Maps | Leaflet.js + OpenStreetMap Nominatim |
| Charts | Chart.js |
| Auth | JWT-based simple auth |
| Hosting | To be decided |

---

## Project Structure

```
spendmap/
├── client/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── charts.js
│   │   ├── map.js
│   │   └── api.js
│   └── pages/
│       ├── dashboard.html
│       ├── add-expense.html
│       ├── history.html
│       └── settings.html
├── server/
│   ├── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   └── user.js
│   ├── models/
│   │   ├── User.js
│   │   └── Expense.js
│   └── middleware/
│       └── auth.js
├── .env.example
├── package.json
└── README.md
```

---

## Database Schema (Overview)

**User**
- name, email, password (hashed)
- upiId (stored, format-validated, display only in V1)
- monthlyBudget, weeklyBudget
- customCategories (max 3)
- createdAt

**Expense**
- userId, amount, category, note
- date, createdAt
- location: { name, lat, lng }

---

## API Endpoints (Overview)

```
POST   /api/auth/signup
POST   /api/auth/login

GET    /api/expenses             — all expenses for user
POST   /api/expenses             — add new expense
PUT    /api/expenses/:id         — edit expense
DELETE /api/expenses/:id         — delete expense
GET    /api/expenses/summary     — totals, category breakdown, streak
GET    /api/expenses/map         — location-tagged expenses for map view
```

---

## Roadmap

### V1 (Current)
Everything listed under Features above. Fully working prototype with real backend, real database, real maps, real charts.

### V1.5
- Monthly recap shareable card — total spent, top category, most visited location, streak. Designed to screenshot and share.

### V2
- UPI webhook integration — app detects the moment a payment is made and soft-prompts for category/note automatically
- Bank statement import (PDF/CSV)
- Shared expense splitting — for hostel roommates, trip groups
- Multi-currency support

---

## Vision

SpendMap started from a real problem: finishing half the month and being ₹2,700 down without remembering a single big purchase. Little expenses — chai, auto, printing, snacks, a recharge here, a subscription there — compound invisibly.

Every existing solution either requires bank access, forces you into a strict budgeting framework, or is designed for salaried professionals. Nothing was built for the college student with ₹8,000 a month who just wants to know *where it goes.*

SpendMap is that tool.

---

## Author

Built by Utkarsh Anand  
Web Development | 2026  
GitHub: [ut3arsh](https://github.com/ut3arsh)  
