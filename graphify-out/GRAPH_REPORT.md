# Graph Report - .  (2026-07-30)

## Corpus Check
- 27 files · ~66,917 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 86 nodes · 151 edges · 8 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App Core & Realtime Firebase
- Build System & Dev Tooling
- External UI & Map Dependencies
- Hotel & Restaurant WhatsApp Bookings
- Driver Companion & Live GPS Dispatch
- POI Categories & Search State
- Leaflet Map Rendering & Icons

## God Nodes (most connected - your core abstractions)
1. `firestore` - 7 edges
2. `calculateDistance()` - 7 edges
3. `formatDistance()` - 6 edges
4. `openWhatsApp()` - 6 edges
5. `App()` - 5 edges
6. `RideSheet()` - 5 edges
7. `LocationCard()` - 5 edges
8. `calculateETA()` - 5 edges
9. `scripts` - 4 edges
10. `HotelBooking()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `useFirebaseLocations()`  [EXTRACTED]
  Vrinda-Tours-React/src/App.jsx → Vrinda-Tours-React/src/hooks/useFirebaseLocations.js
- `App()` --calls--> `useFirebaseDrivers()`  [EXTRACTED]
  Vrinda-Tours-React/src/App.jsx → Vrinda-Tours-React/src/hooks/useFirebaseDrivers.js
- `App()` --calls--> `useGeolocation()`  [EXTRACTED]
  Vrinda-Tours-React/src/App.jsx → Vrinda-Tours-React/src/hooks/useGeolocation.js
- `HotelBooking()` --calls--> `generateHotelMessage()`  [EXTRACTED]
  Vrinda-Tours-React/src/components/BookingSheets/HotelBooking.jsx → Vrinda-Tours-React/src/utils/whatsapp.js
- `HotelBooking()` --calls--> `openWhatsApp()`  [EXTRACTED]
  Vrinda-Tours-React/src/components/BookingSheets/HotelBooking.jsx → Vrinda-Tours-React/src/utils/whatsapp.js

## Import Cycles
- None detected.

## Communities (8 total, 0 thin omitted)

### Community 0 - "App Core & Realtime Firebase"
Cohesion: 0.19
Nodes (11): App(), AdminPanel(), DriversPanel(), RideStatusBanner(), Toast(), app, firebaseConfig, firestore (+3 more)

### Community 1 - "Build System & Dev Tooling"
Cohesion: 0.12
Nodes (15): @types/leaflet, vite, @vitejs/plugin-react, devDependencies, @types/leaflet, vite, @vitejs/plugin-react, name (+7 more)

### Community 2 - "External UI & Map Dependencies"
Cohesion: 0.13
Nodes (15): firebase, leaflet, leaflet.markercluster, lucide-react, react, react-dom, react-leaflet, dependencies (+7 more)

### Community 3 - "Hotel & Restaurant WhatsApp Bookings"
Cohesion: 0.40
Nodes (6): HotelBooking(), RestaurantBooking(), cleanPhone(), generateHotelMessage(), generateRestaurantMessage(), openWhatsApp()

### Community 4 - "Driver Companion & Live GPS Dispatch"
Cohesion: 0.53
Nodes (6): RideSheet(), DriverPortalModal(), LocationCard(), calculateDistance(), calculateETA(), formatDistance()

### Community 5 - "POI Categories & Search State"
Cohesion: 0.29
Nodes (6): CategoryPills(), Header(), CATEGORIES, locations, getCached(), useFirebaseLocations()

### Community 6 - "Leaflet Map Rendering & Icons"
Cohesion: 0.83
Nodes (3): createIcon(), getCategoryIcon(), MapView()

## Knowledge Gaps
- **19 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `External UI & Map Dependencies` to `Build System & Dev Tooling`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Build System & Dev Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `External UI & Map Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._