# Project Research Summary

**Project:** Calm Sounds Mini
**Domain:** React Native ASMR / Relaxation Sounds Mobile App (iOS + Android, Freemium)
**Researched:** 2026-02-18
**Confidence:** MEDIUM

## Executive Summary

Calm Sounds Mini is a focused, freemium relaxation audio app for iOS and Android. The expert approach for this category centers on one non-negotiable requirement: background audio playback must work flawlessly from day one, because the entire product promise — sounds that play while you sleep, focus, or relax — collapses without it. This means the project requires an EAS Development Build from Phase 1 (not Expo Go), with iOS `UIBackgroundModes: audio` and Android foreground service configured before any UI is written. The recommended stack is Expo SDK 54 + expo-av 16 + Zustand + Firebase JS SDK, deliberately choosing battle-tested stability over newer alternatives. expo-audio is the future but not production-ready in SDK 54; stay on expo-av and migrate when Expo 55 stabilizes.

The product's competitive positioning is clear and opinionated: 15–30 curated sounds (not 100+), 1–3 minute clips (not 45-minute sleep tracks), fullscreen immersive mode as the primary UX differentiator, and no ads at any tier. These constraints are not limitations — they are the product strategy. Every feature decision must be filtered through the "max 3 taps" rule and the anti-engagement premise. Features that seem natural (streaks, mixing, social sharing, autoplay queue) actively harm the product identity and must be explicitly refused, not deferred.

The most significant technical risk is security: client-side freemium gating is a catastrophe in disguise. Premium audio URLs must never be returned to non-premium users by the database — Firestore Security Rules enforced server-side, not component-level booleans. A secondary risk is Firebase Storage egress cost: audio files served without caching at modest user counts generate real costs before any revenue. Both risks must be designed out in Phase 1, because retrofitting them after launch is high-cost or impossible.

---

## Key Findings

### Recommended Stack

The stack is Expo-native with Firebase as the backend. Expo SDK 54 (React Native 0.76) with Expo Router 6 for file-based navigation forms the foundation. expo-av 16 handles audio — not the newer expo-audio 1.x (too immature for production in SDK 54) and not react-native-track-player (designed for OS media sessions with lock screen controls, which is overkill for single-sound looping). Zustand 5 manages global state; its flat store model maps cleanly onto audio playback state, favorites, auth, and UI state without Redux boilerplate. Firebase JS SDK 12.9 covers Auth, Firestore, Storage, and Analytics with zero native modules — no ejecting required. RevenueCat (react-native-purchases 9.10) handles subscriptions because manual receipt validation is an error-prone re-implementation of what RevenueCat provides out of the box.

The entire stack requires Development Builds, not Expo Go. Background audio (UIBackgroundModes), react-native-mmkv, and react-native-purchases are all native modules. This is not a choice — it is a hard constraint. Build the EAS Development Build workflow in the first sprint.

**Core technologies:**
- Expo SDK 54 + React Native 0.76: Build/runtime framework — managed workflow avoids native complexity for this scope
- expo-av 16.0.x: Audio playback — stable, battle-tested, supports background audio; expo-audio 1.x is the future but not production-ready in SDK 54
- Expo Router 6.0.x: File-based navigation — Expo standard for greenfield SDK 54 projects
- Zustand 5.0.x: Global state — minimal boilerplate, flat store maps cleanly to audio/favorites/auth domains
- Firebase JS SDK 12.9.x: Backend (Auth + Firestore + Storage + Analytics) — pure JS, no ejecting, tree-shakeable
- react-native-purchases 9.10.x (RevenueCat): Subscriptions — handles receipt validation, entitlement checks, subscription edge cases
- react-native-reanimated 4.2.x: Animations — required for the smooth 150-250ms transitions the PRD specifies
- NativeWind 4.2.x: Styling — optional; pure StyleSheet with theme.ts constants is a valid alternative

### Expected Features

The category has well-established table stakes. Missing any of them makes the product feel broken. The differentiators are where Calm Sounds Mini creates distance from competitors.

**Must have (table stakes):**
- Background audio playback — without this the entire product is broken; screen lock = audio stops is a fatal flaw
- Auto-play on sound selection — tap = immediate sound; requiring a separate Play button breaks the calm flow
- Loop mode — ASMR sessions exceed clip length; no loop = sound stops mid-session
- Session timer (1/2/3 min + infinite) — users don't want to manually stop; required for sleep and focus use cases
- Favorites (local storage) — repeat users return to the same 2-3 sounds; no save = forced re-discovery
- Dark mode — used at night for sleep; bright UI is actively hostile to this use case
- In-app volume control — context-switching users need in-app volume independent of device volume
- Freemium gating (5 free sounds, rest premium) — validates monetization model; data model must be built from day 1

