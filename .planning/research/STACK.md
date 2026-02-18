# Stack Research

**Domain:** React Native ASMR / Relaxation Sounds Mobile App (iOS + Android)
**Researched:** 2026-02-18
**Confidence:** MEDIUM-HIGH (npm registry verified for versions; expo-audio vs expo-av decision is MEDIUM due to expo-audio being relatively new)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Expo SDK | 54.0.x | Build/runtime framework | Current stable SDK (54); managed workflow avoids native code headaches for this scope. SDK 55 is in preview — stay on 54 for stability. |
| React Native | 0.76.x (bundled with Expo 54) | UI layer | Expo 54 ships RN 0.76. No reason to diverge. |
| TypeScript | 5.x | Type safety | Expo project template ships with TS. Strictly typed audio state prevents runtime bugs. Use `tsconfig strict: true`. |
| expo-av | 16.0.x | Audio playback | See Audio section below for the full expo-av vs expo-audio decision. |
| Expo Router | 6.0.x | File-based navigation | Built into Expo SDK 54; file-system routing eliminates navigation boilerplate. Correct choice for greenfield Expo projects in 2025/2026. |
| Zustand | 5.0.x | Global state management | Minimal boilerplate, no providers needed, perfect for small-to-medium app. Playback state, favorites, and user preferences fit naturally into Zustand stores. |
| Firebase JS SDK | 12.9.x | Backend (Auth + Firestore + Storage + Analytics) | Pure JS, no native modules, works in Expo managed workflow without ejecting. See Firebase section below. |
| NativeWind | 4.2.x | Styling | Tailwind CSS for React Native. Eliminates StyleSheet boilerplate and keeps styles co-located with components. Stable at v4. Roll-your-own is fine too for this scope — see UI section. |

---

### Audio Playback: expo-av vs expo-audio (Critical Decision)

**Recommendation: Use expo-av 16.0.x for now.**

**Rationale:**

- `expo-audio` (1.1.1) is a newer, purpose-built audio-only module that will eventually replace the audio portion of expo-av. Its `next` dist-tag points to `55.0.6`, indicating it will become a first-class SDK module in Expo 55. At version 1.1.1, it is still maturing.
- `expo-av` (16.0.x) is stable, well-documented, ships with Expo 54 SDK, and supports everything this app needs: file playback, looping, volume control, and background audio mode via `playsInSilentModeIOS`.
- `expo-av` is NOT deprecated — it has an active `canary` tag and is the current production choice.
- **Background audio**: `expo-av` supports background audio on iOS and Android when configured via `expo.ios.infoPlist.UIBackgroundModes: ["audio"]` in `app.json`. This is required for the "play while screen is locked" use case.

**Do NOT use `react-native-track-player` for this app.** RNTP is built for music players that need a native OS media session (lock screen controls, media notification). It does not have an Expo config plugin, adds significant native complexity, and its use case (podcast/music queue management) is overkill for simple single-sound looping. expo-av handles this app's needs entirely.

**Migrate path**: When Expo 55 stabilizes and expo-audio reaches ~3.x, migrate. The APIs are similar and the migration is straightforward.

---

### Firebase: JS SDK vs React Native Firebase

**Recommendation: Firebase JS SDK 12.9.x (not @react-native-firebase).**

**Rationale:**

- Firebase JS SDK is pure JavaScript — no native modules, no ejecting from Expo managed workflow. Works via Expo Go for development.
- `@react-native-firebase` (23.x) requires native module linking and an Expo config plugin. For Auth + Firestore + Storage + Analytics, the JS SDK delivers identical functionality with far less complexity.
- The JS SDK v9+ uses modular/tree-shakeable imports which keep bundle size down.
- **Caveat**: Firebase JS SDK's Firestore has a slightly larger initial load on React Native than on web (no IndexedDB, falls back to in-memory cache). For this app's data volume (15-30 sounds, favorites per user), this is negligible.
- **Auth persistence**: Use `initializeAuth` with `getReactNativePersistence(AsyncStorage)` to persist login across app restarts.

---

### Subscription/IAP: RevenueCat

**Recommendation: `react-native-purchases` 9.10.x (RevenueCat SDK).**

**Rationale:**

- RevenueCat abstracts App Store and Play Store receipt validation, subscription management, and paywalls into a single API.
- Handles free/premium entitlements natively — you query `Purchases.getCustomerInfo()` to check entitlement, no server-side receipt validation needed.
- Has an Expo-compatible setup (requires bare workflow or Expo config plugin — this means you will need to eject to Development Builds for RevenueCat, which you need anyway for background audio).
- Alternative: `expo-in-app-purchases` (14.5.x) is simpler but does not handle subscription state management or receipt validation. RevenueCat is the industry standard for freemium apps.

