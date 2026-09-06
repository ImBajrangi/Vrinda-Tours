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

be less eleborated but impactfull everywhere

expand or hide and show should be bouncie and morphing please
suddenness looks unprofessional and unpolished like linear(0, 0.0114, 0.0427, 0.0898, 0.149, 0.2169, 0.2906, 0.3673, 0.445, 0.5216, 0.5958, 0.6663, 0.7321, 0.7926, 0.8474, 0.8962, 0.9389, 0.9758, 1.0069, 1.0325, 1.053, 1.0689, 1.0805, 1.0884, 1.093, 1.0947, 1.0941, 1.0915, 1.0873, 1.0819, 1.0756, 1.0687, 1.0614, 1.0541, 1.0468, 1.0397, 1.0329, 1.0266, 1.0208, 1.0155, 1.0107, 1.0066, 1.003, 0.9999, 0.9974, 0.9953, 0.9937, 0.9926, 0.9917, 0.9913, 0.991, 0.9911, 0.9913, 0.9916, 0.9921, 0.9927, 0.9934, 0.994, 0.9947, 0.9954, 0.9961, 0.9968, 0.9974, 0.9979, 0.9984, 0.9989, 0.9993, 0.9997, 1, 1.0002, 1.0004, 1.0006, 1.0007, 1.0008, 1.0008, 1.0008, 1.0008, 1.0008, 1.0008, 1.0008, 1.0007, 1.0006, 1.0006, 1.0005, 1.0004, 1.0004, 1.0003, 1.0003, 1.0002, 1.0002, 1.0001, 1.0001, 1, 1, 1, 1, 0.9999, 0.9999, 0.9999, 0.9999, 1)

[RULE: Layout-First Morphing]:

All dynamic UI panels (drawers, sheets, pills) must default to CSS Grid 0fr ➔ 1fr spring interpolation rather than instant unmounting to guarantee fluid transitions on every mobile viewport.
[RULE: Defensive Micro-Typography]:

Text elements must always have explicit truncation fallbacks (min-width: 0, overflow: hidden, text-overflow: ellipsis, and sensible line wrapping) so no label ever clips awkwardly on small screens.
[RULE: Strict Battery & GPU Guard]:

Pause or throttle continuous SVG dash/spin animations when navigation is idle or cards are hidden to conserve battery on mobile devices.

bars like nav-hud-card their hiding and showing should not be instant or flickked feel
they show be visible with suttle animations
of ease in/out, and it should feel like morphing smoothly without any instant appearance or disappearance.

like there should be no suddenness.

try to use less hardcoded and more dynamic approach for things
not only that but make it more responsive and optimized for mobile and desktop both.

you can even use css variables to make it more dynamic and optimized.

Auto-SEO Verification Rule:

"Whenever new public landing pages or routes are introduced, automatically generate corresponding Schema.org JSON-LD snippets and append the URL to sitemap.xml."

Asset Compression & WebP Rule:

"All images used for thumbnails or cards should have lazy-loading attributes (loading='lazy') and explicit width/height dimensions to guarantee 100/100 Google Core Web Vitals (LCP & CLS)."

For single-page applications with custom scroll containers (.dmd-main-body), always implement programmatic anchor scrolling listeners (hashchange & window.location.hash) so deep section links like #faq scroll reliably on page load and link clicks

When creating administrative and internal portals, always render them as standalone full-page views rather than modal overlays for better data density and mobile accessibility.
Ensure all administrative dashboards include a dedicated 'View Live Website' quick action in the sidebar.

Avoid using system emojis for core product iconography; use crisp, branded SVG vector illustrations for a luxury SaaS/app feel

Limit vehicle and item cards to a maximum of 2 clean information hierarchy lines to prevent cognitive overload.

use supabase database properly professionally 
because we have to handle it in real world

