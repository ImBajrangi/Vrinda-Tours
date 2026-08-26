# Project Agent Guidelines & Engineering Standards

## 1. UI/UX & Design Philosophy
- **Minimalist & High-Impact**: Avoid visual clutter and decorative noise. Focus on primary user utility.
- **Action Button Hierarchy**: Use 1 prominent full-width primary action button (`flex: 1`, bold high-contrast pill) paired with compact circular or squircle utility action buttons (44px/46px) for secondary tasks (`Directions`, `Share`, `Call`).
- **Zero-Overflow Mobile Metrics**: Never use verbose trailing text in multi-column chip bars. Format metrics as compact icon + value pairs (`16.2 km`, `24 min`, `★ 4.8`) with flexible `flex: 1` width to prevent clipping on small viewports (<380px).
- **Graceful Media Fallbacks**: Always provide themed category avatar fallbacks (`Landmark` for temples, `Sparkles` for tirtha, `BedDouble` for stays, `UtensilsCrossed` for dining) to prevent blank or broken placeholder boxes.

## 2. Gesture Physics & Modal Architecture
- **CSS Custom Property `--drag-y` Rule**: In `useBottomSheetDrag` and all modal / bottom sheet components, always apply drag offsets via `--drag-y` (`transform: translateY(var(--drag-y, 0px))` on mobile, `transform: translate(-50%, calc(-50% + var(--drag-y, 0px)))` on desktop). Never overwrite inline `transform` directly, which destroys base horizontal centering (`translate(-50%, ...)`).
- **Collision-Free Floating Clusters**: Floating UI clusters (Zoom controls, GPS Navigation FAB) must dynamically calculate clearance based on active bottom sheet heights (`.card-visible { bottom: calc(18.5rem + env(safe-area-inset-bottom, 0.5rem)); }`).
- **Z-Index Layer Hierarchy**:
  - Map Canvas: `z-index: 1`
  - Floating Map Controls: `z-index: 900`
  - Header & Explorer Capsule: `z-index: 1000`
  - Location Preview Cards: `z-index: 1100`
  - Booking Sheets & Panels: `z-index: 2000`
  - Overlays & Portals: `z-index: 9000`
  - Toasts: `z-index: 9999`

## 3. Performance & Device Compatibility
- **Hardware Acceleration**: Use GPU-accelerated properties (`transform`, `opacity`) for all transitions. Avoid animating `top`, `bottom`, `width`, or `height`.
- **Geolocation Throttling**: Throttle real-time GPS streaming to update Firestore records only upon moving 15+ meters or every 10+ seconds to conserve battery and avoid excessive writes.
- **Native Browser Dialog Ban**: Replace native browser `window.confirm` and `alert` dialogs with custom styled modal overlays.
- **Build Verification**: Always run and verify `npm run build` with 0 compiler errors before completing any task.

## Work Like
be creative and expert professional designer please

## Always do
Do not use unusual hover translateY like animations please
you are expert UI UX designer and frontend developer


"Store third-party API credentials and Firebase project IDs in environment variables (.env.local / VITE_*) with fallback defaults to ensure seamless environment switching between staging and production."

"Never use hardcoded mock authentication credentials or dummy test users (Google Traveler, etc.) in frontend components; always implement real Firebase Auth SDK methods with environment variables and real-time state listeners."

"Always use subtle, ultra-thin, light outlines and borders (e.g., 1px solid rgba(0, 0, 0, 0.06-0.08) or #e2e8f0) instead of thick, heavy, or dark strokes to maintain a clean, refined, high-end modern aesthetic."

Luxury Editorial Design Standard: "Avoid progress bars, oversized badges, or dashboard-style meters on consumer luxury landing pages. Prefer minimalist capsule buttons with integrated subtle count chips and micro-interactions."

