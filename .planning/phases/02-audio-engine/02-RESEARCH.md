# Phase 2: Audio Engine - Research

**Researched:** 2026-02-19
**Domain:** expo-audio, Firebase Storage, expo-file-system, timer service, audio fade/crossfade
**Confidence:** HIGH (core APIs verified against official docs and GitHub; known bugs verified against open issues)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Sound switching
- Switching to a new sound: crossfade (old fades out, new fades in simultaneously)
- Tapping the active sound (already playing): toggle it off — stop playback
- Manual stop (toggle off): cut immediately, no fade
- Switching is the only action that uses crossfade; stopping is instant

#### Timer behavior
- Timer options: 1, 2, or 3 minutes (as defined in roadmap)
- At timer zero: audio fades out gently, then stops
- Timer display: visible by default during playback; Settings will include a "disable timer display" option
- Mid-session timer change: allowed — user can change timer duration while audio is playing
- Switching sounds resets the timer to its original duration (not continues counting)

#### Loop and fade
- Sounds always loop indefinitely — they are short clips (~30s) designed to repeat
- Timer is the stop mechanism (or manual tap to toggle off)
- Loop restart: gapless, seamless — no audible gap or fade at the loop point
- Fade behavior applies only to: (1) crossfade when switching sounds, (2) fade-out when timer reaches zero
- Loop counter: Claude's Discretion — if implemented, a subtle display (e.g., ×4) on the player screen

#### First-play loading
- Loading state during first play (before cached): Claude's Discretion — minimize disruption
- Cached playback: must start instantly with no perceptible delay
- Load failure (no internet, Firebase unreachable): Claude's Discretion — least disruptive handling
- Cache policy: permanent until app reinstall — sounds never expire after being cached

### Claude's Discretion
- Loading state indicator during first play (spinner vs active-state vs silent wait)
- Error handling on load failure (silent fail vs brief toast)
- Loop counter: whether to show it and exact placement
- Crossfade duration (suggested: ~0.5–1s based on user preference for "short fade")

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUDIO-01 | User can start playing a sound by tapping it (auto-play, no extra step) | `createAudioPlayer` singleton + `player.play()` called immediately in AudioService; local URI used after first-play cache; no buffering wait for cached files |
| AUDIO-02 | Audio continues playing when the screen locks or the user switches apps (background audio) | `setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true })` on both iOS and Android; `UIBackgroundModes: ["audio"]` in app.json already set in Phase 1; lock screen metadata via `setActiveForLockScreen` |
| AUDIO-03 | User can enable loop mode so a sound repeats until they manually stop it | `player.loop = true` property; gapless behavior verified — see Pitfall 4 for the audio file format workaround required for true gapless on iOS |
| AUDIO-04 | User can choose a fixed timer duration (1, 2, or 3 minutes) that stops audio automatically — free tier | TimerService using timestamp-based approach (Date.now at start + AppState recovery) + audio fade utility; fade-out triggers volume animation before calling `player.pause()` |
</phase_requirements>

---

## Summary

Phase 2 implements the audio engine: a singleton `AudioService` backed by `expo-audio`, Firebase Storage URL resolution, local caching via `expo-file-system`, and a `TimerService` with AppState-aware countdown. The core library choice is **expo-audio ~1.1.1** (the current stable version in SDK 54). This contradicts the prior research note listing "expo-av 16" — expo-av was deprecated in SDK 54 and is being removed in SDK 55; expo-audio is the correct choice and has resolved its critical Android bugs.

The biggest technical risk is **gapless looping for short clips on iOS**. expo-audio's `player.loop = true` may produce an audible gap on iOS depending on the audio file format. The mitigation is audio file preparation: sounds must be exported as `.caf` (iOS lossless) or `.mp3` with zero-padding stripped, trimmed to exact loop points with no silence at head/tail. For the Android multi-player crossfade (starting a second player pauses the first), this was fixed in April 2025 via expo-audio's audio focus management, but requires `interruptionMode: 'mixWithOthers'` to allow simultaneous playback of two players during the crossfade window.

The **timer** must not rely on `setInterval` alone. When the app is backgrounded, JS timers pause on iOS. The correct pattern is to store `timerStartedAt: Date.now()` and `timerDurationMs` in `audioStore`, then on AppState `change` → `active` event, recalculate elapsed time from the timestamp delta and update remaining seconds accordingly. The timer only drives the UI countdown display; the actual audio stop is triggered by the timer service calling AudioService.fadeAndStop().