**Should have (competitive):**
- Fullscreen immersive mode — the primary differentiator; no competitor offers true fullscreen-only audio experience
- Ultra-short format (1-3 min clips) — visible in UI ("2 min rain shower"); snackability is the product positioning
- Do Not Disturb in-app toggle — no competitor does this; eliminates a multi-step OS flow that breaks the calm
- Max 3-tap rule (design constraint as feature) — marketable, verifiable, sustains trust with the target audience
- Optional auth with local-first favorites — no competitor offers anonymous local storage with optional sync; reduces onboarding friction
- Audio fade in/out — abrupt start/stop jars users; 1-2s fade-in and 2-3s fade-out must be built from day 1

**Defer (v2+):**
- Widget (iOS/Android home screen) — high value for retention but high implementation cost; defer until PMF
- Auth + favorites sync (Firebase) — add when users report "I lost my favorites" across devices; local is sufficient for v1
- CarPlay / Android Auto — niche use case; valid but not MVP
- Personal usage stats — one lifetime-minutes counter maximum; no charts, no dashboard
- Sound library expansion to 30 — ship with 15, expand based on which categories are favorited most

**Anti-features to explicitly refuse:**
- Sound mixing/layering — different product; undermines the simplicity positioning
- Streaks/gamification — creates anxiety when broken; directly contradicts the product promise
- Push notifications — an app promising calm should not interrupt users
- Autoplay queue / continuous playlist — undermines intentional micro-session model
- Social features — performance anxiety; unnecessary complexity

### Architecture Approach

The architecture is a layered services pattern: UI screens interact only with React hooks, hooks call singleton services, services call native APIs and Firebase. Zustand stores are the source of truth for UI state — audio playback state, favorites, auth, and UI flags each have their own store. The critical pattern is the Audio Service Singleton: one global Sound object managed by AudioService, preventing multiple simultaneous instances, memory leaks, and audio overlap. Favorites use an adapter pattern (LocalFavoritesAdapter for anonymous users, CloudFavoritesAdapter for authenticated) with a merge migration on login. The Freemium gate is a PremiumGate wrapper component that reads from authStore, so premium checks are centralized and never scattered across screens.

Sound catalog is static in `config/sounds.ts` for MVP — no Firestore round-trip on startup, offline-ready from day 1. Audio files are served from Firebase Storage URLs resolved at play-time, with local caching via expo-file-system after first play.

**Major components:**
1. Audio Service (singleton) — manages the one active Sound object; prevents conflicts, memory leaks, and audio overlap
2. Timer Service — JS countdown with 1s intervals; stop signal driven by audio object's onPlaybackStatusUpdate callback
3. Favorites Service (adapter pattern) — delegates to LocalFavoritesAdapter (AsyncStorage) or CloudFavoritesAdapter (Firestore) based on auth state; merges on login
4. Auth & Access Service — Firebase Auth state, premium tier lookup from Firestore user document
5. Zustand stores (audioStore, favoritesStore, authStore, uiStore) — source of truth for all UI state; services mutate stores directly
6. PremiumGate component — wrapper that checks authStore.isPremium; lock overlay vs real content; premium logic never in screens

### Critical Pitfalls

1. **iOS silent mode not configured** — `playsInSilentModeIOS: true` must be set in `Audio.setAudioModeAsync()` at app startup. This is not the default. Omitting it causes audio to stop when the device silent switch is engaged — the exact scenario when users most want this app. Set once at root layout startup, not per-sound. Recovery is an EAS Update (JS-only), but it means shipping broken audio.

2. **Background audio missing `UIBackgroundModes`** — `staysActiveInBackground: true` in setAudioModeAsync has no effect on iOS without `UIBackgroundModes: ["audio"]` in app.json. This requires an EAS Build, not an OTA update. Missing it means a 1-7 day App Store review cycle to fix a core feature. Must be in Phase 1, not discovered post-launch. Android requires a foreground service notification while playing (Android API 26+) — design for this notification from the start.

3. **Client-side freemium gating** — premium audio URLs stored in publicly-readable Firestore are trivially accessible to any user with network inspection. Premium content protection must be enforced in Firestore Security Rules (restrict `url` field to users with `isPremium: true` in their user document), not in React Native component logic. A signed URL approach via Cloud Function is even stronger. Recovery cost is HIGH: data already leaked cannot be recalled.