[RULE: Floating Capsule & Modal/Overlay Collision Prevention]:
1. **Zero Bottom Sheet Collision**: Persistent floating UI elements (such as live ride tracking capsules, help launchers, HUD strips, and FABs) must NEVER overlay or collide with active bottom sheets, modal cards, checkout drawers, or primary action buttons.
2. **Adaptive Dynamic Island Top Docking**: Whenever any bottom sheet, preview modal, or drawer is active (`isAnyModalActive`), floating live capsules must smoothly morph and dock to the top Dynamic Island zone (`.vt-floating-live-ride-pill.docked-top` with `top: calc(14px + env(safe-area-inset-top, 0px)); z-index: 10005;`) rather than unmounting or occluding bottom interaction controls.
3. **Fluid Spring Transitions**: Transitions between bottom-floating and top-docked modes must use hardware-accelerated spring curves (`cubic-bezier(0.34, 1.35, 0.64, 1)`) with smooth opacity, padding, and transform interpolation to ensure 60fps/120fps performance across all mobile tiers without flickering or popping.
4. **Adaptive Micro-Hierarchy & Radar Pulses**: Docked mini capsules must display single-row compact status with live radar pulses (`.vt-flr-radar-ring`), glowing status beacons, and interactive touch targets (minimum 40px touch zone) for seamless 1-tap full modal expansion.

[RULE: Professional Luxury Toast Architecture]:
1. **Zero System Emojis**: Always use crisp, branded SVG vector illustrations (`Crown`, `ShieldCheck`, `Car`, `BedDouble`, `UtensilsCrossed`, `Compass`, `Sparkles`) inside role-tinted neon glass containers rather than system emojis.
2. **Horizontal Luxury Glass Pill Layout**: Design toasts as compact single/dual-line floating obsidian glass capsules with `backdrop-filter: blur(24px)`, subtle borders (`1px solid rgba(255,255,255,0.16)`), and integrated pill CTA buttons (`Open Workspace →`) instead of bulky stacked action blocks.
3. **Auto-Dismiss & Progress Animation**: All dynamic toasts must include an auto-dismiss timer (5.5s) with a delicate animated gradient progress line at the bottom that pauses on hover.
4. **Spring Physics & Collision Clearance**: Toasts must mount with smooth spring curves (`cubic-bezier(0.34, 1.35, 0.64, 1)`) and automatically suppress or dock to clear active modals and primary bottom action sheets.

the more the text the less it looks good to use

[RULE: Rich Dropdown & Luxury Popover Menu Architecture]:
1. **Rich Select Dropdowns (Trigger & Card Options)**:
   - Double-chevron indicators (`ChevronsUpDown`) with subtle focus-ring glow on open.
   - Floating options container with rounded cards (`border-radius: 18px-22px`), backdrop blur, and smooth spring entry (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Rich option items featuring title, concise descriptive subtitle (`0.75rem`, muted), and inline custom badges (e.g., `✨ AI Assistant`, `Active`, `Recommended`).
2. **Luxury Popover Menus**:
   - Dark Obsidian Glass styling (`rgba(24, 24, 27, 0.96)` or crisp light glass), 20px rounded corners, and delicate inner border (`1px solid rgba(255, 255, 255, 0.1)`).
   - Crisp SVG icon containers (26px squircle) paired with left-aligned label and right-aligned secondary details/chevrons (e.g. `Devotee Tier` → `Free / Active`, `Refer & Earn` → `+500 Pts`).
   - Clean micro-dividers and separated danger actions (e.g., `Logout` in soft rose red).
3. **Accessibility & Responsive Defense**:
   - Full keyboard navigation (`Enter`, `Space`, `Escape`) and outside-click auto-dismiss.
   - Flexible viewports (`max-width: calc(100vw - 24px)`) with auto-clamp positioning.

Never use fallback role strings to deduce authentication state; always require a non-preview, persisted session ID to prevent merchant UI leakage to public visitors

- For all toast, notification bar, and modal transitions, always enforce two-phase exit animations with hardware-accelerated transforms (`transform`, `opacity`, `filter`) using Apple HIG cubic-bezier spring easing before unmounting from state.

For in-progress search or requesting screens, never display provisional driver personal identities (faces, names, distance pills) before an actual ride confirmation. Use anonymous, minimalist radar pings or sonar sweeps to maintain visual clarity and avoid UI overlap

Rule: Global Feedback Consistency: “All global feedback mechanisms (toasts, alerts, confirmation badges) must originate from a centralized provider using standardized capsule design tokens rather than ad-hoc local elements.”

Rule: Gesture-First Micro-Interactions: “Ensure transient UI components (toasts, bottom sheets, snackbars) support native touch gestures such as swipe-to-dismiss and tap-outside cancellation.”

For Apple-style dynamic capsules and interactive pills, keep hover states strictly static (no scale/offset shifts) while preserving tactile :active spring-press shrink and release expansion (scale(0.96) with cubic-bezier physics).