**Primary recommendation:** Use `expo-audio ~1.1.1` with `createAudioPlayer` for the singleton pattern, `interruptionMode: 'mixWithOthers'` for crossfade support, timestamp-based timer with AppState recovery, and `FileSystem.documentDirectory` for permanent local audio cache.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-audio | ~1.1.1 | Audio playback, looping, background audio, lock screen controls | Replaces deprecated expo-av; stable in SDK 53+; background Android fix in ~0.x, mixWithOthers in 1.1.0 |
| expo-file-system | ~18.x | Local audio file caching (documentDirectory = permanent) | Built-in Expo SDK module; documentDirectory survives app sessions unlike cacheDirectory |
| @react-native-firebase/storage | ^23.0.1 | Resolve Firebase Storage download URLs for sound files | Already installed in Phase 1; getDownloadURL returns permanent tokens |
| zustand | ^5.x | audioStore: playback state, timer state, current sound tracking | Already scaffolded in Phase 1; timer state lives here |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native AppState API | built-in | Detect foreground/background transitions for timer recovery | Required for accurate timer when app is backgrounded — no native install needed |
| expo-av | — | DO NOT USE | Deprecated SDK 54, removed SDK 55 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-audio createAudioPlayer | react-native-track-player | RNTP is powerful but adds significant native complexity; designed for playlist-style music apps; overkill for ambient looping |
| expo-audio createAudioPlayer | react-native-sound | Older library, not actively maintained for New Architecture; no Expo config plugin |
| expo-file-system documentDirectory | expo-file-system cacheDirectory | cacheDirectory is OS-managed and can be evicted; documentDirectory is permanent until app reinstall (matches locked decision) |
| Timestamp-based timer | react-native-background-timer | background-timer requires additional native module (not managed); timestamp approach works without extra native code for this use case (timer display only — audio stop is native) |

**Installation:**

```bash
# Already installed in Phase 1:
# expo-audio, expo-file-system, @react-native-firebase/storage

# Nothing new to install for Phase 2 — all dependencies are Phase 1 artifacts
# Verify expo-audio version:
npx expo install expo-audio
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── services/
│   ├── AudioService.ts       # Singleton: createAudioPlayer, play/pause/fade/crossfade
│   ├── SoundCacheService.ts  # Firebase URL resolution + expo-file-system download/lookup
│   └── TimerService.ts       # Countdown logic, AppState listener, fade-and-stop trigger
├── config/
│   └── sounds.ts             # Static sound catalog: id, name, category, storageRef
└── stores/
    └── audioStore.ts         # Zustand: currentSoundId, isPlaying, timerSeconds, timerStartedAt
```

### Pattern 1: AudioService Singleton with createAudioPlayer

**What:** A module-level singleton using `createAudioPlayer` (not the hook) so the player persists independently of React component lifecycle. This is the correct pattern for global background audio.

**When to use:** Any audio state that must survive screen navigation or component unmounting.

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/audio/
// src/services/AudioService.ts
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

let _player: AudioPlayer | null = null;
let _fadingPlayer: AudioPlayer | null = null; // second player for crossfade outgoing sound

async function initialize(): Promise<void> {
  await setAudioModeAsync({
    playsInSilentMode: true,          // iOS: play even when silent switch ON
    shouldPlayInBackground: true,      // iOS + Android: continue in background
    interruptionMode: 'mixWithOthers', // allow two players during crossfade
    allowsRecording: false,
  });
}

function getPlayer(): AudioPlayer {
  if (!_player) {
    _player = createAudioPlayer(null); // initialized without source
  }
  return _player;
}

// Call on app startup (before first playback)
export { initialize, getPlayer };
```

**Critical:** Call `initialize()` once at app startup (e.g., in `app/_layout.tsx` useEffect), not on every sound tap.

### Pattern 2: Sound Catalog (Static Config)

**What:** A TypeScript config file mapping sound IDs to Firebase Storage paths. No dynamic Firestore queries needed for the catalog itself.

```typescript
// Source: Architecture decision (prior research)
// src/config/sounds.ts
export type SoundCategory = 'rain' | 'fire' | 'forest' | 'ocean' | 'wind' | 'white-noise';

export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  storageRef: string;   // Firebase Storage path: e.g. "sounds/rain-light.mp3"
  isPremium: boolean;
  durationSeconds: number; // ~30s
}

