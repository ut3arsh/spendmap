# SpendMap — Software Requirements Specification (SRS)

**Version:** 1.0  
**Status:** V1 Prototype  
**Date:** April 2026

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete functional and non-functional requirements for SpendMap V1 — a personal expense tracking web application targeting college students on fixed monthly budgets.

### 1.2 Scope
SpendMap V1 is a full-stack web application. It allows users to manually log expenses, visualise spending through charts and an interactive map, track streaks, and set soft budget reminders. It does not integrate with real UPI or banking APIs in V1.

### 1.3 Intended Audience
- Developer / AI agent building the application
- Interviewer or reviewer evaluating the project

### 1.4 Definitions
| Term | Meaning |
|---|---|
| Expense | A single spending record with amount, category, date, optional note, optional location |
| Threshold | A user-defined amount above which a location is highlighted on the map |
| Soft Limit | A budget the app reminds you about but never enforces |
| Streak | Consecutive days on which at least one expense was logged |
| Reverse Geocoding | Converting GPS coordinates to a human-readable place name |

---

## 2. Overall Description

### 2.1 Product Perspective
SpendMap is a standalone web application. Frontend communicates with a Node.js/Express backend via REST API. Data is stored in MongoDB Atlas. Maps use Leaflet.js with OpenStreetMap Nominatim for reverse geocoding. Charts use Chart.js.

### 2.2 User Classes
**Primary User:** College student, age 18–24, low-medium monthly budget, uses phone primarily, logs 1–5 expenses per day, wants quick entry and visual feedback.

### 2.3 Assumptions
- User has a modern smartphone browser with GPS capability
- User is comfortable with manual expense entry
- App does not need to connect to real banks or UPI in V1
- MongoDB Atlas free tier is sufficient for prototype data volume

---

## 3. Functional Requirements

---

### FR-01: User Authentication

**FR-01.1 Signup**
- User provides: full name, email, password
- Password must be minimum 8 characters
- Email must be unique — duplicate email returns error with message
- Password stored as bcrypt hash, never plaintext
- On success: JWT token returned, user redirected to onboarding

**FR-01.2 Login**
- User provides email and password
- On success: JWT token returned, user redirected to dashboard
- On failure: generic error "Invalid email or password" — no specifics for security

**FR-01.3 Session**
- JWT stored in localStorage
- Token expiry: 7 days
- All protected routes validate token via middleware
- Invalid/expired token redirects to login

---

### FR-02: Onboarding (First Login Only)

User is prompted to set:
- Monthly budget (₹ amount) — required
- Weekly budget (₹ amount) — optional
- UPI ID — optional, format validated (must match pattern: `username@bankname`)
- Up to 3 custom category names

These can all be edited later in Settings.

---

### FR-03: Dashboard

Dashboard is the landing page after login. It displays:

**FR-03.1 Period Toggle**
- Weekly / Monthly toggle at the top
- All stats below respond to selected period

**FR-03.2 Total Spent**
- Large, bold number showing total spent in selected period
- Subtitle showing period (e.g. "This month" or "This week")

**FR-03.3 Budget Health Bar**
- Progress bar from 0% to 100% of set budget
- Green below 70%, amber 70–90%, red above 90%
- Shows ₹ spent / ₹ budget below bar
- If no budget set, shows prompt to set one

**FR-03.4 Biggest Splurge Callout**
- Single line: "Your biggest spend was ₹[amount] at [place/category] on [date]"
- If no expenses yet: hidden

**FR-03.5 Streak Badge**
- Shows current consecutive logging streak in days
- E.g. "🔥 7 day streak"
- Resets to 0 if a full calendar day passes with no expense logged

**FR-03.6 Days Remaining**
- Simple text: "12 days left this month"

**FR-03.7 Map Snapshot**
- Compact map preview showing top spending locations
- Tapping/clicking opens full map view

**FR-03.8 Quick Add Button**
- Prominent floating action button or CTA to add new expense
- Always visible on dashboard

---

### FR-04: Add Expense

**FR-04.1 Entry Flow**
1. User taps Add Expense
2. Form appears with: Amount (required), Category (required), Date (defaults to today), Note (optional)
3. On form open: app silently requests browser geolocation permission
4. If granted: GPS coordinates captured, reverse geocoded via Nominatim API to nearest place name
5. Location tag field appears pre-filled with suggested place name
6. User can: confirm suggestion, edit it, or clear it entirely
7. If GPS denied or unavailable: location field remains optional and empty
8. User submits — expense saved to database

**FR-04.2 Repeat Location Recognition**
- If GPS coordinates match a previously saved location (within ~100 metre radius), app suggests the previously saved custom name instead of the Nominatim result
- User still has full edit control

**FR-04.3 Validation**
- Amount: required, must be positive number, max ₹99,999
- Category: required, must be one of preset or custom categories
- Date: defaults to today, user can change to any past date, cannot be future date
- Note: optional, max 100 characters
- Location: fully optional

---

### FR-05: Categories

**FR-05.1 Preset Categories (cannot be deleted)**
Food, Transport, College, Shopping, Health, Entertainment, Subscriptions, Miscellaneous

**FR-05.2 Custom Categories**
- User can create up to 3 custom categories
- Name: max 20 characters
- Can be renamed or deleted from Settings
- If a custom category is deleted, its past expenses are moved to Miscellaneous

---

