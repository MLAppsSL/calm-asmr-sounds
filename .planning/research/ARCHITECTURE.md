# Architecture Research

**Domain:** React Native mobile app — ASMR/relaxation audio streaming with Firebase backend
**Researched:** 2026-02-18
**Confidence:** MEDIUM (training data through August 2025; WebSearch/WebFetch/Context7 unavailable during session — verify expo-audio migration status before building)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Layer (React Native)                  │
├──────────────┬────────────────┬───────────────┬─────────────┤
│  Sound       │  Player        │  Favorites     │  Access     │
│  Library     │  Screen        │  Screen        │  Gate       │
│  Screen      │  (Immersive)   │                │  (Freemium) │
└──────┬───────┴───────┬────────┴───────┬────────┴──────┬──────┘
       │               │                │               │
┌──────▼───────────────▼────────────────▼───────────────▼──────┐
│                    Feature Services Layer                      │
├──────────────┬────────────────┬───────────────┬───────────────┤
│  Audio       │  Timer         │  Favorites     │  Auth &       │
│  Service     │  Service       │  Service       │  Access       │
│              │                │  (local+cloud) │  Service      │
└──────┬───────┴───────┬────────┴───────┬────────┴──────┬───────┘
       │               │                │               │
┌──────▼───────┐ ┌─────▼──────┐ ┌──────▼──────┐ ┌─────▼───────┐
│  expo-audio  │ │  Timer     │ │  AsyncStorage│ │  Firebase   │
│  (native     │ │  (JS)      │ │  (local)     │ │  Auth +     │
│  audio APIs) │ │            │ │  Firestore   │ │  Firestore  │
└──────────────┘ └────────────┘ │  (cloud)     │ └─────────────┘
                                └─────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    State Management Layer                    │
│          Zustand stores (audio, favorites, auth, UI)        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├─────────────────┬───────────────┬───────────────────────────┤
│  Firebase       │  Firebase     │  Firebase                 │
│  Storage        │  Firestore    │  Analytics                │
│  (audio files)  │  (user data)  │  (KPIs)                   │
└─────────────────┴───────────────┴───────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Sound Library Screen | Browse/filter sounds, trigger playback | FlatList with SoundCard, category tabs |
| Player Screen (Immersive) | Fullscreen audio control, timer, loop toggle | Modal or dedicated screen, hides status bar |
| Favorites Screen | Display saved sounds (local or cloud) | FlatList, filtered from favorites store |
| Access Gate | Show lock UI for premium sounds, prompt upsell | HOC or wrapper checking access tier |
| Audio Service | Manage audio object lifecycle, play/pause/stop | Singleton wrapping expo-audio Sound object |
| Timer Service | Count down, trigger stop/loop behavior | JS interval within Audio Service or hook |
| Favorites Service | Read/write favorites to local storage or Firestore | Adapter pattern: same interface, different backend |
| Auth & Access Service | Firebase Auth state, premium tier lookup | Firebase SDK + Firestore user document |

---

## Recommended Project Structure

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (tabs)/
│   │   ├── index.tsx       # Sound Library (home)
│   │   ├── favorites.tsx   # Favorites screen
│   │   └── _layout.tsx     # Tab layout
│   ├── player/
│   │   └── [soundId].tsx   # Player/immersive screen
│   ├── auth/
│   │   └── login.tsx       # Optional auth screen
│   └── _layout.tsx         # Root layout (providers)
│
├── components/             # Reusable UI components
│   ├── SoundCard.tsx        # Library list item
│   ├── PlayerControls.tsx   # Play/pause/stop/timer
│   ├── ImmersiveOverlay.tsx # Fullscreen visual layer
│   ├── TimerPicker.tsx      # Timer duration selector
│   ├── FavoriteButton.tsx   # Star/heart toggle
│   ├── PremiumBadge.tsx     # Lock icon for premium
│   └── ui/                  # Base UI primitives (buttons, icons)
│
├── services/               # Business logic, no UI
│   ├── audio/
│   │   ├── AudioService.ts  # Singleton: play, pause, stop, seek
│   │   ├── TimerService.ts  # Countdown and loop logic
│   │   └── useAudio.ts      # React hook wrapping AudioService
│   ├── favorites/
│   │   ├── LocalFavoritesAdapter.ts   # AsyncStorage
│   │   ├── CloudFavoritesAdapter.ts   # Firestore
│   │   └── FavoritesService.ts        # Delegates to correct adapter
│   ├── auth/
│   │   └── AuthService.ts   # Firebase Auth, current user, sign in/out
│   └── access/
│       └── AccessService.ts # Checks free/premium tier per sound
│
├── stores/                 # Zustand global state
│   ├── audioStore.ts        # currentSound, playState, timerRemaining, loopMode
│   ├── favoritesStore.ts    # favoriteIds[], loading state
│   ├── authStore.ts         # user, isAuthenticated, isPremium
│   └── uiStore.ts           # isImmersive, darkMode, isDND
│
├── config/
│   ├── firebase.ts          # Firebase init
│   └── sounds.ts            # Static sound catalog (or fetched from Firestore)
│
├── hooks/                  # Cross-cutting hooks
│   ├── useDoNotDisturb.ts   # Platform-specific DND API
│   ├── useImmersiveMode.ts  # Status bar hiding, keep-awake
│   └── useTheme.ts          # Dark/light mode
│
└── types/
    ├── Sound.ts             # Sound interface
    └── User.ts              # User interface
