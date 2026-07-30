# Brij Yatra — Vrinda Tours (React Architecture & Guide)

Welcome to **Brij Yatra (Vrinda Tours)** — a modern, responsive web application for sacred pilgrimage guidance in the Brij 84 Kos region (Vrindavan, Mathura, Barsana, Nandgaon, Govardhan).

This document breaks down the full application structure, real-time Firebase backend, driver companion portal, map cluster rendering, and the **Graphify Knowledge Graph** setup.

---

## 🏛️ Project Overview & Key Features

1. **Interactive Map View ([MapView.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/Map/MapView.jsx))**:
   - Leaflet powered map with CartoDB Voyager vector tiles.
   - Animated SVG background removal filter (`#remove-bg`) for seamless icon rendering.
   - Category-filtered POI markers (Temples, Holy Sites, Towns, Dining, Hotels, Information).
   - Marker clustering (`maxClusterRadius: 60`, `disableClusteringAtZoom: 18`) with 1:1 parity with the original monolith design.
   - Custom animated user GIF marker (`user-marker-crop.gif`) with SVG background transparency.

2. **Driver Companion Portal ([DriverPortalModal.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/Driver/DriverPortalModal.jsx))**:
   - Mobile driver sign-in against Firestore `drivers` collection.
   - Throttled real-time GPS location streaming (updates Firestore **only** when moving $\ge 15\text{ meters}$ or every $\ge 10\text{ seconds}$).
   - Live incoming passenger ride requests overlay with 30s auto-decline countdown timer.
   - Status states (`Available`, `Busy`, `Offline`) with real-time passenger tracking banners.

3. **Passenger Ride & Booking Sheets**:
   - Vehicle selection with driver ratings, vehicle emojis (🛺 E-Rickshaw, 🚗 Taxi, 🛵 Bike Taxi), and ETA calculations.
   - Direct WhatsApp integration for hotel and restaurant reservation inquiries.

4. **Fleet Admin Panel ([AdminPanel.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/Admin/AdminPanel.jsx), [DriversPanel.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/Admin/DriversPanel.jsx))**:
   - Secure admin credentials (`admin` / `vrinda2026`).
   - Register new drivers with custom vehicle type and registration numbers.
   - Custom styled delete modal overlays (native browser `window.confirm` banned).

---

## 🗺️ Codebase Architecture & Graphify Knowledge Graph

The project architecture has been fully extracted and mapped into a persistent **Graphify Knowledge Graph** located in `graphify-out/`.

### 📊 Community Modules (Graphify Communities)

| Community ID | Module Name | Primary Responsibilities & Key Files |
| :--- | :--- | :--- |
| **Community 0** | **App Core & Realtime Firebase** | Main application state ([App.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/App.jsx)), Firebase initialization ([firebase.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/config/firebase.js)), Driver state hook ([useFirebaseDrivers.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/hooks/useFirebaseDrivers.js)), Geolocation hook ([useGeolocation.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/hooks/useGeolocation.js)). |
| **Community 3** | **Hotel & Restaurant WhatsApp Bookings** | Hotel booking sheet ([HotelBooking.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/BookingSheets/HotelBooking.jsx)), Restaurant booking sheet ([RestaurantBooking.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/BookingSheets/RestaurantBooking.jsx)), WhatsApp message formatting ([whatsapp.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/utils/whatsapp.js)). |
| **Community 4** | **Driver Companion & Live GPS Dispatch** | Driver companion portal ([DriverPortalModal.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/Driver/DriverPortalModal.jsx)), Ride request sheet ([RideSheet.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/BookingSheets/RideSheet.jsx)), Haversine distance & ETA utility ([distance.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/utils/distance.js)). |
| **Community 5** | **POI Categories & Search State** | Header search bar ([Header.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/Header/Header.jsx)), Category filter pills ([CategoryPills.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/CategoryPills/CategoryPills.jsx)), Static location data ([locations.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/data/locations.js)), Firebase locations hook ([useFirebaseLocations.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/hooks/useFirebaseLocations.js)). |
| **Community 6** | **Leaflet Map Rendering & Icons** | Leaflet map container ([MapView.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/components/Map/MapView.jsx)), category marker mapping (`getCategoryIcon`), custom user location marker. |

---

## ⚡ Central Bridge & God Nodes

The Graphify analysis identified the highest-connected core nodes in the codebase:

1. **`firestore` ([firebase.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/config/firebase.js))** — Degree: **7** (Central database bridge for drivers, locations, and live rides).
2. **`calculateDistance()` ([distance.js](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/utils/distance.js))** — Degree: **7** (Used for ETA calculation, driver sorting, and GPS throttling checks).
3. **`App()` ([App.jsx](file:///Users/sakhi/Code/Company/Projects/Vrinda-Tours/Vrinda-Tours-React/src/App.jsx))** — Degree: **5** (Root controller orchestrating map state, active location cards, and modal dialogs).

---

## 🛠️ Navigating the Graphify Knowledge Graph

You can explore the codebase graph at any time using CLI or Graphify commands:

```bash
# View interactive HTML visualization in your browser
open graphify-out/graph.html

# Audit summary report
cat graphify-out/GRAPH_REPORT.md

# Query relationships or trace data flow
graphify query "How does driver location streaming work?"
graphify path "DriverPortalModal" "firestore"
graphify explain "MapView"
```

---

## 🚀 Development & Build Commands

```bash
# Run local dev server
npm run dev

# Build production bundle (Zero-error output verified)
npm run build

# Push to GitHub
git push origin main
```
