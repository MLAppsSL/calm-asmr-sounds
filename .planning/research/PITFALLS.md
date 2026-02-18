# Pitfalls Research

**Domain:** React Native + Expo ASMR / Relaxation Sounds App (Firebase backend, Freemium)
**Researched:** 2026-02-18
**Confidence:** MEDIUM — Context7 MCP and WebFetch/WebSearch unavailable in this session. Findings based on verified training data (through August 2025) on expo-av, Firebase Storage/Firestore, React Native audio patterns, and the ASMR app category. Confidence is elevated by specificity of the stack (Expo + Firebase is a well-documented combination). Flag HIGH-confidence items as confirmed; others as MEDIUM requiring validation before phase execution.

---

## Critical Pitfalls

### Pitfall 1: Audio Continues (or Stops) Unexpectedly on iOS Silent Mode

**What goes wrong:**
On iOS, the device silent/ringer switch mutes audio by default — including your relaxation sounds. A user trying to fall asleep will flip the silent switch, and all audio stops. This is the #1 reported complaint in ASMR and meditation apps on the App Store.

**Why it happens:**
iOS distinguishes between audio categories. The default audio session category (`AVAudioSessionCategoryAmbient` or `soloAmbient`) respects the silent switch. Unless you explicitly set the category to `playback`, audio is muted by hardware switch. Expo's `expo-av` requires explicit configuration via `Audio.setAudioModeAsync()` before playback.

**How to avoid:**
Call this before any audio playback begins — ideally at app startup in `App.tsx` or in the audio service initialization:

```typescript
import { Audio } from 'expo-av';

await Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: true,      // keeps audio when app is backgrounded
  playsInSilentModeIOS: true,         // CRITICAL: overrides silent switch
  shouldDuckAndroid: true,            // ducks other audio on Android
  playThroughEarpieceAndroid: false,
});
```

`playsInSilentModeIOS: true` is not the default. Shipping without it guarantees 1-star reviews from iOS users.

**Warning signs:**
- Testing only with headphones (which bypass the silent switch behavior in test scenarios)
- No iOS-specific audio configuration in codebase at launch
- Reviews saying "audio doesn't work" or "goes silent randomly"

**Phase to address:** Phase 1 (Audio Playback Foundation) — set audio mode before writing any playback UI. This cannot be retrofitted cheaply.

---

### Pitfall 2: Background Audio Stops When App Is Backgrounded (iOS)

**What goes wrong:**
User starts a relaxation loop, locks the phone or switches to another app — audio stops immediately. For a sleep/focus app, this is a core feature breakage. Loop mode becomes useless.

**Why it happens:**
iOS aggressively suspends background apps. Audio continuation requires both the audio session configuration (`staysActiveInBackground: true`) AND the `UIBackgroundModes: audio` capability declared in `Info.plist`. In Expo managed workflow, this requires adding the capability to `app.json`, not modifying `Info.plist` directly.

**How to avoid:**
In `app.json`:
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

This triggers a new Expo build (cannot be applied via OTA update — requires EAS Build). Plan for this in Phase 1. Without it, `staysActiveInBackground: true` in `setAudioModeAsync` has no effect on iOS.

Android background audio requires a `ForegroundService` — Expo handles this partially but a notification must show while playing (Android OS requirement since API level 26). Design for the "playing" notification early; it is not optional.

**Warning signs:**
- Audio tests only performed with app in foreground
- `UIBackgroundModes` absent from build configuration
- Android build missing foreground service configuration

**Phase to address:** Phase 1 (Audio Playback Foundation). Requires EAS Build, not Expo Go — plan build infrastructure early.

---

### Pitfall 3: Client-Side Freemium Gating (Security Catastrophe)

**What goes wrong:**
Premium audio content is "locked" by hiding UI or checking a local boolean. Users inspect network traffic, find the Firebase Storage URLs directly, and access all premium content for free. Or worse, a simple reverse engineering of the JS bundle exposes the gate logic.

**Why it happens:**
In React Native, JavaScript is bundled and can be inspected. Storing premium checks in component state or AsyncStorage is trivially bypassable. Storing premium audio URLs in a public Firestore collection accessible to all authenticated users is equally exposed.

