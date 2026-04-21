# SpendMap

> Most expense apps tell you to spend less. SpendMap just shows you where it all went.

Built by a student, for students. Because ₹2,700 disappeared one month and nobody could explain where.

---

## The Problem

College life on a fixed budget has a specific kind of financial mystery. You never bought anything expensive. You never splurged on a single big purchase. And yet, halfway through the month, the money is gone.

It disappears in ₹50 increments. Auto rides. Late-night snacks. A recharge here. A forgotten subscription there. The general store near your hostel that you visit three times a week without thinking about it.

Every existing solution to this problem was built for the wrong person. Budgeting apps designed for salaried professionals. Expense trackers that demand you log every transaction manually like an accountant. Bank statement exports that give you a wall of numbers and nothing else.

Nobody built a tool for the college student with ₹8,000 a month who just needs one clear answer: *where does it actually go?*

SpendMap is that tool.

---

## What Makes It Different

Most expense trackers are built around budgeting — set a limit, stay under it, feel bad when you don't. SpendMap is built around awareness. The philosophy is simple: if you can see exactly where your money went — down to the specific location on a map, the specific day the spending spiked, the single biggest purchase of the month — you already have everything you need to make better decisions. No lectures. No hard limits. Just the mirror.

The standout feature is the Spending Map. Every expense you tag with a location gets plotted on an interactive map, color-coded by how much you've spent there. The spots bleeding your wallet dry turn red. The occasional visits stay green. You see your own spending geography for the first time and it's immediately obvious in a way that a table of numbers never is.

---

## Features

### Dashboard
The first thing you see after login. Designed to give you the full picture in one glance without having to dig.

- **Hero total** — your total spend for the period, large and immediate, with a count-up animation on every load
- **Budget health bar** — a progress bar that turns amber at 70% and red at 90% of your set budget, never blocks you, just keeps you aware
- **Streak tracker** — consecutive days you've logged at least one expense, resets if you miss a full day
- **Biggest splurge callout** — one line showing your single largest expense of the period, the date, and where
- **Days remaining** — how many days are left in the current month
- **Map snapshot** — a compact live preview of your top spending locations

Weekly and monthly toggle across the entire dashboard.

### Add Expense
Designed to take under 10 seconds for a normal entry.

1. Tap Add — enter amount, pick category, optional note
2. App silently requests GPS on entry
3. Reverse geocodes your coordinates to the nearest real place name via OpenStreetMap Nominatim
4. Suggests the location as a tag — you confirm, edit, or skip entirely
5. If you've been to the same spot before, the app recognises the coordinates and suggests your previously saved name instead of a generic map result

Location tagging is never compulsory. The app gets smarter about your regular spots the more you use it.

### Categories
Eight preset categories — Food, Transport, College, Shopping, Health, Entertainment, Subscriptions, Miscellaneous — plus up to three custom categories you define yourself. Custom categories can be renamed or deleted from Settings; their past expenses move to Miscellaneous if deleted.

### Charts
Three chart types, all responding to the weekly/monthly toggle.

- **Bar chart** — daily spending across the selected period, each bar coloured by the dominant category of that day
- **Pie chart** — category-wise breakdown showing percentage and ₹ amount per category
- **Cumulative line graph** — running total of spending over the period, with a dashed horizontal line at your budget ceiling if one is set; the steepest part of the curve is where your money moved fastest

### Spending Map
The feature that makes SpendMap worth using.

Every location-tagged expense is plotted as a custom circular marker on an interactive Leaflet map with dark CartoDB tiles. Markers are color-coded against a threshold you set:

- Green — total spend at this location is below threshold
- Orange — total spend is between 1× and 2× threshold  
- Red — total spend exceeds 2× threshold

Default view shows only orange and red markers. Zoom in to reveal green locations. Multiple visits to the same location stack — the marker shows combined total, number of visits, and last visit date in a popup. The map has its own weekly/monthly period filter.

### Soft Limit Reminder
Set a monthly or weekly budget. At 70% — a subtle banner. At 90% — a stronger nudge. At 100% — an informational note. Nothing ever blocks a transaction. You're an adult.

### Settings
Update name, email, monthly and weekly budgets, UPI ID (format-validated, stored for V2 integration), map threshold amount, custom categories, and dark mode preference. Full data deletion with double confirmation. Logout.

### UPI ID Field
Stored and validated on your profile but not connected to any real transaction flow in V1. It exists to make the V2 vision concrete — when UPI webhook integration ships, the app will detect payments the moment they happen and prompt you to categorise them. The infrastructure is already in place.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Vanilla HTML5, CSS3 with CSS Variables, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas via Mongoose |
| Maps | Leaflet.js + OpenStreetMap Nominatim (reverse geocoding) |
| Charts | Chart.js |
| Auth | bcryptjs + JSON Web Tokens |

No frontend framework. The entire UI is hand-built CSS using a design system of variables — every colour, spacing value, and typography size defined once at the root and used consistently across all pages. Dark mode by default.

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

**Prerequisites**
- Node.js v16 or higher — [nodejs.org](https://nodejs.org)
- A free MongoDB Atlas account — [mongodb.com/atlas](https://mongodb.com/atlas)

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

Copy `.env.example` to `.env` and fill in your values:
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/spendmap?appName=Cluster0
JWT_SECRET=any_long_random_string_here
```

To get your MongoDB URI: Atlas dashboard → Connect → Drivers → copy the connection string → replace `<password>` with your database user password and add `/spendmap` before the `?`.

**4. Run the app**
```bash
npm start
```

**5. Open in browser**
```
http://localhost:5000
```

---

## Roadmap

**V1.5**
- Monthly recap shareable card — a designed summary of the month showing total spent, top category, most visited location, and streak. Built to screenshot and share.

**V2**
- Google OAuth sign-in
- Email OTP verification on signup
- Optional phone number with SMS OTP support
- UPI webhook integration — app detects payments the moment they're made and prompts for category automatically
- Bank statement import via CSV/PDF parsing
- Shared expense splitting for hostel roommates and group trips

---

## Design Decisions

A few intentional choices worth noting for anyone reading the code:

**No frontend framework.** React or Vue would have been faster to scaffold but harder to explain line by line. Every part of this codebase is something the author can open, point to, and describe. That matters more than framework familiarity at this stage.

**CSS variables over a utility framework.** No Tailwind, no Bootstrap. A single `:root` block defines the entire design system. Zero loose hex values anywhere in the stylesheet. This is the same pattern used in production design systems — tokens first, everything else references them.

**localStorage as a fallback, MongoDB as the truth.** All data lives in MongoDB Atlas. The app doesn't rely on localStorage for anything critical — it's used only for the JWT token and theme preference.

**Nominatim over Google Maps API.** Free, no API key required, good enough for reverse geocoding a city-level location. Google Maps would cost money at any real scale and add unnecessary complexity for a prototype.

---

## Author

Utkarsh Anand  
GitHub: [github.com/ut3arsh](https://github.com/ut3arsh)

---

## License

MIT — free to use, modify, and distribute with attribution.