export const SOUNDS: Sound[] = [
  { id: 'rain-light', name: 'Light Rain', category: 'rain', storageRef: 'sounds/rain-light.mp3', isPremium: false, durationSeconds: 28 },
  { id: 'campfire', name: 'Campfire', category: 'fire', storageRef: 'sounds/campfire.mp3', isPremium: false, durationSeconds: 30 },
  // ... 15-30 total sounds
];
```

### Pattern 3: SoundCacheService (Firebase URL + local file)

**What:** Check local `documentDirectory` first; if absent, get download URL from Firebase Storage and download to permanent local storage. Return local `file://` URI in all cases.

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/filesystem/
// Source: https://rnfirebase.io/storage/usage
// src/services/SoundCacheService.ts
import * as FileSystem from 'expo-file-system/legacy'; // use legacy for documented downloadAsync
import storage from '@react-native-firebase/storage';

const CACHE_DIR = `${FileSystem.documentDirectory}sounds/`;

async function ensureCacheDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

export async function getLocalUri(storageRef: string): Promise<string> {
  await ensureCacheDir();
  const filename = storageRef.replace(/\//g, '_'); // flatten path to filename
  const localUri = `${CACHE_DIR}${filename}`;

  const info = await FileSystem.getInfoAsync(localUri);
  if (info.exists) {
    return localUri; // cached — instant
  }

  // First play: download from Firebase
  const downloadUrl = await storage().ref(storageRef).getDownloadURL();
  const result = await FileSystem.downloadAsync(downloadUrl, localUri);
  return result.uri;
}
```

**Note on FileSystem API:** `expo-file-system/legacy` provides the `downloadAsync` + `getInfoAsync` + `documentDirectory` API that is well-documented and stable. The new `expo-file-system` "next" API (File class, Paths) is available but its docs note it's a newer API. The legacy import is the correct choice for SDK 54.

### Pattern 4: Crossfade Between Two Players

**What:** When switching sounds, create/use a second `AudioPlayer` for the incoming sound, fade out the outgoing player while fading in the incoming player simultaneously (JS volume animation over ~500–1000ms), then release the outgoing player.

```typescript
// src/services/AudioService.ts (continued)
const CROSSFADE_DURATION_MS = 700; // Claude's discretion: 0.5–1s
const FADE_STEPS = 20;
const FADE_INTERVAL_MS = CROSSFADE_DURATION_MS / FADE_STEPS;

export async function crossfadeTo(newLocalUri: string): Promise<void> {
  const outgoing = _player;
  const incoming = createAudioPlayer({ uri: newLocalUri });
  incoming.loop = true;
  incoming.volume = 0;
  incoming.play();
  _fadingPlayer = outgoing;
  _player = incoming;

  // Animate volume over CROSSFADE_DURATION_MS
  for (let step = 1; step <= FADE_STEPS; step++) {
    await new Promise(r => setTimeout(r, FADE_INTERVAL_MS));
    const ratio = step / FADE_STEPS;
    incoming.volume = ratio;
    if (outgoing) outgoing.volume = 1 - ratio;
  }

  // Release outgoing player
  if (outgoing) {
    outgoing.pause();
    outgoing.remove();
    _fadingPlayer = null;
  }
}

export async function fadeAndStop(durationMs = 1500): Promise<void> {
  const player = _player;
  if (!player) return;
  const steps = 30;
  const intervalMs = durationMs / steps;
  for (let step = 1; step <= steps; step++) {
    await new Promise(r => setTimeout(r, intervalMs));
    player.volume = Math.max(0, 1 - step / steps);
  }
  player.pause();
  player.volume = 1; // reset for next play
}

export function stopImmediate(): void {
  if (_player) {
    _player.pause();
    _player.volume = 1;
  }
}
```

**Android crossfade requirement:** `interruptionMode: 'mixWithOthers'` in `setAudioModeAsync` is required so the second player is not suppressed when the first is active. Without this, Android audio focus management pauses the first player when the second starts.

### Pattern 5: TimerService with AppState Recovery

**What:** Store `timerStartedAt` (epoch ms) and `timerDurationMs` in `audioStore`. A `setInterval` drives the UI countdown every second. On AppState `change` to `active`, recalculate elapsed from stored timestamps rather than trusting the interval count.

```typescript
// Source: React Native AppState docs + community pattern
// src/services/TimerService.ts
import { AppState, AppStateStatus } from 'react-native';
import { useAudioStore } from '../stores/audioStore';

let _interval: ReturnType<typeof setInterval> | null = null;
let _appStateSub: ReturnType<typeof AppState.addEventListener> | null = null;

export function startTimer(durationMinutes: 1 | 2 | 3): void {
  const durationMs = durationMinutes * 60 * 1000;
  const store = useAudioStore.getState();
  store.setTimer({ durationMs, startedAt: Date.now() });

  clearTimer();

  _interval = setInterval(() => _tick(), 1000);

  _appStateSub = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      _tick(); // recalculate from timestamps on foreground resume
    }
  });
}