**How to avoid:**
- Premium audio URLs must NEVER be returned to unauthenticated or free-tier users by the database
- Use Firestore Security Rules to restrict premium `Sound` documents: only return `url` field if `request.auth != null` AND the user document has `isPremium: true`
- Alternatively, do not store the real URL in Firestore at all — use a Cloud Function to generate a Firebase Storage signed URL with expiry (e.g., 1 hour) only after verifying premium status server-side
- For MVP where real payments aren't implemented yet: at minimum structure Firestore rules as if payments are real, even if all users get free access during testing. Retrofitting security rules after launch is painful.

**Warning signs:**
- Premium audio URLs are in a publicly readable Firestore collection
- "isPremium" check happens only in the React Native component, not enforced server-side
- Firebase Storage rules allow `read` for all authenticated users regardless of tier

**Phase to address:** Phase 1 or 2 (Authentication + Data Layer). Security rules must be established before any premium content is added to Storage. Never store unlocked URLs in accessible locations.

---

### Pitfall 4: Firebase Storage Egress Costs Spike from Audio Streaming

**What goes wrong:**
Firebase Storage charges for data egress (downloads). Audio files served directly from Firebase Storage URLs are re-fetched every time a user plays a sound — no CDN caching. With 15–30 audio files averaging 3–5 MB each, and even modest user numbers, monthly egress costs become significant before any revenue.

**Why it happens:**
Firebase Storage is not a CDN. Each play of an audio file downloads the file again. `expo-av` by default does not cache remote audio files locally. At 1,000 daily active users playing 3 sounds/day at 4 MB each: 12 GB/day egress = ~360 GB/month. Firebase Storage charges $0.12/GB after the free tier (5 GB/month), meaning ~$43/month at this scale — before you have a single paid user.

**How to avoid:**
- Compress audio aggressively: OGG Vorbis or AAC at 64–96 kbps is perceptually indistinguishable for nature/ambient sounds. Target 1–2 MB per file max, not 5–10 MB.
- Cache downloaded audio files locally using `expo-file-system` after first play. Store in `FileSystem.cacheDirectory` with the sound ID as filename. Check cache before fetching from Firebase.
- For v1.1+: migrate audio hosting to a CDN (Cloudflare R2, Bunny CDN, or a CloudFront distribution) — same Firebase Storage backend but served through a CDN layer. Firebase Storage alone is not CDN-friendly.
- Bundle the 5–8 most popular free sounds directly in the app binary (ship as assets). This eliminates egress cost for the highest-frequency plays.

**Warning signs:**
- Audio files are uncompressed WAV or high-bitrate MP3
- No local caching strategy in the audio service
- Firebase console showing egress costs before launch
- Audio loads slowly on cellular connections

**Phase to address:** Phase 1 (Audio Architecture). Audio compression format decision must be made before content creation begins. Caching layer should be in Phase 1 playback service, not bolted on later.

---

### Pitfall 5: Memory Leak from Unmanaged Sound Objects in Loop Mode

**What goes wrong:**
`expo-av` (and the newer `expo-audio`) require explicit `sound.unloadAsync()` calls when a sound is done. In loop mode with navigation, if the user navigates away or the component unmounts without unloading the sound object, the Sound instance remains in memory. Over a long session (30+ minutes of browsing + playing), this causes progressive memory growth and eventual audio glitches or app crashes.

**Why it happens:**
Sound objects in `expo-av` hold native audio resources. React's `useEffect` cleanup is the correct place to unload, but developers commonly forget this or create multiple Sound instances during rapid sound switching. Each `Audio.Sound.createAsync()` call creates a new native resource.

**How to avoid:**
Use a singleton audio service pattern — one global Sound instance that gets stopped and reloaded rather than creating new instances per sound:

```typescript
// In a global AudioService singleton
let currentSound: Audio.Sound | null = null;

async function playSound(url: string) {
  if (currentSound) {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
    currentSound = null;
  }
  const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true, isLooping: true });
  currentSound = sound;
}
```

Register an `AppState` listener to unload when app goes to background if background audio is not needed, or keep loaded if it is.