**Important**: RevenueCat requires Development Builds (not Expo Go). Plan for this from Phase 1.

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-reanimated | 4.2.x | Smooth animations for UI transitions, immersive mode fade | Always — required for smooth 150-250ms transitions the PRD specifies |
| react-native-gesture-handler | 2.30.x | Swipe gestures (sound list, immersive mode dismiss) | When implementing swipe-to-dismiss or drag gestures |
| react-native-safe-area-context | 5.6.x | Safe area insets for notches and home indicators | Always — critical for immersive fullscreen mode |
| expo-keep-awake | 15.0.x | Prevent screen sleep during audio playback | When audio is playing — call `activateKeepAwakeAsync()` |
| expo-haptics | 15.0.x | Tactile feedback on tap (favorites, timer) | Subtle haptics on sound selection and favorites to reinforce calm interactions |
| expo-linear-gradient | 15.0.x | Gradient backgrounds in immersive mode | Immersive fullscreen view |
| expo-blur | 15.0.x | Blur effects for modal overlays | Timer/settings overlays |
| expo-system-ui | 6.0.x | Control navigation bar and status bar colors | Dark mode, immersive mode — hide system chrome |
| expo-notifications | 0.32.x | Optional: "Time to relax" reminders (v1.1 roadmap) | Only for notification feature — defer to v1.1 |
| @react-native-async-storage/async-storage | 2.2.x | Local persistence (used by Firebase auth, Zustand) | Always — Firebase JS SDK auth requires it |
| react-native-mmkv | 4.1.x | Fast key/value storage for user preferences | Use for non-auth preferences (selected sounds, timer settings). Faster than AsyncStorage. Requires dev build. |

---

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Expo Dev Client (Development Build) | Run custom native code in dev | Required for react-native-mmkv and react-native-purchases. Create with `eas build --profile development`. |
| EAS Build | Cloud builds for iOS/Android | Use Expo's managed EAS — avoids needing Mac for Android builds |
| EAS Submit | App store submission | Automates TestFlight and Play Store upload |
| ESLint + eslint-config-expo | Code quality | Expo's ESLint config is pre-configured for RN |
| Prettier | Code formatting | Standard setup |
| Expo Router DevTools | File-based route debugging | Built into Expo Dev Tools |

---

## Installation

```bash
# Create project
npx create-expo-app@latest calm-sounds --template

# Core audio
npx expo install expo-av

# Navigation (built into Expo Router — already installed via create-expo-app with router template)
# expo-router@6 is installed by default with SDK 54 router template

# State management
npm install zustand

# Firebase
npm install firebase @react-native-async-storage/async-storage

# Animations and gestures
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context

# Expo modules
npx expo install expo-keep-awake expo-haptics expo-linear-gradient expo-blur expo-system-ui

# Styling (if using NativeWind)
npm install nativewind
npm install -D tailwindcss

# Fast storage (requires dev build)
npm install react-native-mmkv

# Subscriptions (requires dev build)
npm install react-native-purchases

# Dev dependencies
npm install -D typescript @types/react @types/react-native
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| expo-av | expo-audio 1.x | When Expo 55 stabilizes and expo-audio reaches v3+. expo-audio is the future but not production-ready today. |
| expo-av | react-native-track-player | Only if you need OS-level media session (lock screen album art, next/prev controls, Chromecast). Overkill for ASMR single-sound looping. |
| Firebase JS SDK | @react-native-firebase | Only if you need offline-first Firestore with persistent cache, or Firebase Cloud Messaging push notifications. The RN Firebase package has better native performance but requires native builds throughout. |
| Expo Router | React Navigation 7.x | If you have a non-Expo project or need deep legacy navigation patterns. For greenfield Expo 54+, Expo Router is the first-class choice. |
| Zustand | Jotai | Both are fine for this scale. Zustand wins because audio playback state (isPlaying, currentSound, timer) reads better as a flat store than atoms. |
| Zustand | Redux Toolkit | Redux is overkill — too much boilerplate for a 5-screen app. |
| NativeWind | StyleSheet | Roll-your-own StyleSheet is perfectly valid for a minimalist app with a small design system. NativeWind saves time but adds a build step. Pick one and be consistent. |
| react-native-purchases | expo-in-app-purchases | Only if you want to avoid RevenueCat's SDK and handle receipt validation yourself. expo-in-app-purchases is simpler but you handle subscription state manually — high risk for edge cases. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-native-track-player` | Adds native complexity and requires a full media queue architecture. No Expo config plugin. Designed for music apps with lock screen controls — wrong abstraction for ASMR sound clips. | `expo-av` |
| `expo-in-app-purchases` directly | Does not handle subscription renewal state, entitlement checks, or receipt validation. You would re-implement what RevenueCat provides. Subscription edge cases (grace period, billing retry) are non-trivial. | `react-native-purchases` (RevenueCat) |
| Redux / Redux Toolkit | 3x more code than Zustand for the same outcome in a 5-screen app. No meaningful benefit at this scale. | `zustand` |
| React Navigation 7 (standalone) | Expo Router wraps React Navigation internally — using both creates configuration conflicts. Expo Router is the correct abstraction layer for Expo apps. | `expo-router` |
| `@react-native-firebase` for MVP | Requires ejecting to bare workflow or complex Expo config plugin setup on day 1. Firebase JS SDK delivers identical Auth + Firestore + Storage + Analytics with zero native code. Migrate to RN Firebase only if offline sync becomes critical. | `firebase` (JS SDK) |
| Tamagui / Gluestack UI | Both are feature-rich component libraries designed for design systems at scale. This app needs 6-8 custom components max — a full component library adds unnecessary complexity and opinionated styling conflicts with a minimalist UI. | Custom components + NativeWind OR pure StyleSheet |
| `expo-notifications` in MVP | Do-not-disturb is an OS-level feature (controlled by `expo-system-ui` + screen lock, not app notifications). Notifications for "time to relax" reminders are a v1.1 feature. Don't add notification permission prompts to the MVP. | Defer; `expo-system-ui` handles system UI chrome |

