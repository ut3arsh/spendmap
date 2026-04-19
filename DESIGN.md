# SpendMap — Design Document

**Version:** 1.0  
**Status:** V1 Prototype  
**Date:** April 2026

---

## 1. Design Philosophy

SpendMap is not a generic finance app. It is built for college students who have never used an expense tracker before — not because they don't care, but because every existing tool felt either too corporate, too complex, or too judgmental.

**Three design principles that govern every decision:**

**1. Numbers do the talking.**
Big, bold, unapologetic typography. The amount you spent should hit you immediately — not be buried in a table or a tiny widget. SpendMap respects your intelligence and shows you the real number front and centre.

**2. Dark by default, premium by feel.**
Inspired by Cred's visual language — not copied. Dark background, strong accent, generous whitespace, confident UI. The app should feel like something you'd actually want to open, not a homework assignment.

**3. No generic AI UI.**
No pure white cards. No default blue buttons. No identical rounded rectangles stacked in a grid. No Lorem Ipsum layouts. Every element earns its place. Typography, spacing, and colour do the heavy lifting.

---

## 2. Visual Design System

### 2.1 Colour Palette

```css
:root {
  /* Backgrounds */
  --color-bg-primary:    #0F0F14;   /* Deep charcoal — main background */
  --color-bg-secondary:  #1A1A24;   /* Slightly lighter — cards, panels */
  --color-bg-tertiary:   #22222F;   /* Hover states, input fields */

  /* Accent */
  --color-accent:        #7C3AED;   /* Electric violet — primary CTA, active states */
  --color-accent-soft:   #7C3AED26; /* Violet at 15% opacity — subtle highlights */
  --color-accent-hover:  #6D28D9;   /* Darker violet — hover on accent elements */

  /* Semantic colours */
  --color-success:       #10B981;   /* Green — low spend, positive streak */
  --color-warning:       #F59E0B;   /* Amber — 70% budget, orange map markers */
  --color-danger:        #EF4444;   /* Red — 90%+ budget, red map markers */

  /* Text */
  --color-text-primary:  #F1F0FF;   /* Near white with violet tint — main text */
  --color-text-secondary:#A09BB8;   /* Muted lavender — subtitles, labels */
  --color-text-disabled: #4A4560;   /* Disabled states */

  /* Borders */
  --color-border:        #2E2B42;   /* Subtle borders on cards */
  --color-border-focus:  #7C3AED;   /* Accent border on focused inputs */

  /* Map markers */
  --map-marker-low:      #10B981;   /* Green */
  --map-marker-mid:      #F59E0B;   /* Orange */
  --map-marker-high:     #EF4444;   /* Red */
}

/* Light mode override (toggled via class on <html>) */
html.light {
  --color-bg-primary:    #F8F7FF;
  --color-bg-secondary:  #EEEAF8;
  --color-bg-tertiary:   #E4DFF5;
  --color-text-primary:  #1A1530;
  --color-text-secondary:#5A5278;
  --color-border:        #D4CEF0;
}
```

### 2.2 Typography

```css
/* Font stack */
font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;

/* Scale */
--text-hero:   3rem;    /* 48px — Dashboard total spend number */
--text-xl:     1.5rem;  /* 24px — Section headers */
--text-lg:     1.125rem;/* 18px — Card titles, important labels */
--text-base:   1rem;    /* 16px — Body text */
--text-sm:     0.875rem;/* 14px — Subtitles, secondary info */
--text-xs:     0.75rem; /* 12px — Timestamps, micro labels */

/* Weights */
--weight-black:  900;  /* Hero numbers */
--weight-bold:   700;  /* Section headers */
--weight-medium: 500;  /* Labels, nav items */
--weight-normal: 400;  /* Body */
```

### 2.3 Spacing System

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### 2.4 Border Radius

```css
--radius-sm:   8px;   /* Small elements, tags */
--radius-md:   12px;  /* Cards, inputs */
--radius-lg:   20px;  /* Large cards, modals */
--radius-full: 9999px; /* Pills, badges, FAB */
```

### 2.5 Shadows

```css
--shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
--shadow-modal: 0 8px 48px rgba(0, 0, 0, 0.5);
--shadow-accent: 0 4px 20px rgba(124, 58, 237, 0.3); /* Violet glow for CTA */
```

---

## 3. Component Library

### 3.1 Buttons