**Warning signs:**
- Multiple `Audio.Sound.createAsync()` calls without corresponding `unloadAsync()` in cleanup
- Sound playback starting from component `useEffect` without cleanup return
- Memory usage in Flipper/Xcode profiler growing steadily during use
- Audio glitches after 20+ minutes of use

**Phase to address:** Phase 1 (Audio Playback Foundation). Establish the singleton audio service pattern from the start — this is architectural, not a feature.

---

### Pitfall 6: Anonymous → Authenticated User Data Migration Failure

**What goes wrong:**
A user saves favorites locally as an anonymous user, then creates an account. Their locally saved favorites are lost — the app shows an empty favorites list after login. For a small app, this is a major trust-breaker.

**Why it happens:**
React Native apps commonly store anonymous user data in AsyncStorage with a local key. When the user authenticates, the app creates a new Firestore user document but doesn't migrate the local favorites. Firebase supports "anonymous account linking" but it requires explicit implementation and is often skipped as "we'll do it later."

**How to avoid:**
- At login/registration time, read local favorites from AsyncStorage before creating the Firestore user document
- After successful auth, write the merged favorites (local + any existing cloud) to Firestore
- Use Firebase's `linkWithCredential()` if using Firebase Anonymous Auth as the pre-auth state — this preserves the UID and any Firestore data written under the anonymous UID
- If using purely local storage (not Firebase Anonymous Auth) pre-login: implement a migration function that runs once after first successful login

**Warning signs:**
- No mention of favorites migration in auth flow design
- Local storage uses a fixed key like `favorites` rather than `anon_favorites_pending_sync`
- Auth flow goes directly to home screen after login without a migration step