---

## Stack Patterns by Variant

**If deploying to Expo Go only (prototype/demo):**
- Drop `react-native-mmkv` (requires dev build), use `AsyncStorage` everywhere
- Drop `react-native-purchases` (requires dev build), mock the paywall
- Keep everything else — expo-av, Firebase JS SDK, Zustand all work in Expo Go

**If targeting background audio (production requirement):**
- Must use Development Builds — background audio via `expo-av` requires `UIBackgroundModes: ["audio"]` in the native Info.plist
- Add to `app.json`: `"ios": { "infoPlist": { "UIBackgroundModes": ["audio"] } }`
- Add to `app.json`: `"android": { "intentFilters": [...] }` for Android background audio service

**If the team wants to avoid NativeWind:**
- Use React Native `StyleSheet` with a `theme.ts` constants file
- Define color palette, spacing scale, and typography as constants
- This is simpler and avoids Tailwind's build-time CSS compilation step

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| expo@54.0.x | react-native@0.76.x | Bundled together — do not install RN separately |
| expo-router@6.0.x | expo@54.x | Major version aligned with Expo SDK |
| react-native-reanimated@4.2.x | expo@54.x | Reanimated 4 is for RN 0.76+; use `reanimated-3` dist-tag for older RN |
| firebase@12.9.x | @react-native-async-storage/async-storage@2.x | Required for `getReactNativePersistence()` auth persistence |
| react-native-purchases@9.x | expo@54.x | Works with Expo SDK 54; requires EAS Development Build |
| NativeWind@4.2.x | tailwindcss@3.3+ | NativeWind v4 requires Tailwind v3; v5 support is in preview |
| react-native-mmkv@4.x | react-native@0.76.x | MMKV 4 targets RN 0.76 New Architecture |

---

## Critical Build Note

This app **requires an EAS Development Build from Phase 1** because:
1. Background audio (`UIBackgroundModes`) needs native config
2. `react-native-mmkv` and `react-native-purchases` are native modules
3. Expo Go does not support custom native modules

Set up EAS Build and a Development Build in the first sprint. Do not prototype in Expo Go and defer this — it causes painful migration mid-project.

---

## Sources

- npm registry (verified 2026-02-18) — expo@54.0.33, expo-av@16.0.8, expo-audio@1.1.1, expo-router@6.0.23, zustand@5.0.11, firebase@12.9.0, react-native-purchases@9.10.1, react-native-reanimated@4.2.2, NativeWind@4.2.1, react-native-mmkv@4.1.2, react-native-track-player@4.1.2
- expo-audio dist-tag `next: 55.0.6` — confirms it is the SDK 55 forward path, not production-ready in SDK 54
- expo-av dist-tag `latest: 16.0.8`, no deprecated flag — confirmed still active
- @react-native-firebase `hasPlugin: True` in package metadata — confirmed Expo config plugin exists but adds native complexity
- firebase JS SDK `is pure JS: True` — confirmed no native modules required
- react-native-track-player: no Expo config plugin in package metadata, `nativeModulesDir: None` in npm manifest

---

*Stack research for: Calm Sounds Mini — React Native ASMR/relaxation sounds app*
*Researched: 2026-02-18*