function _tick(): void {
  const { timerStartedAt, timerDurationMs } = useAudioStore.getState();
  if (!timerStartedAt || !timerDurationMs) return;

  const elapsed = Date.now() - timerStartedAt;
  const remaining = timerDurationMs - elapsed;

  if (remaining <= 0) {
    clearTimer();
    useAudioStore.getState().setTimer(null);
    // Trigger audio fade-out
    import('./AudioService').then(({ fadeAndStop }) => fadeAndStop());
  } else {
    useAudioStore.getState().setRemainingMs(remaining);
  }
}

export function clearTimer(): void {
  if (_interval) { clearInterval(_interval); _interval = null; }
  if (_appStateSub) { _appStateSub.remove(); _appStateSub = null; }
}

export function resetTimer(durationMinutes: 1 | 2 | 3): void {
  clearTimer();
  startTimer(durationMinutes);
}
```

**Key insight:** The `setInterval` drives UI updates only. The actual audio stop happens via `fadeAndStop()` in the AudioService — a native operation that continues even when JS has been briefly throttled.

### Pattern 6: audioStore Extension (Phase 2 additions)

```typescript
// src/stores/audioStore.ts — additions to Phase 1 scaffold
interface TimerState {
  durationMs: number;
  startedAt: number; // Date.now() epoch
} | null;

