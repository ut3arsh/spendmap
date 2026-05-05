# SpendMap

> Most expense apps tell you to spend less. SpendMap just shows you where it all went.

Built by a student, for students. Because ₹2,700 disappeared one month and nobody could explain where.

---

## The Problem

College life on a fixed budget has a specific kind of financial mystery. You never bought anything expensive. You never splurged on a single big purchase. And yet, halfway through the month, the money is gone.

It disappears in ₹50 increments. Auto rides. Late-night snacks. A recharge here. A forgotten subscription there. The general store near your hostel that you visit three times a week without thinking about it.

SpendMap doesn't tell you to spend less. It shows you where it went — down to the location on a map, the day the spending spiked, and the single biggest purchase of the month. Awareness first. No lectures, no hard limits.

---

## Features

### Dashboard
Total spend for the period with a count-up animation, budget health bar (amber at 70%, red at 90%), streak tracker, biggest splurge callout, days remaining, and a live map snapshot. Weekly and monthly toggle throughout.

### Add Expense
Tap Add → enter amount, pick category, optional note. App silently grabs GPS, reverse geocodes to the nearest real place name via OpenStreetMap Nominatim, and suggests it as a location tag. Confirm, edit, or skip — never compulsory. Repeat locations are recognised and suggested automatically on return visits.

### Categories
Eight presets — Food, Transport, College, Shopping, Health, Entertainment, Subscriptions, Miscellaneous — plus up to three custom categories. Deletable from Settings; past expenses reassign to Miscellaneous.

### Charts
Three chart types on a weekly/monthly toggle — a bar chart of daily spending coloured by dominant category, a pie chart of category-wise breakdown, and a cumulative line graph with a dashed budget ceiling line showing exactly where spending accelerated.

### Spending Map
Every location-tagged expense plotted on an interactive Leaflet map with dark CartoDB tiles. Markers colour-coded by spend against a user-set threshold — green below, orange at 1–2×, red above 2×. Default view shows only orange and red; zoom in for green. Repeat visits stack — popups show combined total, visit count, and last visit date.

### Soft Limit Reminder
Set a monthly or weekly budget. Nudge at 70%, stronger nudge at 90%, informational at 100%. Nothing blocks a transaction.

### Settings
Name, email, budgets, UPI ID (format-validated, stored for V2 integration), map threshold, custom categories, dark mode, full data deletion, logout.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | HTML5, CSS3 (CSS Variables), Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas via Mongoose |
| Maps | Leaflet.js + OpenStreetMap Nominatim |
| Charts | Chart.js |
| Auth | bcryptjs + JSON Web Tokens |

---

## Project Structure

```
SpendMap/
├── client/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js
│   │   ├── app.js
│   │   ├── charts.js
│   │   ├── dashboard.js
│   │   ├── expense.js
│   │   └── map.js
│   ├── charts.html
│   ├── dashboard.html
│   ├── history.html
│   ├── index.html
│   ├── login.html
│   ├── map.html
│   └── settings.html
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Expense.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   └── user.js
│   └── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

**Prerequisites:** Node.js v16+ and a free MongoDB Atlas account.

**1. Clone the repository**
```bash
git clone https://github.com/ut3arsh/spendmap.git
cd spendmap
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Copy `.env.example` to `.env` and fill in:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/spendmap?appName=Cluster0
JWT_SECRET=any_long_random_string_here
```

**4. Run**
```bash
npm start
```

**5. Open** `http://localhost:5000`

---

## Roadmap

**V1 (Current)**
- Manual expense entry with GPS-assisted location tagging and reverse geocoding
- Interactive spending map with threshold color-coded markers
- Bar, pie, and cumulative line charts with weekly/monthly toggle
- Streak tracker, biggest splurge callout, and soft budget reminder
- Dark mode, mobile-first responsive design
- JWT authentication with MongoDB Atlas

**V1.5**
- Monthly recap shareable card — total spent, top category, most visited location, streak. Designed to screenshot.

**V2**
- Google OAuth sign-in
- Email OTP verification on signup
- Optional phone number with SMS OTP
- UPI webhook integration — detects payments as they happen, prompts for category automatically
- Bank statement import via CSV/PDF
- Shared expense splitting for roommates and group trips

---

## Design Decisions

**No frontend framework.** Every part of this codebase is something that can be opened, pointed to, and explained line by line.

**CSS variables over a utility framework.** A single `:root` block defines the entire design system. Zero loose hex values in the stylesheet — the same token-first pattern used in production design systems.

**Nominatim over Google Maps API.** Free, no API key, sufficient for city-level reverse geocoding. Google Maps adds cost and complexity a prototype doesn't need.

**MongoDB as the source of truth.** localStorage holds only the JWT token and theme preference. All expense data lives in Atlas.

---

## Author

Utkarsh Anand  
GitHub: [github.com/ut3arsh](https://github.com/ut3arsh)

---

## License

MIT