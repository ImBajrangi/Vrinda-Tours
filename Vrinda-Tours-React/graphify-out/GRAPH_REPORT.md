# Graph Report - Vrinda-Tours-React  (2026-09-29)

## Corpus Check
- 102 files · ~2,178,078 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 486 nodes · 1106 edges · 42 communities (24 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `82f692b3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- App.jsx
- PartnerLandingPage.jsx
- realtimeDatabaseService.js
- AdminDashboardPage.jsx
- Confetti.jsx
- firebase.js
- rideService.js
- supabase.js
- dependencies
- package.json
- devDependencies
- Brij Yatra — Vrinda Vihar (React Architecture & Guide)
- Project Agent Guidelines & Engineering Standards
- ExampleInstrumentedTest.java
- ExampleUnitTest.java
- gradlew
- MainActivity.java
- InfoModal.jsx
- brajTowns.js
- MorphErrorBoundary
- @capacitor/cli
- firebase
- canvas-confetti
- leaflet
- leaflet.markercluster
- lucide
- lucide-react
- react
- react-dom
- @supabase/supabase-js
- brajAreas.js
- vercel.json
- @capacitor/core

## God Nodes (most connected - your core abstractions)
1. `calculateDistance()` - 22 edges
2. `safeRemoveChannel()` - 21 edges
3. `AdminDashboardPage()` - 20 edges
4. `PartnerLandingPage()` - 20 edges
5. `supabase` - 20 edges
6. `useBottomSheetDrag()` - 19 edges
7. `formatDistance()` - 17 edges
8. `firestore` - 16 edges
9. `useFavorites()` - 15 edges
10. `isSupabaseConfigured()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `DriversPanel()` --calls--> `useBottomSheetDrag()`  [EXTRACTED]
  src/components/Admin/DriversPanel.jsx → src/hooks/useBottomSheetDrag.js
- `App()` --calls--> `useNearbyFleet()`  [EXTRACTED]
  src/App.jsx → src/hooks/useNearbyFleet.js
- `App()` --calls--> `getPersistedLocalRide()`  [EXTRACTED]
  src/App.jsx → src/services/rideService.js
- `App()` --calls--> `subscribeToRideRequest()`  [EXTRACTED]
  src/App.jsx → src/services/rideService.js
- `App()` --calls--> `updatePageSEO()`  [EXTRACTED]
  src/App.jsx → src/utils/seoHelper.js

## Import Cycles
- None detected.

## Communities (42 total, 18 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.05
Nodes (44): AdminDashboardPage, AgencyLandingPage, App(), DriverLandingPage, DriverPortalModal, DriversPanel, FavoritesListSheet, HelpCenterModal (+36 more)

### Community 1 - "PartnerLandingPage.jsx"
Cohesion: 0.06
Nodes (46): DETAIL_ADDONS, PackageDetailPage(), PartnerLandingPage(), renderRoleIcon(), RoleAuthorityModal(), softwareServices, InstantRideModal(), ICON_NODE_MAP (+38 more)

### Community 2 - "realtimeDatabaseService.js"
Cohesion: 0.09
Nodes (46): RestaurantBooking(), RideSheet(), LocationCard(), CURATED_DESTINATIONS, getPlaceCategoryIcon(), PICKER_CATEGORIES, RiderFindingView(), VEHICLE_TIERS (+38 more)

### Community 3 - "AdminDashboardPage.jsx"
Cohesion: 0.10
Nodes (48): ADMIN_EMAILS, ADMIN_PASSCODE, AdminDashboardPage(), formatRelativeTime(), ADMIN_EMAILS, ADMIN_PASSCODE, AdminPanel(), formatChatMessage() (+40 more)

### Community 4 - "Confetti.jsx"
Cohesion: 0.07
Nodes (21): DEFAULT_ADDONS, PackageReservationModal(), PICKUP_SUGGESTIONS, AnimatedCheckbox(), AnimatedCheckCircle(), AnimatedRadioButton(), AnimatedIcon(), ANIMATION_MAP (+13 more)

### Community 5 - "firebase.js"
Cohesion: 0.09
Nodes (27): DriversPanel(), AGENCY_TOURS, AGENCY_TYPES, AgencyLandingPage(), FLEET_SIZES, OPERATING_ZONES, DriverLandingPage(), EXPERIENCE_OPTIONS (+19 more)

### Community 6 - "rideService.js"
Cohesion: 0.20
Nodes (24): HotelBooking(), DriverPortalModal(), DriverPortalTab(), UserProfileModal(), cancelUserBooking(), createBookingRequest(), getLocalUserBookings(), saveLocalUserBooking() (+16 more)

### Community 7 - "supabase.js"
Cohesion: 0.23
Nodes (15): AgencyPortalTab(), HotelPortalTab(), DEFAULT_INITIAL_PARTNERS, OperationsAdminTab(), useDebounce(), ADMIN_EMAILS, normalizeRole(), PartnerHubModal() (+7 more)

### Community 8 - "dependencies"
Cohesion: 0.15
Nodes (13): @capacitor/android, @heroicons/react, lottie-web, morphicons, dependencies, @capacitor/android, @heroicons/react, lottie-web (+5 more)

### Community 9 - "package.json"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, preview, type, version

### Community 10 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, @types/leaflet, vite, vite-plugin-compression, @vitejs/plugin-react, @types/leaflet, vite, vite-plugin-compression (+1 more)

### Community 11 - "Brij Yatra — Vrinda Vihar (React Architecture & Guide)"
Cohesion: 0.25
Nodes (7): Brij Yatra — Vrinda Vihar (React Architecture & Guide), ⚡ Central Bridge & God Nodes, 🗺️ Codebase Architecture & Graphify Knowledge Graph, 📊 Community Modules (Graphify Communities), 🚀 Development & Build Commands, 🛠️ Navigating the Graphify Knowledge Graph, 🏛️ Project Overview & Key Features

### Community 12 - "Project Agent Guidelines & Engineering Standards"
Cohesion: 0.29
Nodes (6): 1. UI/UX & Design Philosophy, 2. Gesture Physics & Modal Architecture, 3. Performance & Device Compatibility, Always do, Project Agent Guidelines & Engineering Standards, Work Like

### Community 13 - "ExampleInstrumentedTest.java"
Cohesion: 0.60
Nodes (3): ExampleInstrumentedTest, Test, RunWith

### Community 15 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

## Knowledge Gaps
- **105 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+100 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase` connect `supabase.js` to `PartnerLandingPage.jsx`, `realtimeDatabaseService.js`, `AdminDashboardPage.jsx`, `firebase.js`, `rideService.js`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `firestore` connect `firebase.js` to `App.jsx`, `PartnerLandingPage.jsx`, `AdminDashboardPage.jsx`, `rideService.js`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `safeRemoveChannel()` connect `supabase.js` to `AdminDashboardPage.jsx`, `rideService.js`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _105 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05472636815920398 - nodes in this community are weakly interconnected._
- **Should `PartnerLandingPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05952380952380952 - nodes in this community are weakly interconnected._
- **Should `realtimeDatabaseService.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09234972677595628 - nodes in this community are weakly interconnected._