```

### Structure Rationale

- **app/ (Expo Router):** File-based routing is now the Expo standard — screen-per-file keeps navigation predictable and enables deep linking without configuration.
- **services/:** Separates business logic from UI. Audio, favorites, and auth are services with clear interfaces. Screens call hooks, hooks call services, services call native APIs/Firebase.
- **stores/:** Zustand provides lightweight, hook-friendly global state. One store per domain boundary avoids over-centralization.
- **services/favorites/ (adapter pattern):** Anonymous users use AsyncStorage; authenticated users use Firestore. Same interface, swapped implementation when auth state changes.

---

## Architectural Patterns

### Pattern 1: Audio Service Singleton

**What:** A single Audio Service instance manages the one active Sound object at app lifetime. Screens interact through a `useAudio()` hook that reads from/writes to the audioStore.

**When to use:** Always — audio apps should only have one active sound. A singleton prevents conflicts between screens competing for audio resources.

**Trade-offs:** Simple and correct for this use case. Would need rethinking for simultaneous multi-track playback (not in scope).

**Example:**
```typescript
// services/audio/AudioService.ts
import { Audio } from 'expo-audio'; // or expo-av depending on version

class AudioService {
  private sound: Audio.Sound | null = null;

  async load(uri: string): Promise<void> {
    await this.unload();
    const { sound } = await Audio.Sound.createAsync({ uri });
    this.sound = sound;
    // Set audio mode for background playback
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }

  async play(): Promise<void> {
    await this.sound?.playAsync();
  }

  async pause(): Promise<void> {
    await this.sound?.pauseAsync();
  }

  async unload(): Promise<void> {
    await this.sound?.unloadAsync();
    this.sound = null;
  }
}

export const audioService = new AudioService();
```

### Pattern 2: Favorites Adapter (Anonymous → Authenticated Migration)

**What:** `FavoritesService` delegates to `LocalFavoritesAdapter` (AsyncStorage) or `CloudFavoritesAdapter` (Firestore) based on auth state. When a user logs in, local favorites are merged up to Firestore.

**When to use:** Whenever you need local-first with optional cloud sync — avoids a wall-of-if-statements in screens.

**Trade-offs:** Slightly more indirection; the merge-on-login logic needs a deduplication step.

**Example:**
```typescript
// services/favorites/FavoritesService.ts
interface FavoritesAdapter {
  getFavorites(): Promise<string[]>;
  addFavorite(soundId: string): Promise<void>;
  removeFavorite(soundId: string): Promise<void>;
}

class FavoritesService {
  private adapter: FavoritesAdapter;

  constructor(isAuthenticated: boolean) {
    this.adapter = isAuthenticated
      ? new CloudFavoritesAdapter()
      : new LocalFavoritesAdapter();
  }