### FR-06: Expense History

**FR-06.1 List View**
- All expenses listed in reverse chronological order
- Each entry shows: amount, category (with colour tag), date, location name if tagged, note snippet if present
- Weekly / Monthly toggle to filter

**FR-06.2 Filter**
- Filter by category (single select)
- Filter by date range (custom)

**FR-06.3 Edit / Delete**
- Each expense has edit and delete options
- Delete requires one confirmation tap
- Edit opens same form as Add Expense, pre-filled

---

### FR-07: Charts & Graphs

All charts respond to the Weekly / Monthly period toggle.

**FR-07.1 Bar Chart — Daily Spending**
- X axis: days of the week (weekly) or dates of the month (monthly)
- Y axis: total amount spent on that day
- Each bar coloured by dominant category of that day

**FR-07.2 Pie Chart — Category Breakdown**
- Each slice represents a category
- Shows percentage and ₹ amount on hover/tap
- Only categories with at least one expense shown

**FR-07.3 Line Graph — Cumulative Spending**
- X axis: dates
- Y axis: running total spent so far
- Shows clearly when spending accelerated in the period
- If budget is set, a horizontal dashed line shows the budget ceiling

---

### FR-08: Spending Map

**FR-08.1 Map Render**
- Full interactive map using Leaflet.js
- Only expenses with location tags are plotted
- Each location shown as a circular marker

**FR-08.2 Threshold Color Coding**
- User sets a threshold amount in Settings (default ₹500)
- Locations with total spend below threshold: green marker
- Locations with total spend at 1x–2x threshold: orange marker
- Locations with total spend above 2x threshold: red marker

**FR-08.3 Default View**
- Default zoom shows only orange and red markers
- User zooms in to reveal green (low spend) markers

**FR-08.4 Stacking**
- Multiple expenses at the same location (matched by saved name or coordinates within 100m) are stacked
- Marker shows combined total for that location

**FR-08.5 Marker Popup**
- Tapping a marker shows: place name, total spent, number of visits, last visited date

**FR-08.6 Period Filter**
- Map has its own Weekly / Monthly toggle
- Only shows location expenses from selected period

---

### FR-09: Soft Limit Reminder

**FR-09.1 Budget Setup**
- User sets monthly and/or weekly budget in Onboarding or Settings
- Can be changed at any time

**FR-09.2 Nudge Triggers**
- At 70% of budget: subtle in-app banner — "You've used 70% of your budget. ₹X remaining."
- At 90% of budget: stronger nudge — "Almost there. Only ₹X left."
- At 100%: informational only — "You've hit your budget for this period."
- No blocking, no red screens, no guilt

---

### FR-10: Settings

User can update:
- Name, email
- Monthly and weekly budget
- UPI ID (format validated, display only)
- Map threshold amount
- Custom categories (add, rename, delete up to 3)
- Dark mode toggle (default: dark)
- Delete all data (with double confirmation)
- Logout

---

### FR-11: UPI ID Field

- Stored as profile information only in V1
- Validates format: must match `alphanumeric@bankname` pattern (e.g. `citin@okicici`, `user123@paytm`)
- Displayed on profile/settings as "Linked UPI ID"
- No actual UPI connection or transaction fetching in V1
- Exists to signal V2 vision of automated expense detection

---

## 4. Non-Functional Requirements

**NFR-01 Performance**
- Dashboard must load in under 2 seconds on a standard 4G connection
- Map must render within 3 seconds with up to 100 location markers

**NFR-02 Responsiveness**
- Fully functional on mobile screens (360px and above)
- Usable on desktop
- Mobile-first design approach

**NFR-03 Usability**
- Adding an expense must take no more than 5 taps/clicks in the normal flow
- No feature requires more than 2 levels of navigation to reach

**NFR-04 Security**
- Passwords hashed with bcrypt (minimum 10 salt rounds)
- JWT used for all authenticated routes
- User can only access their own data — no cross-user data exposure
- Environment variables used for all secrets (never hardcoded)

**NFR-05 Data Persistence**
- All data stored in MongoDB Atlas cloud database
- Data persists across sessions and devices for the same account

**NFR-06 Offline Handling**
- If GPS is unavailable: location field gracefully skipped, no crash
- If Nominatim API fails: location field left blank, no crash
- If database call fails: user shown friendly error, not a stack trace

---

## 5. Out of Scope (V1)

The following are explicitly excluded from V1 and documented as V2 roadmap:

- Real UPI webhook integration
- Bank statement import
- Push notifications / SMS alerts
- Shared expense splitting
- Multi-currency
- Native mobile app
- Monthly recap shareable card (V1.5)

---

## 6. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-01 | college student | log an expense in under 30 seconds | I don't forget it |
| US-02 | user | see which category I spend most on | I understand my habits |
| US-03 | user | see my expenses on a map | I know which locations drain my wallet |
| US-04 | user | set a soft budget reminder | I stay loosely aware without pressure |
| US-05 | user | see my spending streak | I stay motivated to keep logging |
| US-06 | user | have my location auto-suggested | Entry feels fast and smart |
| US-07 | user | filter expenses by week or month | I can compare periods |
| US-08 | user | use the app comfortably at night | Dark mode is default |
| US-09 | user | know my biggest single spend | I can reflect on it |
| US-10 | user | store my UPI ID on my profile | The app feels ready for V2 |