4. **Firebase Storage egress costs without caching** — at 1,000 DAU with 3 sounds/day at ~4 MB each: ~360 GB/month egress at ~$43/month before any revenue. Fix: (a) compress audio to 64-96 kbps OGG/AAC, targeting 1-2 MB per file maximum; (b) cache downloaded files via expo-file-system after first play; (c) bundle the 5-8 most popular free sounds directly in the app binary. This decision must be made before content creation begins.

5. **Memory leak from unmanaged Sound objects** — every `Audio.Sound.createAsync()` creates a native resource. Rapid sound switching without `unloadAsync()` causes progressive memory growth and audio glitches after 20+ minutes. The singleton pattern (one global Sound, always unload before loading new) prevents this. This is architectural — establishing it late means a rewrite, not a patch.

6. **Anonymous-to-authenticated favorites migration failure** — local favorites saved pre-login are lost if migration isn't explicitly implemented. Firebase Anonymous Auth + `linkWithCredential()` preserves the UID and Firestore data. If using pure local storage pre-login, a one-time migration function must run on first successful login. Design the migration path before writing any favorites storage code.

---

## Implications for Roadmap

Based on research, the architecture's build order dependency chain maps naturally to phases. The critical path is: audio engine first, then UI, then immersive mode, then favorites, then auth+sync, then monetization, then polish.

### Phase 0: Content Sourcing and Project Foundation
**Rationale:** Audio file licensing is a non-technical dependency that must be resolved before any playback code is written. Copyright infringement discovered post-launch is the highest-severity unrecoverable pitfall. Simultaneously, EAS Build infrastructure must be established from day 1 — the entire stack requires Development Builds.
**Delivers:** Licensed audio files with documented provenance (AUDIO_CREDITS.md), EAS project setup, Expo SDK 54 project with TypeScript, Expo Router, Zustand, Firebase initialized, app.json with UIBackgroundModes configured, ESLint/Prettier configured.
**Addresses:** Audio licensing, build infrastructure, background audio configuration
**Avoids:** Copyright infringement pitfall, late EAS Build migration pain, UIBackgroundModes omission

### Phase 1: Audio Playback Foundation
**Rationale:** Audio is the critical path. Every other feature — timer, immersive mode, favorites, freemium — depends on audio working correctly in all contexts (foreground, background, screen lock, iOS silent mode). This phase must be complete and verified on real devices before building any UI on top of it.
**Delivers:** AudioService singleton with play/pause/stop/loop, Audio.setAudioModeAsync configured (playsInSilentModeIOS, staysActiveInBackground), background audio verified on real iOS and Android devices, audio fade in/out utility, local caching via expo-file-system, audio files compressed to target bitrate, static sound catalog in config/sounds.ts.
**Uses:** expo-av 16, expo-keep-awake, expo-file-system, Zustand audioStore
**Avoids:** Pitfalls 1 (silent mode), 2 (background audio), 4 (egress costs), 5 (memory leak)
**Research flag:** Standard patterns — expo-av background audio config is well-documented. No additional research needed.

### Phase 2: Core UI Screens
**Rationale:** With audio verified, build the UI layer. Sound Library (home), Player, and basic navigation are the minimum viable product shell. Fullscreen immersive mode is included here, not deferred — it is the primary differentiator and building it while the codebase is small avoids integration complexity later.
**Delivers:** Sound Library screen (FlatList with SoundCard, categories), Player screen with controls (play/pause/loop toggle/volume slider/timer), Fullscreen Immersive Mode (status bar hidden, keep-awake, fade transitions), dark mode (system-follow), session timer (1/2/3 min + infinite), auto-play on tap.
**Uses:** expo-router, react-native-reanimated, expo-status-bar, expo-linear-gradient, expo-blur, NativeWind or StyleSheet
**Avoids:** UX pitfall (timer countdown visible and prominent — show subtly or hidden by default)
**Research flag:** Standard patterns. Animation and immersive mode are well-documented Expo patterns.

