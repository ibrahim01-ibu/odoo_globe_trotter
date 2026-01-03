# GlobeTrotter – Master Feature Prompt (Clear Context)

## Role

You are a senior full-stack engineer and product architect building a hackathon-grade travel planning application called **GlobeTrotter**. The goal is to implement all required features from the provided project PDF with correct architecture, clean data modeling, and demo stability. Avoid unnecessary complexity and overengineering.

---

## Product Overview

GlobeTrotter is a **personalized multi-city travel planning application** that allows users to create, organize, visualize, budget, and share travel itineraries. The system focuses on clarity, correctness, and usability rather than booking or commerce.

---

## Core Functional Features

### 1. User Authentication ✅

Allow users to register and log in using email and password. Use secure password hashing and JWT-based authentication. Each user must only be able to access their own trips.

**Implementation:**
- bcryptjs for password hashing (12 rounds)
- JWT access tokens (15-minute expiry)
- Refresh tokens (30-day, stored in DB)
- Rate limiting (10 attempts / 15 minutes)
- Token blacklist for logout
- Password reset (token-based, 1 hour expiry)

### 2. Dashboard / Home ✅

Display a dashboard after login showing a list of the user's trips. Provide a clear call-to-action to create a new trip. Each trip card should show basic metadata such as name, date range, and number of cities.

### 3. Trip Creation ✅

Enable users to create a new trip by entering a trip name, start date, end date, and optional description. The trip acts as the root container for all itinerary data.

### 4. Trip Management ✅

Allow users to view, edit, and delete their existing trips. All operations must be protected by authentication and ownership checks.

### 5. Multi-City Itinerary Builder ✅

Allow users to add multiple cities (stops) to a trip. Each stop must have a start date, end date, and explicit ordering. Stops define the geographical and temporal structure of the trip.

### 6. City Discovery ✅

Provide a searchable list of cities that users can add as stops. Cities must include metadata such as country and cost index. Use seeded data instead of external APIs.

**Seeded Cities:** Paris, Rome, Barcelona, Tokyo, New York, London, Amsterdam, Prague, Vienna, Berlin, Lisbon, Athens, Dubai, Singapore, Sydney

### 7. Activity Discovery ✅

Allow users to browse activities for each city. Activities must include category, duration, and average cost. Users can add activities to specific dates within the trip.

### 8. Activity Scheduling ✅

Allow activities to be assigned to explicit calendar dates. Enforce backend validation so activities can only be scheduled within the date range of a valid city stop.

### 9. Budget Calculation ✅

Compute trip costs dynamically and statelessly. Budget must include:

* Stay cost (based on nights and city cost index)
* Activity cost (sum of selected activities)
* Meal cost (fixed per-day rate)
* Transport cost (estimated from number of city transitions)

Do not persist derived budget data.

### 10. Budget Visualization ✅

Display budget breakdowns using charts, including per-category totals and per-day costs. The UI should update automatically when the itinerary changes.

**Implementation:** Recharts (PieChart, BarChart)

### 11. Calendar View ✅

Provide a calendar-based visualization of the trip showing all scheduled activities on their respective dates. Use visual differentiation for cities while maintaining readability.

**Implementation:** FullCalendar with city-based translucent tinting

### 12. Public Sharing ✅

Allow users to publish a trip as a public, read-only view. Generate a snapshot of the trip data at publish time and serve the public view from the snapshot. Allow other users to copy the trip into their own account.

### 13. User Profile / Settings ⚠️

Allow users to update basic profile information and delete their account. Ensure proper cleanup of related data.

**Status:** Not yet implemented

---

## Design System

| Element | Color |
|---------|-------|
| Primary (Midnight Blue) | #0F2A44 |
| Secondary (Slate Blue) | #3B5B8A |
| Accent (Teal) | #2FA4A9 |
| Background | #F7F9FC |
| Card | #FFFFFF |
| Text Primary | #1E293B |
| Text Secondary | #64748B |
| Success | #22C55E |
| Warning | #F59E0B |
| Danger | #EF4444 |

---

## Non-Goals (Explicitly Excluded)

* No flight, hotel, or payment booking
* No real-time collaboration or chat
* No AI recommendations or ML models
* No third-party paid APIs

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| State | React Query (@tanstack/react-query) |
| Charts | Recharts |
| Calendar | FullCalendar |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (Prisma ORM) |
| Auth | JWT + bcryptjs + express-rate-limit |

---

## Demo Account

- **Email:** demo@globetrotter.app
- **Password:** demo123
- **Pre-loaded Trip:** "European Adventure" (Paris → Rome → Barcelona)

---

## Feature Completion Summary

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Complete |
| Dashboard / Home | ✅ Complete |
| Trip Creation | ✅ Complete |
| Trip Management | ✅ Complete |
| Multi-City Builder | ✅ Complete |
| City Discovery | ✅ Complete |
| Activity Discovery | ✅ Complete |
| Activity Scheduling | ✅ Complete |
| Budget Calculation | ✅ Complete |
| Budget Visualization | ✅ Complete |
| Calendar View | ✅ Complete |
| Public Sharing | ✅ Complete |
| User Profile/Settings | ⚠️ Not Implemented |