**Primary Button (CTA)**
```
Background: --color-accent
Text: white, font-weight: 700
Border-radius: --radius-full
Padding: 14px 28px
Box-shadow: --shadow-accent
Hover: background --color-accent-hover, transform: translateY(-1px)
Active: transform: translateY(0)
Transition: all 0.2s ease
```

**Secondary Button**
```
Background: transparent
Border: 1px solid --color-border
Text: --color-text-primary
Hover: background --color-bg-tertiary, border-color --color-accent
```

**Danger Button**
```
Background: transparent
Border: 1px solid --color-danger
Text: --color-danger
Hover: background rgba(239,68,68,0.1)
```

### 3.2 Cards

```
Background: --color-bg-secondary
Border: 1px solid --color-border
Border-radius: --radius-lg
Padding: --space-6
Box-shadow: --shadow-card
```

Cards should NOT all be the same size. Use asymmetric grids. The total spend card is large. The streak badge is compact. Let content drive size.

### 3.3 Inputs

```
Background: --color-bg-tertiary
Border: 1px solid --color-border
Border-radius: --radius-md
Padding: 14px 16px
Color: --color-text-primary
Font-size: --text-base
Focus: border-color --color-border-focus, box-shadow: 0 0 0 3px --color-accent-soft
Placeholder color: --color-text-disabled
```

### 3.4 Category Tags / Pills

```
Background: category-specific colour at 15% opacity
Text: category-specific colour
Border-radius: --radius-full
Padding: 4px 12px
Font-size: --text-xs
Font-weight: --weight-medium
```

Category colour map:
```
Food:           #F59E0B  (amber)
Transport:      #3B82F6  (blue)
College:        #8B5CF6  (purple)
Shopping:       #EC4899  (pink)
Health:         #10B981  (green)
Entertainment:  #F97316  (orange)
Subscriptions:  #06B6D4  (cyan)
Miscellaneous:  #6B7280  (grey)
Custom:         #A78BFA  (light violet)
```

### 3.5 Floating Action Button (FAB)

The Add Expense button. Always visible on mobile.

```
Position: fixed, bottom: 24px, right: 24px
Size: 56px × 56px
Shape: circle (border-radius: 50%)
Background: --color-accent
Icon: + (white, 24px)
Box-shadow: --shadow-accent
Hover: transform: scale(1.08)
Active: transform: scale(0.96)
Transition: transform 0.15s ease
```

### 3.6 Bottom Navigation (Mobile)

```
Position: fixed, bottom: 0
Background: --color-bg-secondary
Border-top: 1px solid --color-border
Height: 64px
Items: Dashboard, History, Map, Settings (4 items)
Active state: icon + label in --color-accent
Inactive: icon only in --color-text-secondary
```

---

## 4. Page Layouts

### 4.1 Dashboard

```
┌─────────────────────────────┐
│  SpendMap          🌙  👤   │  ← Header (app name + dark toggle + avatar)
├─────────────────────────────┤
│  [Weekly]  [Monthly]        │  ← Period toggle pills
├─────────────────────────────┤
│                             │
│  Total Spent                │
│  ₹ 4,280                   │  ← HERO number, --text-hero, --weight-black
│  This month                 │  ← Subtitle in --color-text-secondary
│                             │
│  ████████████░░░░  68%      │  ← Budget health bar (amber at 68%)
│  ₹4,280 of ₹6,300           │
│                             │
├──────────────┬──────────────┤
│  🔥 9 days   │  12 days     │  ← Two compact cards side by side
│  streak      │  remaining   │
├──────────────┴──────────────┤
│  💥 Biggest Splurge         │
│  ₹1,500 · Restaurant        │  ← Single line callout card
│  April 14th                 │
├─────────────────────────────┤
│  Spending Map    [View All] │
│  ┌─────────────────────┐   │
│  │   [map snapshot]    │   │  ← Compact map preview, ~200px tall
│  └─────────────────────┘   │
├─────────────────────────────┤
│  Recent Expenses            │
│  · ₹120  Food   Today      │
│  · ₹350  Transport  Yest.  │
│  · ₹80   Food   Yest.      │  ← Last 3 entries, link to full history
└─────────────────────────────┘
         [+]                    ← FAB fixed bottom right
```

### 4.2 Add Expense Sheet

Slides up as a bottom sheet on mobile (not a separate page).