### Phase 3: Favorites and Local Persistence
**Rationale:** Favorites are independent of auth (local-first) and can ship before any Firebase user features. This simplifies Phase 3 and allows testing the favorites UX without backend complexity. The adapter pattern must be established here so Phase 4's auth addition is additive, not disruptive.
**Delivers:** LocalFavoritesAdapter (AsyncStorage), FavoritesService with adapter interface, FavoriteButton component, Favorites screen, favoritesStore (Zustand), favorite state persists across app restarts.
**Uses:** @react-native-async-storage/async-storage, Zustand favoritesStore
**Avoids:** Anti-pattern (forcing login before value delivery)
**Research flag:** Standard patterns. AsyncStorage + Zustand adapter is well-established.

### Phase 4: Authentication and Cloud Sync
**Rationale:** Auth is additive to a working app, not foundational. Shipping auth after local favorites are proven means the migration path is tested against real local data. Firebase Security Rules must be established in this phase — before any premium content is uploaded.
**Delivers:** Firebase Auth (email/password + optional anonymous auth), CloudFavoritesAdapter (Firestore), FavoritesService.migrateLocalToCloud() with deduplication, authStore (Zustand), Firestore Security Rules (favorites subcollection, user document access), Firestore offline persistence enabled.
**Uses:** Firebase JS SDK, Firebase Auth with AsyncStorage persistence, Firestore
**Avoids:** Pitfall 6 (anonymous favorites migration), security mistake (public Firestore rules), anti-pattern (login wall before value)
**Research flag:** Needs deeper research on Firebase Anonymous Auth + linkWithCredential() migration path. The merge logic has edge cases.

### Phase 5: Freemium Access and Monetization
**Rationale:** Freemium gating requires the auth system (Phase 4) to be complete — isPremium lives in the Firestore user document. Security rules restricting premium URL access must be implemented here with zero shortcuts.
**Delivers:** AccessService with Firestore Security Rules enforcing premium gating server-side, PremiumGate wrapper component, RevenueCat integration (react-native-purchases), paywall screen (shown in sound library context, never during playback), free/premium sound data model finalized, 5 free / 10+ premium sound split.
**Uses:** react-native-purchases (RevenueCat), Firestore Security Rules
**Avoids:** Pitfall 3 (client-side freemium gating catastrophe), UX pitfall (paywall shown during immersive mode)
**Research flag:** Needs phase-specific research on RevenueCat + Expo SDK 54 integration — App Store / Play Store sandbox testing environment setup is nuanced.

### Phase 6: Polish, Analytics, and Launch Readiness
**Rationale:** Final phase closes all "looks done but isn't" items before submission. Do Not Disturb toggle is included here (not MVP) because it requires OS-level permissions and platform-specific APIs that are complex enough to risk destabilizing the core experience if introduced earlier.
**Delivers:** Firebase Analytics (logEvent wrappers for playback start, favorite, timer, immersive), Do Not Disturb toggle (in-session only, permission requested in context), final WCAG AA contrast audit for dark mode, memory profiling (Xcode Instruments — 15 min session, zero growth), Android foreground service notification validated, Expo OTA update flow tested, TestFlight beta, Play Store internal testing.
**Uses:** Firebase Analytics, expo-haptics (selective — not routine navigation), expo-system-ui
**Avoids:** Performance trap (dynamic backgrounds during playback), UX pitfall (haptic feedback on every interaction), dark mode contrast failures
**Research flag:** Do Not Disturb needs phase-specific research — iOS Focus API and Android NotificationManager differ significantly; implementation approach is LOW confidence from current research.

### Phase Ordering Rationale

- **Foundation before UI** because background audio config requires EAS Build (native), which cannot be added via OTA. Discovering this mid-project causes a build/review cycle delay.
- **Audio before screens** because every screen depends on audio working. Testing audio in isolation before wrapping it in UI surfaces bugs in the right layer.
- **Favorites before auth** because local favorites can be shipped and validated without Firebase. This keeps Phase 3 independent and testable; auth migration is additive in Phase 4.
- **Auth before monetization** because isPremium status is stored in the Firestore user document. Freemium gating without auth is either client-side (insecure) or impossible.
- **Monetization before analytics/polish** because RevenueCat integration sometimes surfaces App Store configuration issues early — better to discover these before the final submission sprint.
- **Do Not Disturb in Phase 6** because it requires OS permissions and platform-divergent APIs (LOW confidence). Introducing it earlier risks destabilizing core audio behavior.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Auth + Cloud Sync):** Firebase Anonymous Auth + `linkWithCredential()` migration path. Merge-on-login logic has real edge cases (concurrent writes, duplicate favorites, partial migration on network failure). Needs dedicated research before phase planning.
- **Phase 5 (Freemium/Monetization):** RevenueCat sandbox testing in EAS Development Build environment. App Store Connect and Play Console sandbox account setup is step-by-step and version-specific. Needs research before implementation.
- **Phase 6 (Do Not Disturb):** iOS Focus API vs standard DND vs older iOS versions; Android `NotificationManager.INTERRUPTION_FILTER_ALL` behavior across OEM variants. Current research is LOW confidence on implementation specifics.