**Phase to address:** Phase 2 (Authentication + Sync). Design the migration path before writing any favorites storage code.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store all audio in Firebase Storage without CDN | Zero setup cost | Egress costs at scale, slow global load | MVP only (< 500 active users) |
| Keep audio files at high bitrate/uncompressed | No compression work needed | Large app size + high Storage egress | Never — compress from day 1 |
| Check premium status only client-side | Faster auth flow | Content trivially bypassed | Never |
| No audio caching, re-fetch every play | Simple implementation | Mobile data usage, Firebase costs | MVP only if traffic is negligible |
| Direct Firestore reads on every favorites access | Simpler state management | Unnecessary reads, cost at scale | MVP with Firestore offline cache enabled |
| Hardcode audio URLs in source code | No Firebase setup needed | Impossible to update content without app release | Never — use Firestore as content catalog |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Firebase Storage + expo-av | Pass `gs://bucket/path` URI directly to `createAsync()` | First resolve to HTTPS download URL with `getDownloadURL()`, then pass to `createAsync()`. `gs://` URIs are not directly playable by expo-av. |
| Firestore + offline favorites | No offline persistence configured | Enable Firestore offline persistence with `enableIndexedDbPersistence()` (web) or the default offline cache on mobile. This allows favorites to load when offline. |
| Firebase Auth + anonymous users | Skip anonymous auth, go straight to guest mode | Use Firebase Anonymous Auth even pre-registration — gives a UID for Firestore documents, enables account linking later, and maintains data continuity. |
| expo-av + React Navigation | Create sound in screen component, navigate away | Sound keeps playing (good for UX) but navigation stack holds references. Use a context/service outside the navigation tree to manage sound state. |
| Firebase Analytics + Expo Go | Analytics events silently dropped in Expo Go | Firebase Analytics only works in standalone builds (EAS Build). Test analytics events only in development builds, not Expo Go. |
| Expo OTA updates + audio assets | Assume OTA can add new audio files | Expo OTA (EAS Update) can update JavaScript but NOT native assets bundled at build time. New audio files added to Firebase Storage are fine; audio bundled in the binary requires a new build. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering sound list on every favorites change | UI jitter when toggling favorites | Memoize sound list items with `React.memo`, separate favorites state from sound catalog state | Immediately visible with React DevTools |
| Loading all 30 sound metadata at startup | Slow initial load, unnecessary Firestore reads | Load sound catalog once, cache in memory/AsyncStorage, use Firestore offline cache | At 30+ sounds with metadata-heavy documents |
| Dynamic backgrounds re-rendering during audio playback | Frame drops, audio sync issues | Use `Animated` API or `react-native-reanimated` with `useSharedValue` — keep animations off the JS thread | On mid-range Android devices immediately |
| No debounce on timer controls | Multiple rapid taps create overlapping timers | Debounce timer toggle buttons (300ms), disable during state transitions | Immediately visible in rapid-tap testing |
| Fullscreen mode triggering re-layout | Janky transition into immersive mode | Pre-layout fullscreen view, toggle visibility not mounting/unmounting | On older devices, immediate |
| Reading Firestore on every app foreground | Unnecessary reads, costs | Use AppState listener judiciously; rely on Firestore real-time listener or single read with cache | At 1000+ DAU |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Public Firestore rules during development | Developer forgets to restrict before launch; any user can read all data | Start with restrictive rules from day 1, use Firebase Emulator for local development with production-equivalent rules |
| Premium audio URLs in public Firestore documents | Free users access all premium content | Premium `url` field must be omitted from Firestore documents returned to non-premium users — enforce via Security Rules, not client logic |
| Firebase config keys in public repo | Config keys exposed (though Firebase config is designed to be public, Storage bucket enumeration possible) | Use `.env` for Firebase config, add to `.gitignore`. Note: Firebase API keys are not secret by design, but the bucket URL should not be publicly broadcast |
| No rate limiting on Firestore favorites writes | Malicious user floods Firestore with writes | Firestore Security Rules can limit write frequency per document — add rate limiting rules to favorites subcollection |
| Anonymous user data retention indefinitely | GDPR/privacy liability if users are in EU | Implement Firebase Anonymous Auth cleanup — Firebase has built-in TTL for anonymous accounts (30 days of inactivity) but document retention policy |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing paywall immediately on app open | User leaves before experiencing value | Gate premium behind one positive experience — let users play one free sound, then surface premium in context ("More sounds like this") |
| Aggressive paywall during immersive mode | Shatters the calm experience — the anti-product | Show premium prompts only on sound list screen, never during playback or fullscreen mode |
| Dark mode implemented as just dark backgrounds | Text on dark background fails contrast in subtle colors; accessible issues | Test WCAG AA (4.5:1) contrast for all text/icon combinations in dark mode specifically — the teal/gold palette needs validation in dark context |
| No audio fade-in/fade-out | Abrupt audio start/stop jars the user, defeats calm purpose | Implement 1–2 second fade-in on play and 2–3 second fade-out on stop/timer end. expo-av supports `Sound.setVolumeAsync()` — build a fade utility from day 1 |
| Timer countdown visible and prominent | Watching time count down creates anxiety (opposite of goal) | Show timer status subtly — small indicator, optional. Default: no timer visible unless user requests it |
| Haptic feedback on every interaction | Excess stimulation defeats minimalist premise | No haptics for routine navigation — reserve for meaningful moments (session complete, favorite saved) |
| Scroll-heavy sound library with pagination | 30+ sounds requiring scroll creates choice paralysis | Categorize by mood/environment (6–8 per category), show max 8 sounds initially. Infinite scroll defeats the "3 taps" rule |

---

## "Looks Done But Isn't" Checklist