```
┌─────────────────────────────┐
│  ————                       │  ← Drag handle
│  Add Expense                │
├─────────────────────────────┤
│  ₹ [____________]           │  ← Amount input, large text, number keyboard
├─────────────────────────────┤
│  Category                   │
│  [Food] [Transport] [College]│  ← Horizontal scroll pills
│  [Shopping] [Health] [+more] │
├─────────────────────────────┤
│  Date    [Today ▾]          │  ← Date picker, defaults today
├─────────────────────────────┤
│  Note (optional)            │
│  [________________________] │
├─────────────────────────────┤
│  📍 Fetching location...    │  ← Auto-fills to place name
│  "Reliance Fresh, Boring Rd"│  ← Shows suggestion with ✓ and ✕ options
├─────────────────────────────┤
│  [    Add Expense    ]      │  ← Primary CTA button, full width
└─────────────────────────────┘
```

### 4.3 Charts Page

```
┌─────────────────────────────┐
│  Spending Overview          │
│  [Weekly]  [Monthly]        │
├─────────────────────────────┤
│                             │
│  Daily Spending (Bar)       │
│  [████ chart ████]          │  ← Chart.js bar chart, full width
│                             │
├─────────────────────────────┤
│                             │
│  By Category (Pie)          │
│       [◉ pie chart]         │  ← Pie chart centred
│  ● Food 34%   ● Transport   │
│                             │
├─────────────────────────────┤
│                             │
│  Spending Curve (Line)      │
│  [~~~~ line chart ~~~~]     │  ← Cumulative line, dashed budget line
│                             │
└─────────────────────────────┘
```

### 4.4 Map Page

```
┌─────────────────────────────┐
│  Spending Map               │
│  [Weekly]  [Monthly]        │
├─────────────────────────────┤
│                             │
│  [                     ]    │
│  [   full map view     ]    │  ← Leaflet map, 60vh height
│  [  🔴  🟠    🟢       ]   │
│  [                     ]    │
│                             │
├─────────────────────────────┤
│  Threshold: ₹[500    ]      │  ← Inline threshold editor
│  🟢 <₹500  🟠 ₹500-1000    │
│  🔴 >₹1000                  │
├─────────────────────────────┤
│  Top Locations              │
│  🔴 Restaurant  ₹1,500      │
│  🟠 Gen. Store  ₹800        │  ← Sorted list below map
│  🟢 Turf        ₹300        │
└─────────────────────────────┘
```

---

## 5. Micro-interactions & Animations

These must be implemented. They are what separate a real product from a student project.

**Page transitions:** Fade in on load — `opacity: 0` to `opacity: 1`, duration 200ms.

**FAB:** Subtle pulse animation on first load to draw attention. Scale bounce on tap.

**Budget health bar:** Animate width on load — grows from 0 to actual % over 600ms with ease-out.

**Hero number:** Count-up animation from 0 to actual amount on dashboard load. Duration: 800ms.

**Category pills in Add Expense:** Selected pill gets accent background + white text with a scale(1.05) pop.

**Expense added confirmation:** Brief green checkmark animation before sheet dismisses.

**Map markers:** Fade in with a slight scale-up (scale 0.5 → 1) staggered by 50ms per marker.

**Streak badge:** Fire emoji pulses on hover/tap.

**All hover states on desktop:** Smooth 0.2s transitions. No instant colour jumps.

---

## 6. Backend Architecture

### 6.1 Stack
- Runtime: Node.js (v18+)
- Framework: Express.js
- Database: MongoDB Atlas via Mongoose ODM
- Auth: JSON Web Tokens (jsonwebtoken) + bcryptjs
- Environment: dotenv

### 6.2 Mongoose Models

**User Model**
```javascript
{
  name:             String, required
  email:            String, required, unique, lowercase
  password:         String, required  // bcrypt hashed
  upiId:            String, optional  // format validated before save
  monthlyBudget:    Number, default: 0
  weeklyBudget:     Number, default: 0
  mapThreshold:     Number, default: 500
  customCategories: [String], max length 3
  createdAt:        Date, default: Date.now
}
```

**Expense Model**
```javascript
{
  userId:    ObjectId, ref: 'User', required
  amount:    Number, required, min: 1, max: 99999
  category:  String, required
  note:      String, maxlength: 100
  date:      Date, required, default: Date.now
  location: {
    name:    String,
    lat:     Number,
    lng:     Number
  },
  createdAt: Date, default: Date.now
}
```

### 6.3 API Routes

**Auth Routes** — `/api/auth`
```
POST /signup     — create user, return JWT
POST /login      — validate credentials, return JWT
```