Phases with standard, well-documented patterns (skip research-phase):
- **Phase 0:** EAS project setup is standard Expo documentation.
- **Phase 1:** expo-av background audio config is one of the most documented patterns in the Expo ecosystem.
- **Phase 2:** Expo Router screens, Reanimated animations, and immersive mode patterns are well-documented.
- **Phase 3:** AsyncStorage adapter + Zustand is a straightforward, established pattern.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | npm registry versions verified for all packages (2026-02-18). expo-av vs expo-audio decision is MEDIUM — expo-audio maturity confirmed at 1.1.1 with SDK 55 forward path. RevenueCat + Expo 54 compatibility confirmed but sandbox setup specifics not validated. |
| Features | MEDIUM | Competitor analysis based on training data (August 2025). Live app store verification unavailable. Risk: Calm or White Noise may have added in-app DND or 1-3 min clips since August 2025 — verify before marketing differentiation claims. |
| Architecture | MEDIUM-HIGH | Audio Service singleton, Favorites adapter, Zustand stores are well-established patterns. Background audio config (UIBackgroundModes) is high-confidence (widely documented). Firebase Storage URL → expo-av streaming is MEDIUM (test explicitly for streaming vs download behavior). |
| Pitfalls | MEDIUM | iOS silent mode and background audio pitfalls are high-confidence (widely documented). Firebase egress pricing is LOW confidence — verify current pricing before build phase. DND API platform differences are LOW confidence — needs phase-specific research. |

**Overall confidence:** MEDIUM

### Gaps to Address

- **expo-audio migration status in SDK 55:** Verify expo-audio stability when Expo 55 releases. The migration from expo-av is straightforward but should be planned.
- **Firebase Storage egress pricing:** Verify current pricing at firebase.google.com/pricing before build. The $0.12/GB estimate may be outdated.
- **Competitor differentiation:** Verify that no major competitor has shipped in-app DND toggle or 1-3 min clip format since August 2025. These are the primary differentiation claims.
- **RevenueCat + EAS Development Build setup:** Phase-specific research needed on App Store Connect sandbox and Play Console testing accounts before Phase 5 planning.
- **iOS Focus API vs DND:** Low-confidence area. Needs research before Phase 6 planning to determine whether the in-app DND toggle is feasible within the Expo managed workflow or requires native module work.
- **Android foreground service notification design:** The persistent "playing" notification on Android is a UX touchpoint that needs design decisions before Phase 1 audio work begins. It is mandatory (Android API 26+), not optional.

---

## Sources

### Primary (HIGH confidence)
- npm registry (verified 2026-02-18) — expo@54.0.33, expo-av@16.0.8, expo-audio@1.1.1, expo-router@6.0.23, zustand@5.0.11, firebase@12.9.0, react-native-purchases@9.10.1, react-native-reanimated@4.2.2, NativeWind@4.2.1, react-native-mmkv@4.1.2
- expo-av documentation (training data): iOS `playsInSilentModeIOS`, `staysActiveInBackground`, `Audio.setAudioModeAsync()` — widely verified pattern
- iOS UIBackgroundModes requirement: Expo managed workflow documentation — confirmed requirement for background audio

### Secondary (MEDIUM confidence)
- CalmSoundsMini_PRD_Completo.md (January 2026) — product requirements, user personas, design constraints
- Expo Audio Mode docs (training data, August 2025): AppState lifecycle, audio session management
- Firebase SDK v9+ modular API patterns — Zustand v5 store patterns
- Expo Router v6 file-based routing structure
- Firestore Security Rules for premium gating — Firebase Authentication documentation patterns
- React Native App Store category analysis: Calm, Headspace, White Noise Lite, Noisli, myNoise, Endel, Rain Rain (training data through August 2025)

### Tertiary (LOW confidence)
- Firebase Storage egress pricing ($0.12/GB) — verify at firebase.google.com/pricing before build phase
- iOS Focus API / Android DND API behavior — needs phase-specific research before Phase 6 planning
- Competitor feature state post-August 2025 — live verification required before marketing differentiation claims

---
*Research completed: 2026-02-18*
*Ready for roadmap: yes*