- [ ] **Audio loop mode:** Verify loop continues correctly across app backgrounding on both iOS AND Android — test with real devices, not simulators
- [ ] **Favorites sync:** Verify favorites saved as anonymous user survive account creation — test the migration path explicitly
- [ ] **Timer end behavior:** Audio fade-out on timer completion tested — not just instant stop
- [ ] **Premium gating:** Verify premium Firestore Security Rules actually block free users — test with a Firebase free-tier test account, not admin credentials
- [ ] **Offline mode:** App is usable (plays cached/bundled sounds) when network unavailable — test in airplane mode
- [ ] **Silent mode on iOS:** Confirmed `playsInSilentModeIOS: true` is set AND verified on a real iPhone with silent switch engaged
- [ ] **Android foreground notification:** Playing sound shows persistent notification on Android — tested on Android 8+ device
- [ ] **Audio file licenses:** Every sound file has documented license or proof of ownership — create an `AUDIO_CREDITS.md` with source, license, and acquisition date for each file
- [ ] **Dark mode contrast:** Every screen tested at WCAG AA 4.5:1 in dark mode with the actual color palette
- [ ] **Sound unload on navigation:** Confirmed no memory leak when rapidly switching between 5+ sounds — profile with Xcode Instruments

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Silent mode not configured | LOW | Add `setAudioModeAsync` call + redeploy via EAS Update (JS-only change) |
| Background audio missing `UIBackgroundModes` | HIGH | Requires new EAS Build, new App Store submission, 1–7 day review wait |
| Client-side premium gating in production | HIGH | Security rules audit, remove all premium URLs from public Firestore, migrate data model, redeploy — data already leaked cannot be recovered |
| Firebase Storage egress spike | MEDIUM | Compress files immediately, add caching layer, migrate to CDN — but costs already incurred |
| Anonymous favorites data lost post-login | MEDIUM | Can be fixed with a migration script for existing users, but affected users need manual outreach/support |
| Memory leak in audio service | MEDIUM | Rewrite audio service as singleton with EAS Update (JS-only) — no new build needed |
| Copyright infringement discovered post-launch | HIGH | Remove affected sounds immediately (EAS Update), submit emergency app update — potential legal liability cannot be undone |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| iOS silent mode (`playsInSilentModeIOS`) | Phase 1: Audio Playback | Manual test: iPhone + silent switch + audio plays |
| Background audio (`UIBackgroundModes`) | Phase 1: Audio Playback | Manual test: lock screen + audio continues |
| Memory leak (sound singleton pattern) | Phase 1: Audio Playback | Xcode Instruments memory profiler: 15 min session, no growth |
| Audio compression + caching | Phase 1: Audio Playback | Measure file sizes (target < 2 MB); confirm cache directory populated after first play |
| Anonymous → auth favorites migration | Phase 2: Auth + Sync | Integration test: add favorites before login, create account, verify favorites present |
| Client-side premium gating | Phase 2: Auth + Sync | Security test: access Firestore with free-tier token, confirm premium URLs absent from response |
| Firebase Security Rules | Phase 2: Auth + Sync | Firebase Emulator: run rule tests for all read/write scenarios |
| Firebase Storage egress cost | Phase 1 (compression) + Phase 3 (CDN) | Track Firebase console egress daily during beta |
| Paywall placement breaking calm | Phase 3: Monetization | UX test: 5 users attempt to use app — measure when/if paywall disrupts flow |
| Audio fade in/out | Phase 1: Audio Playback | Subjective test: all transitions rated "smooth" by 3+ testers |
| Dark mode contrast | Phase 1: UI Foundation | Contrast checker tool on every text element in dark mode |
| Copyright documentation | Phase 0 (content sourcing) | `AUDIO_CREDITS.md` file exists with license for every sound before adding to app |

---

## Sources

- expo-av documentation (training data, August 2025): iOS `playsInSilentModeIOS`, `staysActiveInBackground`, `Audio.setAudioModeAsync()` behavior — MEDIUM confidence (verified pattern widely documented across Expo ecosystem)
- iOS `UIBackgroundModes: audio` requirement: Verified against Expo managed workflow documentation pattern for background audio — MEDIUM confidence
- Firebase Storage egress pricing ($0.12/GB): Based on Firebase pricing documentation as of training data — LOW confidence (verify current pricing at firebase.google.com/pricing before build phase)
- Firestore Security Rules for premium gating: Pattern based on Firebase Security Rules official documentation — MEDIUM confidence
- Firebase Anonymous Auth account linking: Firebase Authentication documentation pattern — MEDIUM confidence
- Audio memory management (singleton pattern): Expo GitHub issues and community best practices for expo-av — MEDIUM confidence
- Freemium UX paywall patterns: Calm, Headspace, Endel app analysis + general mobile UX research — MEDIUM confidence
- Android foreground service audio requirement (API 26+): Android developer documentation — MEDIUM confidence (verify current Android version support matrix)

---
*Pitfalls research for: React Native + Expo + Firebase ASMR / Relaxation Sounds App (Calm Sounds Mini)*
*Researched: 2026-02-18*