**Expense Routes** — `/api/expenses` (all protected)
```
GET    /              — get all expenses for logged-in user
                        query params: period=weekly|monthly
POST   /              — create new expense
PUT    /:id           — update expense by id
DELETE /:id           — delete expense by id
GET    /summary       — returns: total, by-category breakdown,
                        streak, biggest splurge, budget %
GET    /map           — returns location-tagged expenses only
                        with stacked totals per unique location
```

**User Routes** — `/api/user` (all protected)
```
GET    /profile       — get user profile
PUT    /profile       — update name, email, budgets, UPI, threshold
PUT    /categories    — update custom categories array
DELETE /data          — delete all user expenses (with confirmation)
```

### 6.4 Auth Middleware
```javascript
// Applied to all /api/expenses and /api/user routes
// Reads Authorization: Bearer <token> header
// Verifies JWT, attaches userId to req
// Returns 401 if missing or invalid
```

### 6.5 Environment Variables
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_here
```

---

## 7. Frontend Architecture

### 7.1 File Structure
```
client/
├── index.html          ← Login / Signup page
├── dashboard.html
├── history.html
├── charts.html
├── map.html
├── settings.html
├── css/
│   └── style.css       ← All CSS, variables at top, mobile-first
└── js/
    ├── api.js          ← All fetch calls to backend, token handling
    ├── app.js          ← Auth, navigation, shared utilities
    ├── dashboard.js    ← Dashboard logic
    ├── expense.js      ← Add/edit expense, GPS, geocoding
    ├── charts.js       ← Chart.js setup and render
    └── map.js          ← Leaflet map setup and marker logic
```

### 7.2 API Helper (api.js)
```javascript
// Base URL pointed to backend
// All requests attach JWT from localStorage
// Central error handler — 401 redirects to login
// All responses return parsed JSON or throw Error
```

### 7.3 GPS & Reverse Geocoding Flow
```javascript
// 1. navigator.geolocation.getCurrentPosition()
// 2. On success: send lat/lng to Nominatim
//    GET https://nominatim.openstreetmap.org/reverse
//         ?lat=X&lon=Y&format=json
// 3. Extract: result.namedetails or result.display_name
// 4. Clean to readable format (shop name + road if available)
// 5. Pre-fill location input field
// 6. Check against saved locations in DB for repeat recognition
// On any failure: silently skip, location remains optional
```

---

## 8. Responsive Breakpoints

```css
/* Mobile first — base styles are for mobile */

@media (min-width: 640px) {
  /* Tablet adjustments */
}

@media (min-width: 1024px) {
  /* Desktop — sidebar nav replaces bottom nav */
  /* Dashboard becomes 2-column grid */
  /* Charts and map shown side by side */
}
```

---

## 9. Chart.js Configuration Notes

All charts use a dark theme matching the app. Override Chart.js defaults:

```javascript
Chart.defaults.color = '#A09BB8';           // axis labels
Chart.defaults.borderColor = '#2E2B42';     // grid lines
Chart.defaults.font.family = 'Inter, sans-serif';

// Bar chart bars: gradient fill from accent to accent-transparent
// Pie chart: use category colour map defined in Section 3.4
// Line chart: accent colour line, no fill, tension: 0.4 for smooth curve
// Budget ceiling: dashed horizontal line in --color-danger at 50% opacity
```

---

## 10. Leaflet Map Configuration

```javascript
// Tile layer: OpenStreetMap dark variant
// https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png

// Custom circular markers (not default Leaflet pins):
// SVG circle, 24px diameter, colour from threshold logic
// Drop shadow matching marker colour at 40% opacity

// Popup styling: dark background matching --color-bg-secondary
// Auto-fit map bounds to all visible markers on load
```

---

## 11. What NOT to Do (Anti-patterns for the AI Agent)

1. Do NOT use pure white (#FFFFFF) as any background anywhere
2. Do NOT use default blue (#0000FF or Bootstrap blue) for any button
3. Do NOT make all cards the same height or width — asymmetric layouts
4. Do NOT use default Leaflet blue pin markers — use custom SVG circles
5. Do NOT use default Chart.js colours — override with the colour system above
6. Do NOT add unnecessary shadows or gradients everywhere — use them intentionally
7. Do NOT skip micro-interactions listed in Section 5 — they are required
8. Do NOT use any external CSS framework (no Bootstrap, no Tailwind) — pure CSS with variables only
9. Do NOT hardcode any colour hex values outside of :root — always use CSS variables
10. Do NOT use Comic Sans, Roboto, or any system-default font — load Inter from Google Fonts