  async migrateLocalToCloud(userId: string): Promise<void> {
    const local = await new LocalFavoritesAdapter().getFavorites();
    const cloud = await new CloudFavoritesAdapter().getFavorites();
    const merged = [...new Set([...cloud, ...local])];
    // Write merged set to Firestore
  }
}
```

### Pattern 3: Immersive Mode via Status Bar + Keep Awake

**What:** Fullscreen immersive mode hides the status bar using `expo-status-bar` and prevents the screen from sleeping with `expo-keep-awake`. The UI layer is conditionally rendered — when immersive, only the background gradient/visual remains.

**When to use:** When user activates fullscreen during playback.

**Trade-offs:** Must restore status bar and release keep-awake on unmount or when playback stops, or when user navigates away. Use cleanup in `useEffect`.

**Example:**
```typescript
// hooks/useImmersiveMode.ts
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as KeepAwake from 'expo-keep-awake';

export function useImmersiveMode(isActive: boolean) {
  useEffect(() => {
    if (isActive) {
      KeepAwake.activateKeepAwake();
    } else {
      KeepAwake.deactivateKeepAwake();
    }
    return () => KeepAwake.deactivateKeepAwake();
  }, [isActive]);
}
```

### Pattern 4: Access Gate as Component Wrapper

**What:** A `PremiumGate` component wraps premium SoundCards. It checks `accessStore` and renders either the real content or a locked overlay. Access logic never lives in screens.

**When to use:** For every premium-gated interaction — prevents scattered freemium checks.

**Trade-offs:** Requires access state to be globally available (solved by authStore.isPremium).

**Example:**
```typescript
// components/PremiumGate.tsx
function PremiumGate({ children }: { children: ReactNode }) {
  const isPremium = useAuthStore(s => s.isPremium);
  if (isPremium) return <>{children}</>;
  return <LockedOverlay onPress={navigateToSubscription} />;
}
```

---

## Data Flow

### Audio Playback Flow

```
User taps SoundCard
    ↓
SoundCard calls useAudio().load(sound)
    ↓
useAudio hook calls audioService.load(uri)
    ↓
AudioService fetches URI from Firebase Storage (if not cached)
    ↓
Audio.Sound.createAsync(uri) — native audio object created
    ↓
AudioService calls Audio.setAudioModeAsync({ staysActiveInBackground: true })
    ↓
audioService.play() → sound.playAsync()
    ↓
audioStore updated: { currentSound, playState: 'playing', timerRemaining }
    ↓
Player Screen re-renders with playback state
```

### Timer + Loop Flow

```
User sets timer (e.g., 3 minutes)
    ↓
TimerService starts countdown (setInterval, 1s tick)
    ↓
audioStore.timerRemaining decrements
    ↓
At 0:
  - if loopMode=true  → audioService.replay() → reset timer
  - if loopMode=false → audioService.stop() → clear timer
```

### Favorites Flow (Anonymous → Authenticated)

```
Anonymous user taps favorite:
    ↓
FavoritesService → LocalFavoritesAdapter → AsyncStorage write
    ↓
favoritesStore updated → FavoriteButton re-renders

User logs in:
    ↓
AuthService signals auth state change
    ↓
FavoritesService.migrateLocalToCloud() called
    ↓
Local favorites merged into Firestore document
    ↓
FavoritesService switches adapter to CloudFavoritesAdapter
    ↓
favoritesStore synced from Firestore
```

### State Management

```
Zustand Stores (no Redux, no Context provider chains):
  audioStore    ← AudioService mutations, Player Screen reads
  favoritesStore ← FavoritesService mutations, Favorites Screen reads
  authStore      ← AuthService mutations, AccessGate reads
  uiStore        ← screen hooks mutations, ImmersiveOverlay reads
```

### Key Data Flows

1. **Sound catalog:** Defined statically in `config/sounds.ts` for MVP (fast, offline-ready). Fetch from Firestore in v1.1 when dynamic catalog management is needed.
2. **Audio file URI:** Firebase Storage URL resolved at play-time. Pre-fetching/caching via `expo-file-system` is a v1.1 optimization.
3. **Auth state propagation:** Firebase `onAuthStateChanged` listener updates authStore, which triggers FavoritesService adapter switch.

---

## Build Order (Dependencies)

Build in this order to avoid blocking dependencies:

```
Phase 1: Foundation
  Config (Firebase init, sound catalog) ← no deps
  Stores (Zustand setup) ← no deps
  Navigation shell (Expo Router layout) ← no deps

Phase 2: Audio Core (the heart of the app)
  AudioService singleton ← config
  useAudio hook ← AudioService, audioStore
  TimerService ← AudioService