interface AudioState {
  // ... existing Phase 1 fields ...
  timerState: TimerState;
  remainingMs: number | null;
  setTimer: (state: TimerState) => void;
  setRemainingMs: (ms: number | null) => void;
}
```

### Pattern 7: Lock Screen Integration

```typescript
// Called after play() starts; update on sound switch
player.setActiveForLockScreen(true, {
  title: sound.name,
  artist: 'Calm Sounds',
}, {
  showSeekBackward: false,  // Not applicable for ambient loop
  showSeekForward: false,
});
```

**Note:** `setActiveForLockScreen` requires `interruptionMode: 'doNotMix'` per official docs. This conflicts with the crossfade requirement (which needs `mixWithOthers`). Workaround: set `doNotMix` after crossfade completes, set `mixWithOthers` before crossfade begins.

### Anti-Patterns to Avoid

- **Using `useAudioPlayer` hook for the singleton:** React hooks cannot be called outside components; the player would be destroyed on unmount. Use `createAudioPlayer` in a service module.
- **Using `cacheDirectory` for audio files:** The OS can evict cache. Use `documentDirectory` for the permanent cache per the locked decision.
- **Relying solely on `setInterval` for timer accuracy:** Intervals are paused when the app backgrounds on iOS. Store timestamps; recalculate on AppState resume.
- **Calling `setAudioModeAsync` on every play:** Call it once at app startup. Repeated calls mid-session can interrupt ongoing playback.
- **Not calling `player.remove()` on the outgoing crossfade player:** Audio native resources must be released explicitly when using `createAudioPlayer`. Memory leaks occur otherwise.
- **Importing from `expo-av`:** It is deprecated in SDK 54 and will be removed in SDK 55. All audio must use `expo-audio`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio session management (silent mode, background) | Custom AVAudioSession native code | `expo-audio setAudioModeAsync` | Native iOS/Android audio session lifecycle is complex; expo-audio wraps it correctly |
| Firebase download URLs | Direct Storage REST calls | `@react-native-firebase/storage().ref().getDownloadURL()` | RNFB handles auth tokens, retry logic, and native SDK integration |
| Local file existence check | Custom file path hashing | `FileSystem.getInfoAsync(localUri)` | Single call, returns exists + size; no custom solution needed |
| Volume animation | react-spring or Animated API for audio | JS `for` loop with `await setTimeout` on `player.volume` | Audio volume is not a React state — it's a native property; JS loop is the correct approach |
| AppState subscription management | Custom event emitter | `AppState.addEventListener('change', ...)` | Built into React Native; no external library needed for this use case |

**Key insight:** expo-audio wraps a very large surface area of platform audio APIs (AVAudioSession on iOS, ExoPlayer on Android). Custom native solutions would require re-implementing this surface area without any maintenance benefit.

---

## Common Pitfalls

### Pitfall 1: Gapless Loop Gap on iOS

**What goes wrong:** When `player.loop = true`, iOS produces an audible "click" or silence gap (50–200ms) at the loop boundary for MP3/AAC files. This is well-documented in expo-av issues and carries over to expo-audio.

**Why it happens:** iOS's `AVQueuePlayer` (used internally by expo-audio) uses `AVPlayerActionAtItemEndAdvance` to implement looping, which has measurable decode latency at the loop point. Unlike the native `AVPlayerLooper` class which is designed for gapless loops, AVQueuePlayer has inherent latency.

**How to avoid:**
1. **Preferred — audio format fix:** Export sounds as `.caf` (Core Audio Format) at 44.1 kHz. CAF is the only format iOS can loop without gap via buffered memory. Alternatively, MP3 files must be exported with encoder settings that zero-pad silence: use LAME with `--nogap` flag and ensure the file has zero silence at head and tail.
2. **Fallback — preroll at encoding:** Trim the audio file precisely at zero-crossing points at both head and tail in audio editing software (Audacity, Adobe Audition). Even a few samples of silence create the audible gap.
3. **If format fix insufficient:** Consider the dual-player crossfade approach — start the second player 50ms before the first finishes (tracking `status.currentTime` vs `status.duration` from `useAudioPlayerStatus`). This adds complexity but guarantees gapless on all platforms.

**Warning signs:** Audible click or micro-pause when a 30-second loop restarts. Test on real iOS device — simulator may not reproduce the gap.

**Confidence:** MEDIUM — iOS loop gap is confirmed for expo-av; expo-audio's exact behavior depends on its internal iOS implementation. Needs real-device verification.

### Pitfall 2: Android Multi-Player Mutual Pause (RESOLVED)

**What goes wrong:** On older versions of expo-audio (pre-April 2025), starting playback on a second `AudioPlayer` instance would automatically pause the first. This would break crossfade (both players needed simultaneously).

**Why it happens:** Android audio focus management: when a new player requests audio focus, it interrupts others.

**How to avoid:** Set `interruptionMode: 'mixWithOthers'` in `setAudioModeAsync`. This was fixed in expo-audio via PR #36221 (April 2025) — Android audio focus is now manually controllable. expo-audio ~1.1.1 (current) includes this fix.

**Warning signs:** During crossfade, outgoing sound cuts abruptly instead of fading. Test on real Android device.

**Confidence:** HIGH — GitHub issue #36034 was closed April 25, 2025 with linked fix PR #36221.

### Pitfall 3: Timer Drift When Backgrounded

**What goes wrong:** A `setInterval(fn, 1000)` countdown appears accurate on-screen while the app is active, but shows wrong remaining time after the user returns from 5 minutes in another app. The interval was paused; the stored count is stale.

**Why it happens:** iOS suspends JS execution when the app backgrounds. `setInterval` callbacks do not fire during suspension.

**How to avoid:** Store `timerStartedAt = Date.now()` at timer start. On every tick AND on AppState `active` event, compute `remaining = (startedAt + durationMs) - Date.now()`. If remaining ≤ 0, trigger stop immediately.

**Warning signs:** Timer shows 1:45 remaining after user returns from a 3-minute excursion to another app.

### Pitfall 4: `cacheDirectory` File Eviction Breaking "No Delay" Promise

**What goes wrong:** A sound plays instantly (cached), but after a week the device runs low on storage, iOS evicts `cacheDirectory`, and the user hears a loading delay again. This violates the "permanent cache" decision.

**Why it happens:** `FileSystem.cacheDirectory` is explicitly OS-managed and can be cleared at OS discretion.

**How to avoid:** Use `FileSystem.documentDirectory` exclusively for sound files. This directory is user-application data — only cleared on app uninstall (not OS cache pressure).

**Warning signs:** `getInfoAsync` returns `exists: false` for a sound that was previously downloaded.

### Pitfall 5: `setAudioModeAsync` interruptionMode Conflicts with Lock Screen

**What goes wrong:** Lock screen controls (via `setActiveForLockScreen`) require `interruptionMode: 'doNotMix'` per expo-audio docs. But crossfade requires `interruptionMode: 'mixWithOthers'`. Setting the wrong mode breaks either feature.

**Why it happens:** iOS audio session categories are mutually exclusive: exclusive playback (doNotMix) vs. ambient (mixWithOthers).

**How to avoid:** Toggle between modes:
- Default during single-track playback: `doNotMix` (enables lock screen controls)
- During crossfade window (~1s): switch to `mixWithOthers`, complete crossfade, switch back to `doNotMix`
- After crossfade: `setActiveForLockScreen(true, metadata)` to update lock screen display

**Warning signs:** Lock screen media controls disappear after a sound switch, or crossfade second player is inaudible.

### Pitfall 6: Firebase Storage URL Expiration (Not Applicable Here)

**What goes wrong:** Some Firebase Storage setups use short-lived signed URLs that expire. If the app caches the URL (not the file), playback fails after expiration.

**Why it happens:** `getDownloadURL()` from RNFB returns a token-based URL. Tokens do not expire unless manually revoked in Firebase Console.

**How to avoid:** This project caches the audio file content locally (not the URL). The URL is only fetched once for the download; subsequent plays use the `file://` local URI. No expiration issue.

