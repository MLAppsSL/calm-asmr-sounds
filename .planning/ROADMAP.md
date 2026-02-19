# Roadmap: Calm Sounds Mini

## Overview

Seven phases build the app from the ground up, following the critical path that the technical research established. Phase 1 resolves the hard native dependency (EAS Build with UIBackgroundModes) before any code is written — this cannot be patched via OTA once skipped. Phase 2 isolates and verifies the audio engine on real devices before any UI is layered on top. Phase 3 assembles the full visible app shell. Phase 4 adds local-first favorites. Phase 5 introduces authentication as an additive enhancement, then runs the anonymous-to-cloud migration. Phase 6 completes the freemium model with server-side gating and RevenueCat. Phase 7 closes out Do Not Disturb, analytics, and submission readiness.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - EAS project scaffold with native background audio configured
- [ ] **Phase 2: Audio Engine** - Audio playback verified end-to-end on real devices
- [ ] **Phase 3: Core UI** - Full visible app shell with library, player, immersive mode, and onboarding
- [ ] **Phase 4: Favorites** - Local-first favorites with persistence across app restarts
- [ ] **Phase 5: Auth and Cloud Sync** - Optional email auth with anonymous-to-cloud favorites migration
- [ ] **Phase 6: Freemium and Monetization** - Server-side premium gating with RevenueCat paywall
- [ ] **Phase 7: Polish, DND, and Analytics** - Do Not Disturb toggle, Firebase Analytics, and launch readiness

## Phase Details

### Phase 1: Foundation
**Goal**: The project has a working EAS Development Build with background audio natively configured — before any product code is written
**Depends on**: Nothing (first phase)
**Requirements**: (none mapped — this phase is a non-negotiable infrastructure precondition; all other requirements depend on it)
**Success Criteria** (what must be TRUE):
  1. `eas build` produces an installable Development Build for both iOS and Android with no manual native changes
  2. `UIBackgroundModes: ["audio"]` is present in app.json and visible in the built app's Info.plist
  3. The app runs without errors on a real iOS device and a real Android device (Expo Go is NOT used anywhere)
  4. Firebase project is initialized and the app connects to Auth, Firestore, and Storage without errors
  5. ESLint, Prettier, TypeScript strict, and Expo Router file-based routing are functional
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Install dependencies, configure app.json (UIBackgroundModes + all plugins), eas.json, TypeScript + ESLint + Prettier toolchain, lint-staged + Husky, .env.example
- [ ] 01-02-PLAN.md — Firebase project setup (human checkpoint for config files), src/lib/firebase.ts RNFB service module
- [ ] 01-03-PLAN.md — Full Expo Router route skeleton (11 route files) and 4 Zustand stores (audioStore, authStore, favoritesStore, uiStore) + shared types
- [ ] 01-04-PLAN.md — EAS Development Build trigger (iOS + Android), install on real devices, verify app launches and Firebase connects without errors (phase gate)

### Phase 2: Audio Engine
**Goal**: Users can tap a sound and hear it play — including when the screen is locked or the app is backgrounded — with loop, timer, and fade behavior verified on real devices
**Depends on**: Phase 1
**Requirements**: AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04
**Success Criteria** (what must be TRUE):
  1. Tapping a sound card starts audio immediately with no extra step (auto-play)
  2. Audio continues playing when the screen locks on a real iOS device (silent switch ON, screen off)
  3. Audio continues playing when the user switches to another app on Android
  4. Loop mode plays the sound on repeat until the user manually stops it
  5. The timer (1, 2, or 3 minutes) stops audio automatically when it reaches zero
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — expo-audio install, AudioService singleton with setAudioModeAsync background config, crossfade (700ms), toggle-off instant stop
- [ ] 02-02-PLAN.md — Static sound catalog (src/config/sounds.ts), SoundCacheService: Firebase Storage URL resolution + permanent local cache via expo-file-system/legacy documentDirectory
- [ ] 02-03-PLAN.md — audioStore timer timestamp fields (timerStartedAt/timerDurationMs), TimerService with AppState-aware countdown and fade-then-stop, app/_layout.tsx wiring + real-device verification checkpoint

### Phase 3: Core UI
**Goal**: The app is fully navigable — users can browse sounds, play them, enter fullscreen immersive mode, see category backgrounds, and configure dark mode — in under 3 taps from launch
**Depends on**: Phase 2
**Requirements**: LIB-01, LIB-02, LIB-03, VIS-01, VIS-02, SET-01, ONBRD-01
**Success Criteria** (what must be TRUE):
  1. First-time users see the onboarding screen ("Toca un sonido. Respira.") before entering the library
  2. The library shows 15+ sounds organized by category with clip duration and free/premium labels visible on each card
  3. User can filter the library by category in one tap
  4. Tapping a sound enters the Player screen; tapping the fullscreen button hides all UI and shows only the ambient video background and audio
  5. Each sound category shows its corresponding ambient video loop as the playback background
  6. Dark mode is on by default and can be toggled in Settings
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Install Phase 3 libraries, uiStore, sound manifest (17 sounds), SoundCard + CategorySection components, navigation shell (root Stack, 4-tab frosted bar, library screen)
- [ ] 03-02-PLAN.md — Player screen (ambient video, CircularProgressArc, BottomControlPill) and Fullscreen Immersive Mode (status bar hidden, keep-awake, tap-to-restore)
- [ ] 03-03-PLAN.md — Onboarding 2-screen flow (Welcome + Quiet Mode shell) with AsyncStorage detection, Settings screen with functional dark mode toggle