Phase 3: UI Screens
  SoundCard + Library Screen ← useAudio, sound catalog
  Player Screen (non-immersive) ← useAudio, audioStore

Phase 4: Immersive Mode
  useImmersiveMode hook ← expo-keep-awake, expo-status-bar
  ImmersiveOverlay component ← uiStore, useImmersiveMode

Phase 5: Favorites
  LocalFavoritesAdapter ← AsyncStorage
  FavoritesService ← LocalFavoritesAdapter
  FavoriteButton ← FavoritesService, favoritesStore

Phase 6: Auth + Cloud Favorites
  AuthService ← Firebase Auth
  CloudFavoritesAdapter ← Firestore
  FavoritesService migration ← both adapters

Phase 7: Freemium Access
  AccessService ← authStore (isPremium)
  PremiumGate ← AccessService

Phase 8: Do Not Disturb + Polish
  useDoNotDisturb hook ← platform APIs (iOS: Focus, Android: DND)
  Dark mode ← useTheme, uiStore
  Firebase Analytics ← event hooks
```

---

## Audio + React Native Lifecycle Integration

### Critical: Background Audio Configuration

Audio playback continues when the app is backgrounded (screen locks, user switches apps) — this is the most platform-specific aspect of the project.

**iOS:** Requires `Info.plist` UIBackgroundModes entry `audio`. In Expo, set via `app.json`:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

**Android:** Expo's audio SDK handles this via the AudioFocus API and a foreground service notification. No extra config in Expo managed workflow, but test explicitly — Android kills background processes aggressively.

**Audio Mode:** Must call `Audio.setAudioModeAsync` with `staysActiveInBackground: true` and `playsInSilentModeIOS: true` before any playback. Call once at app startup (in root layout effect), not per-sound.

### AppState Handling

When app moves to background, audio keeps playing (desired). When app returns to foreground, UI must resync with actual playback state (sound object may have been unloaded by OS on extreme memory pressure).

```typescript
// services/audio/AudioService.ts
import { AppState } from 'react-native';