**Confidence:** HIGH — Firebase Storage download tokens are permanent unless revoked; local file caching bypasses the issue entirely.

### Pitfall 7: expo-audio Android BOOT_COMPLETED Google Play Rejection (Open Issue)

**What goes wrong:** Google Play submission may reject APKs containing `BOOT_COMPLETED` broadcast receivers without proper Android 15+ foreground service declarations.

**Why it happens:** GitHub issue #41627 (opened Dec 2025, status: accepted, unfixed as of Feb 2026) — expo-audio or expo-notifications declares a `BOOT_COMPLETED` receiver that triggers Google Play validation warnings on Android 15+ targets.

**How to avoid:** Monitor issue #41627 for the official fix. If submitting to Google Play before the fix lands, a community config plugin can strip the intent-filter from AndroidManifest.xml post-prebuild.

**Warning signs:** Google Play submission shows "BOOT_COMPLETED broadcast receivers" compliance warning.

**Confidence:** MEDIUM — Issue confirmed open; workaround exists; official fix timeline unknown.

---

## Code Examples

Verified patterns from official sources:

### Full AudioService initialization (app startup)

```typescript
// app/_layout.tsx (add to existing root layout)
// Source: https://docs.expo.dev/versions/latest/sdk/audio/
import { useEffect } from 'react';
import { AudioService } from '../src/services/AudioService';

export default function RootLayout() {
  useEffect(() => {
    AudioService.initialize();
  }, []);
  // ...
}
```

### Playing a sound (first-play + cached)

```typescript
// Called when user taps a sound card
// src/services/AudioService.ts
import { SoundCacheService } from './SoundCacheService';
import { useAudioStore } from '../stores/audioStore';

export async function playSound(soundId: string, storageRef: string): Promise<void> {
  const store = useAudioStore.getState();
  const currentId = store.currentSoundId;

  if (currentId === soundId) {
    // Toggle off: instant stop (no fade)
    stopImmediate();
    store.setCurrentSound(null);
    store.setIsPlaying(false);
    return;
  }

  // Resolve local URI (cache-first)
  const localUri = await SoundCacheService.getLocalUri(storageRef);

  if (currentId !== null) {
    // Switching: crossfade
    await crossfadeTo(localUri);
  } else {
    // First play or no active sound
    const player = getPlayer();
    player.replace({ uri: localUri });
    player.loop = true;
    player.play();
    player.setActiveForLockScreen(true, { title: soundName, artist: 'Calm Sounds' });
  }

  store.setCurrentSound(soundId);
  store.setIsPlaying(true);
}
```

### setAudioModeAsync configuration

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/audio/
import { setAudioModeAsync } from 'expo-audio';

await setAudioModeAsync({
  playsInSilentMode: true,         // iOS: play when silent switch ON
  shouldPlayInBackground: true,    // iOS + Android: background audio
  interruptionMode: 'mixWithOthers', // allow simultaneous players for crossfade
  allowsRecording: false,
});
```

### Local file cache lookup and download

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/filesystem/
// Source: https://rnfirebase.io/storage/usage
import * as FileSystem from 'expo-file-system/legacy';
import storage from '@react-native-firebase/storage';

const SOUNDS_DIR = `${FileSystem.documentDirectory}calm-sounds/`;

export async function getLocalUri(storageRef: string): Promise<string> {
  const filename = storageRef.replace(/[\/\.]/g, '_') + '.audio';
  const localPath = `${SOUNDS_DIR}${filename}`;

  // Check cache
  const info = await FileSystem.getInfoAsync(localPath);
  if (info.exists) return localPath;

  // Ensure directory exists
  await FileSystem.makeDirectoryAsync(SOUNDS_DIR, { intermediates: true });

  // Download from Firebase Storage
  const url = await storage().ref(storageRef).getDownloadURL();
  const { uri } = await FileSystem.downloadAsync(url, localPath);
  return uri;
}
```

### Timer with AppState recovery