### Phase 4: Favorites
**Goal**: Users can save sounds as favorites and retrieve them instantly — with no account required — and their favorites survive app restarts
**Depends on**: Phase 3
**Requirements**: FAV-01, FAV-02, SET-02, SET-03
**Success Criteria** (what must be TRUE):
  1. Tapping the star/heart icon on any sound immediately marks it as a favorite (and tapping again removes it)
  2. The Favorites screen shows all saved sounds with no loading delay on open
  3. Favorites are still present after closing and relaunching the app
  4. User can set a default timer duration in Settings that pre-fills for every new session
  5. The Settings screen is reachable in one tap and shows all preference controls
**Plans**: 3 plans

Plans:
- [ ] 04-01-PLAN.md — favoritesStore upgrade (Favorite[] + persist + _hasHydrated), uiStore defaultTimerDuration + system dark mode, LocalFavoritesAdapter
- [ ] 04-02-PLAN.md — FavoriteButton component (spring animation), heart on SoundCard + player, timer pre-fill and coupling
- [ ] 04-03-PLAN.md — Favorites screen (FlatList + illustrated empty state), Settings Session Duration wired to uiStore, phase checkpoint

### Phase 5: Auth and Cloud Sync
**Goal**: Users can optionally create an account to sync favorites across devices — and any favorites saved anonymously are migrated to their account on first login with no data loss
**Depends on**: Phase 4
**Requirements**: AUTH-01, AUTH-02, AUTH-03, FAV-03
**Success Criteria** (what must be TRUE):
  1. All free features remain accessible without creating an account (no forced login)
  2. User can sign up or log in with email via a non-intrusive auth flow
  3. After logging in, favorites saved while anonymous appear in the cloud account (no duplicates, no data lost)
  4. Favorites sync instantly across two devices signed into the same account
  5. Firestore Security Rules block any user from reading another user's favorites or data
**Plans**: 3 plans

Plans:
- [ ] 05-01-PLAN.md — Firebase Auth foundation: initializeAuth + RN persistence, AuthContext, root layout auth+onboarding gate, auth modal screen, Firestore security rules
- [ ] 05-02-PLAN.md — Firestore sync layer: FavoritesService (read/write/migrate), useFavoritesSync hook, wire hook into root layout
- [ ] 05-03-PLAN.md — Auth UI surface: Settings auth section (sign in/out), Favorites sync nudge + cloud indicator, phase checkpoint

### Phase 6: Freemium and Monetization
**Goal**: Premium sounds are locked server-side with no bypass possible — and users who want to unlock them reach a fully functional RevenueCat paywall and can complete a real in-app purchase
**Depends on**: Phase 5
**Requirements**: AUTH-04, LIB-04, AUDIO-05, AUDIO-06
**Success Criteria** (what must be TRUE):
  1. Premium sound URLs are never returned to a non-premium user by Supabase RLS — they cannot be accessed by inspecting network traffic
  2. Premium sounds are visible in the library with a clear lock indicator but cannot be played without a subscription
  3. Tapping a locked sound shows the RevenueCat paywall screen without interrupting any active playback
  4. After completing a purchase, Infinity mode (no time limit) and custom timer duration unlock immediately with no app restart required
  5. The paywall never appears during fullscreen immersive mode
**Plans**: 3 plans

Plans:
- [ ] 06-01-PLAN.md — RevenueCat SDK setup (react-native-purchases), isPremium in authStore, PremiumService + usePremiumStatus hook, Supabase sounds table RLS migration, RevenueCat webhook Edge Function
- [ ] 06-02-PLAN.md — Premium lock indicators (LockBadge, PremiumGate), openPaywall() helper, sound catalog premium flags, paywall entry points in library/favorites/settings, human verification checkpoint
- [ ] 06-03-PLAN.md — Infinity mode (AUDIO-05) and custom timer duration (AUDIO-06) gated behind isPremium in audioStore and player screen

### Phase 7: Polish, DND, and Analytics
**Goal**: The app passes accessibility, performance, and analytics checks — and is submitted to TestFlight and Play Store internal testing
**Depends on**: Phase 6
**Requirements**: VIS-03, ANLX-01
**Success Criteria** (what must be TRUE):
  1. During an active playback session, user can toggle Do Not Disturb in one tap to suppress system notifications
  2. Firebase Analytics logs sound played, favorite saved, loop enabled, timer set, paywall viewed, and subscription purchased events — verifiable in the Firebase console
  3. A 15-minute foreground playback session on iOS shows zero memory growth in Xcode Instruments
  4. All interactive elements meet WCAG AA contrast ratio (minimum 4.5:1) in dark mode
  5. The app build installs on TestFlight (iOS) and Play Store internal testing (Android) with no crashes on launch
**Plans**: TBD

Plans:
- [ ] 07-01: Do Not Disturb toggle (in-session, platform-specific: iOS Focus API / Android NotificationManager)
- [ ] 07-02: Firebase Analytics event logging (logEvent wrappers for all KPI events, ANLX-01)
- [ ] 07-03: Accessibility audit (WCAG AA dark mode contrast), memory profiling (Xcode Instruments), Android foreground service notification validation
- [ ] 07-04: TestFlight beta submission and Play Store internal testing submission

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/4 | Not started | - |
| 2. Audio Engine | 0/3 | Planned | - |
| 3. Core UI | 0/3 | Not started | - |
| 4. Favorites | 0/3 | Not started | - |
| 5. Auth and Cloud Sync | 0/3 | Planned | - |
| 6. Freemium and Monetization | 0/3 | Planned | - |
| 7. Polish, DND, and Analytics | 0/4 | Not started | - |