AppState.addEventListener('change', async (nextState) => {
  if (nextState === 'active') {
    // Resync UI with actual sound status
    const status = await this.sound?.getStatusAsync();
    audioStore.setState({ playState: status?.isPlaying ? 'playing' : 'paused' });
  }
});
```

### Unload on Navigate Away

Sound objects hold native resources. Unload when:
- User manually stops playback
- Timer reaches zero and loop is off
- App is about to terminate (AppState === 'background' for more than N minutes — optional)

Do NOT unload on navigation between screens while audio plays — that would break the background audio UX.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–500 users | Static sound catalog in `config/sounds.ts`, Firebase Storage CDN, single Firestore collection. Current architecture is sufficient. |
| 500–10k users | Move sound catalog to Firestore for dynamic management. Add caching layer with `expo-file-system` to avoid re-downloading audio files per session. |
| 10k–100k users | Firebase Storage CDN is inherently scalable. Firestore user documents scale well. Consider Firebase App Check for security. Optimize Firestore reads with offline persistence. |
| 100k+ users | Firebase scales (serverless). Bottleneck is cold start time and cost. Consider audio file CDN caching at edge. Evaluate RevenueCat for subscription management instead of manual Firestore premium flags. |

### Scaling Priorities

1. **First bottleneck:** Audio file download time on slow connections. Fix: `expo-file-system` local cache after first play.
2. **Second bottleneck:** Freemium access check latency (Firestore round-trip before each premium sound). Fix: cache `isPremium` in authStore, re-validate on app foreground.

---

## Anti-Patterns

### Anti-Pattern 1: Creating New Sound Objects Per Render

**What people do:** Call `Audio.Sound.createAsync()` inside a component render or an unmemoized callback, creating multiple Sound objects.
**Why it's wrong:** Each creates a native audio object. Two playing simultaneously produces audio overlap; leaked objects consume memory and crash.
**Do this instead:** Use the AudioService singleton. Sound objects are created once per "play" action and explicitly unloaded before loading a new one.

### Anti-Pattern 2: Storing Audio State in React Component State

**What people do:** `const [isPlaying, setIsPlaying] = useState(false)` in the Player component.
**Why it's wrong:** Audio continues playing after component unmounts (background mode). Component state is gone — you lose the ability to control or reflect actual playback state.
**Do this instead:** All audio state lives in `audioStore` (Zustand). Components subscribe to the store. Audio service updates the store directly.

### Anti-Pattern 3: Calling `setAudioModeAsync` Per Sound Load

**What people do:** Setting audio mode inside `AudioService.load()` for every sound.
**Why it's wrong:** Unnecessary async work on every sound change; can cause brief interruption artifacts on some Android devices.
**Do this instead:** Call `Audio.setAudioModeAsync` once at app startup in the root layout's `useEffect`.

### Anti-Pattern 4: Blocking the JS Thread with Timer Logic

**What people do:** Using synchronous loops or high-frequency `setInterval` (< 100ms) for the countdown timer.
**Why it's wrong:** React Native has one JS thread. Heavy timer work causes UI jank.
**Do this instead:** Use a 1-second `setInterval` for the display timer. The actual stop signal is driven by the Audio object's `onPlaybackStatusUpdate` callback — more accurate than JS timing.

### Anti-Pattern 5: Forcing Login Before Value

**What people do:** Show login wall before a user can play any sound.
**Why it's wrong:** For a relaxation app, friction before first value is fatal — immediate drop-off.
**Do this instead:** Anonymous playback with local favorites. Auth is optional, only prompted when a user wants to sync favorites across devices.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Firebase Storage | Presigned URL, streamed into Audio.Sound | No need to download full file; streaming supported |
| Firebase Firestore | SDK listeners (`onSnapshot`) for favorites, user doc for isPremium | Enable offline persistence for favorites |
| Firebase Auth | `onAuthStateChanged` listener → authStore | Anonymous sign-in as fallback (optional, simpler than no auth at all) |
| Firebase Analytics | `logEvent()` at playback start, favorite, timer set, immersive activate | Wrap in a thin `analytics.ts` service for testability |
| expo-audio / expo-av | Direct SDK calls via AudioService singleton | Check which is current in Expo SDK 52+ before starting |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Screen ↔ AudioService | Via `useAudio` hook (never direct) | Decouples screens from service implementation |
| AudioService ↔ audioStore | Direct store mutations (no events) | AudioService owns audio state |
| FavoritesService ↔ favoritesStore | Direct store mutations after adapter calls | Store is source of truth for UI |
| AuthService ↔ authStore | Direct store mutations on auth state change | Triggers FavoritesService adapter switch |
| AuthService ↔ FavoritesService | authStore change subscription in root layout | Loose coupling via store subscription |

---

## Audio Library: expo-audio vs expo-av

**Confidence: MEDIUM** — As of Expo SDK 51 (mid-2024), `expo-audio` was introduced as a more modern replacement for `expo-av`. By August 2025, `expo-av` was still the more widely documented option but `expo-audio` was actively developed.

**Recommendation:** Check current Expo SDK release notes before choosing. If `expo-audio` is stable and supports background playback in the current SDK version, prefer it (newer API design). If documentation is thin, use `expo-av` — it has a larger body of community examples and is battle-tested for background audio.

The AudioService singleton pattern above works identically with either library; only the import path and some method names differ.

---

## Sources

- Training knowledge: Expo SDK documentation patterns (through August 2025)
- Expo Audio Mode docs: `Audio.setAudioModeAsync` with `staysActiveInBackground` and `playsInSilentModeIOS`
- React Native AppState API for foreground/background lifecycle
- Firebase SDK v9+ modular API patterns
- Zustand v4 store patterns
- expo-router v3 file-based routing structure

**Confidence notes:**
- Audio Service singleton pattern: HIGH — well-established, matches Expo docs examples
- Background audio config (Info.plist, `staysActiveInBackground`): HIGH — official Expo requirement, verified in multiple sources
- expo-audio vs expo-av recommendation: MEDIUM — verify current SDK status before build
- Do Not Disturb API: LOW — platform APIs differ significantly between iOS 15+ Focus modes and Android DND; needs phase-specific research
- Firebase Storage streaming into expo-audio: MEDIUM — URL-based loading is standard pattern but test explicitly for streaming behavior vs download

---

*Architecture research for: Calm Sounds Mini — React Native ASMR audio app*
*Researched: 2026-02-18*