```typescript
// Source: React Native AppState docs
import { AppState } from 'react-native';
import { useAudioStore } from '../stores/audioStore';
import { fadeAndStop } from './AudioService';

export function startTimer(minutes: 1 | 2 | 3): void {
  const durationMs = minutes * 60 * 1000;
  useAudioStore.getState().setTimer({ durationMs, startedAt: Date.now() });

  const interval = setInterval(tick, 1000);
  const sub = AppState.addEventListener('change', (s) => {
    if (s === 'active') tick();
  });

  // Store cleanup refs in module-level variables
  _cleanup = () => { clearInterval(interval); sub.remove(); };
}

function tick(): void {
  const { timerState } = useAudioStore.getState();
  if (!timerState) return;

  const remaining = (timerState.startedAt + timerState.durationMs) - Date.now();
  if (remaining <= 0) {
    _cleanup?.();
    useAudioStore.getState().setTimer(null);
    fadeAndStop(1500); // 1.5s audio fade before stop
  } else {
    useAudioStore.getState().setRemainingMs(remaining);
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-av` Audio.Sound | `expo-audio` createAudioPlayer | SDK 54 (Sep 2025) | expo-av deprecated; expo-audio is the standard |
| `Audio.setAudioModeAsync({ staysActiveInBackground })` (expo-av) | `setAudioModeAsync({ shouldPlayInBackground })` (expo-audio) | SDK 53 | Renamed option; same concept |
| `sound.setIsLoopingAsync(true)` (expo-av) | `player.loop = true` (expo-audio) | SDK 53 | Direct property assignment replaces async method |
| `sound.setVolumeAsync(v)` (expo-av) | `player.volume = v` (expo-audio) | SDK 53 | Direct property assignment replaces async method |
| Android multi-player mutual pause | Fixed via audio focus control | expo-audio PR #36221 (Apr 2025) | Two simultaneous players now work on Android with mixWithOthers |
| Background audio 3-minute cutoff on Android | Fixed | expo-audio PR #38980 (Sep 2025) | Background playback no longer stops after 3 minutes |
| FileSystem.downloadAsync (main export) | Import from `expo-file-system/legacy` | expo-file-system v18 | Main export now uses new File/Directory class API; legacy API still works and is better documented |

**Deprecated/outdated:**
- `expo-av`: Removed from Expo Go in SDK 55 beta. Do not use for any new audio work.
- `Audio.Sound.createAsync()` (expo-av pattern): Replaced by `createAudioPlayer()` (expo-audio).
- `cacheDirectory` for audio: Works but violates permanent cache requirement. Use `documentDirectory`.
- `interruptionModeIOS` / `interruptionModeAndroid` (expo-av separate keys): expo-audio uses a single `interruptionMode` key with string enum values.

---

## Claude's Discretion Recommendations

### Loading State During First Play

**Recommendation: Show the sound card in an "active/loading" visual state (e.g., spinning waveform icon) immediately on tap, then transition to "playing" state when audio starts.** Do not block the tap with a modal spinner.

Rationale: The download for a 64–96 kbps, ~30s file is 240–360 KB — typically 0.5–2s on 4G. A silent wait feels broken; a full-screen spinner is jarring. The active-state indicator communicates "working" without disrupting the layout.

### Error Handling on Load Failure

**Recommendation: Brief toast notification ("Couldn't load sound — check connection"), 3 seconds, no blocking UI.** The sound card returns to its default (unselected) state.

Rationale: Users can retry by tapping again. Silent failure is ambiguous (is it loading? did it fail?). A toast is minimally disruptive and clearly communicates the state.

### Loop Counter

**Recommendation: Implement the loop counter.** Display as `×4` in a small muted label near the timer display. Update every loop completion by tracking `player.currentTime` approaching `player.duration` via `useAudioPlayerStatus`.

Rationale: Loop counter gives users a sense of "how long have I been listening" in an ambient way — satisfying without being distracting.

### Crossfade Duration

**Recommendation: 700ms.** This sits in the middle of the suggested 500–1000ms range. Short enough to feel snappy; long enough to not feel like an abrupt switch. Make it a named constant `CROSSFADE_DURATION_MS = 700` so it can be adjusted during testing.

---

## Open Questions

1. **Gapless loop behavior on iOS with expo-audio ~1.1.1**
   - What we know: expo-av had a documented iOS loop gap (issue #18446, closed as stale without fix). expo-audio uses a different native implementation but the underlying iOS AVPlayer behavior is the same.
   - What's unclear: Whether expo-audio's `player.loop = true` uses `AVPlayerLooper` (gapless) or `AVQueuePlayer` with repeat (has gap). The internal implementation was not verifiable from public docs.
   - Recommendation: **Test on real iOS device during Plan 02-03 verification.** If gap is audible, apply audio file preparation fix (zero-crossing trim + CAF format). If still audible, implement dual-player approach for loops (adds complexity, treat as fallback only).

2. **`interruptionMode` switching during crossfade**
   - What we know: Lock screen requires `doNotMix`; crossfade requires `mixWithOthers`. Both cannot be active simultaneously.
   - What's unclear: Whether calling `setAudioModeAsync` mid-playback interrupts active audio on iOS.
   - Recommendation: Test the mode-switch sequence during crossfade. If mid-playback `setAudioModeAsync` causes interruption, use `mixWithOthers` as the persistent default and accept that lock screen metadata updates may behave differently.

3. **Firebase Storage getDownloadURL token stability**
   - What we know: Firebase Storage download tokens are permanent unless manually revoked from the Firebase Console.
   - What's unclear: Whether the project's Firebase Security Rules will allow unauthenticated access to Storage, or whether anonymous auth token is needed for the URL fetch.
   - Recommendation: In Phase 2, use `storage().ref(path).getDownloadURL()` — it will use whatever auth state RNFB has (anonymous or signed in). Verify rules in Firebase Console allow `read: if true` for the sounds/ prefix.

4. **expo-audio BOOT_COMPLETED Google Play rejection**
   - What we know: Issue #41627 is open as of Feb 2026, accepted by Expo team, no fix released.
   - What's unclear: Whether this affects a development build in Phase 2 (it's a submission-time issue, not a runtime issue).
   - Recommendation: This does not block Phase 2 development. Flag for Phase 7 (production submission) or when the Expo fix lands.

---

## Sources

### Primary (HIGH confidence)
- [expo-audio official docs](https://docs.expo.dev/versions/latest/sdk/audio/) — setAudioModeAsync, createAudioPlayer, useAudioPlayer, AudioPlayerOptions, lock screen, all TypeScript types
- [expo-file-system official docs](https://docs.expo.dev/versions/latest/sdk/filesystem/) — documentDirectory vs cacheDirectory, getInfoAsync, downloadAsync, makeDirectoryAsync
- [React Native Firebase Storage docs](https://rnfirebase.io/storage/usage) — getDownloadURL API, ref() usage
- [expo-audio CHANGELOG.md (sdk-54 branch)](https://github.com/expo/expo/blob/sdk-54/packages/expo-audio/CHANGELOG.md) — version 1.1.0 features (mixWithOthers, lock screen controls, Android fixes)

### Secondary (MEDIUM confidence)
- [GitHub issue #36034 — Android multi-player mutual pause](https://github.com/expo/expo/issues/36034) — Confirmed resolved April 2025 via PR #36221
- [GitHub issue #38317 — Android background audio 3-minute cutoff](https://github.com/expo/expo/issues/38317) — Confirmed resolved September 2025 via PR #38980
- [GitHub discussion #33192 — Global playback with useAudioPlayer](https://github.com/expo/expo/discussions/33192) — Confirmed createAudioPlayer + replace() for singleton pattern
- [GitHub discussion #35019 — Gapless preload](https://github.com/expo/expo/discussions/35019) — Confirms gapless is not yet implemented in expo-audio (no official response)
- [GitHub issue #18446 — iOS loop gap in expo-av](https://github.com/expo/expo/issues/18446) — Root cause identified; no fix landed; AVPlayerLooper suggested

### Tertiary (LOW confidence — flag for validation)
- [Gist: seamless/gapless crossfade solution with expo-av](https://gist.github.com/smontlouis/d18fdce47c9003d1d24eecf9524eb97e) — expo-av specific; crossfade dual-player technique verified conceptually; not tested with expo-audio
- Community reports: iOS gapless loop gap mitigation via audio file zero-crossing trim and CAF format — multiple sources agree but no official Expo documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — expo-audio ~1.1.1 verified as current stable; FileSystem legacy API documented; RNFB storage verified
- Architecture patterns: HIGH — createAudioPlayer singleton pattern confirmed by official discussion; timer timestamp approach confirmed by community and React Native AppState docs
- Crossfade implementation: MEDIUM — interruptionMode mixWithOthers fix confirmed; actual two-player simultaneous volume animation pattern is logical but not in official examples
- Gapless looping: LOW-MEDIUM — iOS gap issue confirmed in expo-av; expo-audio behavior unconfirmed without real-device test; mitigation strategy (audio file format) is well-established but not Expo-specific
- Known bugs: HIGH — Issues #36034, #38317 confirmed resolved; #41627 confirmed open

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days — check expo-audio changelog and issue #41627 status before planning if research is more than 2 weeks old)
