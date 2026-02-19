# Phase 3: Core UI - Research

**Researched:** 2026-02-19
**Domain:** Expo Router navigation, expo-video, expo-blur, react-native-svg, expo-keep-awake, Zustand persist, AsyncStorage onboarding detection, horizontal FlatList, dark mode toggle
**Confidence:** HIGH (core APIs verified against official Expo docs and GitHub issues; pitfalls verified against open issues)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Library layout
- Horizontal scroll sections per category (e.g. Nature, Ambient) — no "View all" links
- Sections are the browsing mechanism; no category filter tabs needed
- Each section is an independent horizontal FlatList
- No "View all" — the section itself is the complete category view

#### Sound card content
- Square cards, rounded corners (24px), image background with gradient overlay
- Content: image bg + sound name + subtitle (descriptor) + clip duration + PRO/lock badge
- PRO badge: small purple pill ("PRO") top-right corner for premium sounds
- Lock icon: purple circle icon top-right for locked sounds
- Duration added to card (roadmap takes priority over mock — mock omits it)

#### Player screen
- Full-screen ambient background — looping video per category (not still image)
- Each sound category has its own looping video background
- Controls: top bar (back chevron + "NOW PLAYING" + sound name + •••), circular progress arc around play button, countdown timer, bottom frosted-glass pill (loop, airplay, favorite, fullscreen)
- Player is navigated to on sound tap; it is already visually immersive

#### Fullscreen mode
- Fullscreen button in the bottom control pill hides ALL UI chrome: status bar, top bar, bottom controls
- Result: only ambient video and audio remain visible
- Restore: tap anywhere on screen brings back all controls
- Keep-awake active in fullscreen mode

#### Bottom navigation
- 4 tabs: Home (library), graphic_eq (now-playing shortcut), Favorites, Settings
- Nav tab 2 (graphic_eq): Claude's discretion — recommended: navigates to player screen if a sound is active; inactive/disabled state if nothing is playing

#### Onboarding
- 2-screen flow, shown only on first launch
- Screen 1 (Welcome): logo/icon, "Find your calm in a minute", "ULTRA-SHORT SOUNDS", "Begin" button
- Screen 2 (Quiet Mode): "Enable Quiet Mode" with DND toggle (pre-enabled), "Continue" / "Not now"
- Quiet Mode toggle is non-functional shell in Phase 3 — wired up in Phase 7
- First-launch detection: AsyncStorage flag to skip onboarding on subsequent launches

#### Settings screen
- Full mock layout built as a working shell
- Dark mode toggle: functional in Phase 3 (SET-01)
- Session Duration (1m/2m/3m segmented control): shell — non-functional until Phase 4
- Loop Mode toggle: shell — non-functional until Phase 2 wiring
- Auto-play Next toggle: shell — non-functional, Phase TBD
- Silence Notifications toggle: shell — non-functional until Phase 7
- Support & FAQ: placeholder row (no-op tap)
- Share with Friends: placeholder row (no-op tap)

### Claude's Discretion
- Nav tab 2 exact behavior (now-playing routing logic, disabled state treatment)
- Exact looping video assets to use per category (may use placeholder videos in Phase 3)
- Transition animation between library card tap → player screen
- Exact duration label placement on sound card
- Loading/error states for video backgrounds

### Deferred Ideas (OUT OF SCOPE)
- Quiet Mode / DND functional implementation — Phase 7
- Session Duration functional wiring — Phase 4
- Loop Mode functional wiring — Phase 2 (already done; settings toggle wired in Phase 4)
- Account section in Settings — Phase 5
- "Auto-play Next" feature — not yet scoped in any phase (noted for backlog)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LIB-01 | User can browse a library of 15+ relaxing sounds organized by ambient category | Horizontal FlatList per category section; sounds data seeded from local asset manifest; 4 sound categories confirmed in `sounds/` folder (rain, fire, forest, wave) with 4-5 sounds each = 17 sounds total |
| LIB-02 | Horizontal scroll sections per category (context overrides filter tabs) | `FlatList horizontal={true}` with `snapToAlignment="start"` and `decelerationRate="fast"`; each section independently scrollable |
| LIB-03 | Each sound card displays the clip duration and whether it is free or premium | Static metadata object per sound (duration, isPremium); PRO pill and lock icon rendered conditionally on card |
| VIS-01 | User can enter fullscreen immersive mode during playback — UI elements hide, only background visual and audio remain | `setStatusBarHidden()` from expo-status-bar + local `isFullscreen` state; `activateKeepAwakeAsync` on enter; tap-to-restore via `TouchableWithoutFeedback`; no native fullscreen API needed |
| VIS-02 | Each sound category has a corresponding ambient video/visual background shown during playback | `expo-video` `useVideoPlayer` hook with `player.loop = true; player.muted = true`; one VideoView per player screen; `background_video/forest.mp4` exists; placeholder video reused per category until Phase TBD adds remaining videos |
| SET-01 | User can toggle dark mode on or off (dark mode is on by default) | Zustand `uiStore` with `persist` middleware + AsyncStorage; `isDarkMode: true` default; toggle updates store which re-renders theme-aware components; theme propagated via React context or direct store reads |
| ONBRD-01 | First-time users see a welcome onboarding screen before entering the main app | AsyncStorage key `has_seen_onboarding`; checked in root `_layout.tsx` before routing resolves; `SplashScreen.preventAutoHideAsync()` keeps splash visible during check; navigate to `(onboarding)` if not set, to `(tabs)` if set |
</phase_requirements>

---

## Summary

Phase 3 builds the complete navigable shell of the app: library, player, onboarding, and settings. The dominant technical complexity is threefold. First, **navigation architecture** — the root Stack must host both the `(tabs)` group and a `player` screen at the same level so the player renders fullscreen without the tab bar. Second, **expo-video lifecycle** — background video must be muted (so it doesn't conflict with expo-audio), properly paused/released on navigation away, and there is a known iOS bug where video audio continues playing after unmount (fixed in expo-video ~2.x via PR #33922, but must be verified against the SDK 54 pinned version). Third, **fullscreen immersive mode** — achieved through coordinated state: `setStatusBarHidden()`, conditional render of top bar and bottom pill, and `activateKeepAwakeAsync` for keep-awake, without any native fullscreen API.

The circular progress arc around the play button is built from scratch using `react-native-svg` `Circle` + `strokeDashoffset` animation driven by a `useAnimatedProps` hook from `react-native-reanimated`. Do not use `react-native-countdown-circle-timer` — it requires `react-native-svg` as a peer anyway and adds unnecessary abstraction. The mock shows a static SVG arc (not a countdown animation) so a simple SVG `Circle` with computed `strokeDashoffset` driven by `Animated.Value` from the timer store is sufficient.

Dark mode is the only functional setting in Phase 3. The pattern is Zustand `uiStore` persisted to AsyncStorage; the store hydrates asynchronously which causes a brief flash on first load. The mitigation is a `_hasHydrated` guard in the store that delays rendering dark/light background until the persisted value is known.

**Primary recommendation:** Structure `app/` as a root Stack with `(tabs)` and `player` as sibling Stack screens; use `expo-video` with `player.muted = true` and explicit `player.pause()` in `useFocusEffect` cleanup; implement fullscreen with expo-status-bar + local state only; and persist dark mode preference via Zustand persist + AsyncStorage.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-video | ~2.x (SDK 54 pinned) | Looping ambient video background in player screen | Replaces deprecated expo-av Video; `useVideoPlayer` hook with `player.loop = true`; muted video does not conflict with expo-audio |
| expo-blur | ~14.x (SDK 54 pinned) | Frosted-glass bottom tab bar and player control pill | First-party Expo SDK module; `BlurView` with `tint="dark"` and `intensity` prop |
| expo-keep-awake | ~14.x (SDK 54 pinned) | Prevent screen sleep in fullscreen mode | First-party Expo module; `activateKeepAwakeAsync()` / `deactivateKeepAwake()` imperative API |
| expo-status-bar | ~2.x (SDK 54 pinned) | Hide/show status bar for fullscreen immersive mode | First-party Expo module; `setStatusBarHidden(true, 'fade')` imperative call |
| react-native-svg | ~15.x | SVG Circle for circular progress arc in player | Required for animated stroke arc; npx expo install adds correct version |
| @react-native-async-storage/async-storage | ~2.x (SDK 54 pinned) | First-launch detection (onboarding flag) + Zustand persist storage | Standard Expo async persistence; used by Zustand persist middleware |
| expo-image | ~2.x (SDK 54 pinned) | Sound card image backgrounds | Performant image loading with blurhash placeholder; better than RN Image for image-heavy lists |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-reanimated | ~3.x (already installed) | Animate strokeDashoffset on SVG arc | Already in project; use `useAnimatedProps` for SVG props |
| expo-linear-gradient | ~14.x (SDK 54 pinned) | Gradient overlay on sound cards | `LinearGradient` from charcoal/80 to transparent at card bottom |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| expo-video | react-native-video | react-native-video is not Expo-managed and requires additional config plugin setup; expo-video is the SDK 54 standard |
| Custom SVG arc | react-native-countdown-circle-timer | Third-party lib adds react-native-svg peer anyway; mock requires only a static arc driven by audioStore timer, not a standalone countdown component |
| expo-blur | Custom semi-transparent View | expo-blur produces native blur (UIVisualEffectView on iOS); plain semi-transparent view is a poor visual substitute for frosted glass |
| Zustand persist + AsyncStorage | MMKV + zustand-mmkv | MMKV is faster (synchronous) but requires native module; AsyncStorage is sufficient for non-hot-path UI preferences |

**Installation:**
```bash
npx expo install expo-video expo-blur expo-keep-awake expo-status-bar react-native-svg expo-image expo-linear-gradient
# @react-native-async-storage/async-storage already installed from Phase 1
# react-native-reanimated already installed from Phase 1
```

---

## Architecture Patterns

### Recommended Project Structure

The Phase 1 scaffold is already in place. Phase 3 fills in:

```
app/
├── _layout.tsx                   # Root Stack — hosts (tabs) AND player as siblings
├── (tabs)/
│   ├── _layout.tsx               # Custom frosted-glass bottom tab bar (4 tabs)
│   ├── index.tsx                 # Library screen (LIB-01, LIB-02, LIB-03)
│   ├── now-playing.tsx           # Tab 2: nav to player if active, disabled shell if not
│   ├── favorites.tsx             # Favorites tab (empty state shell, Phase 4)
│   └── settings.tsx              # Settings screen (SET-01 + shells)
├── (onboarding)/
│   ├── _layout.tsx               # Stack layout for onboarding
│   ├── index.tsx                 # Welcome screen (Screen 1)
│   └── quiet-mode.tsx            # Quiet Mode screen (Screen 2, non-functional DND toggle)
└── player.tsx                    # Player screen (VIS-01, VIS-02) — fullscreen, no tab bar

src/
├── components/
│   ├── SoundCard.tsx             # Reusable card: image bg, gradient, name, subtitle, duration, badge
│   ├── CategorySection.tsx       # Section header + horizontal FlatList of SoundCards
│   ├── CircularProgressArc.tsx   # SVG arc + play button + countdown display
│   ├── BottomControlPill.tsx     # Frosted-glass pill: loop, airplay, favorite, fullscreen
│   └── VideoBackground.tsx       # expo-video VideoView wrapper with mute + loop + lifecycle
├── stores/
│   ├── uiStore.ts                # isDarkMode (persisted), isFullscreen (ephemeral)
│   └── audioStore.ts             # currentSound, isPlaying, timerRemaining (Phase 2)
├── data/
│   └── sounds.ts                 # Static sound manifest: id, name, subtitle, category, duration, isPremium, imageUrl
└── hooks/
    └── useOnboardingCheck.ts     # AsyncStorage has_seen_onboarding check with splash hold
```

### Pattern 1: Root Stack with Player Outside Tabs

The player screen must appear without the tab bar. The correct Expo Router pattern is to put `player` as a sibling of `(tabs)` inside the root Stack, NOT nested inside a tab.

```typescript
// Source: https://docs.expo.dev/router/basics/common-navigation-patterns/
// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="player"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal', // or 'card' with custom animation
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
```

When the user taps a sound card, call `router.push('/player')` — the player renders fullscreen with no tab bar visible.

### Pattern 2: Custom Frosted-Glass Tab Bar with BlurView

The 4-tab frosted-glass bottom bar uses Expo Router's `tabBarBackground` prop with `BlurView` + `position: 'absolute'` so screen content extends underneath.

```typescript
// Source: https://docs.expo.dev/router/advanced/tabs/
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={80}
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Library' }} />
      <Tabs.Screen name="now-playing" options={{ title: 'Now Playing' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
```

**CRITICAL Android note:** BlurView's Android blur is experimental (`experimentalBlurMethod="dimezisBlurView"`). For Android, it falls back to a semi-transparent overlay if not specified. This is acceptable — the design reads correctly with opacity-only on Android.

### Pattern 3: expo-video Muted Looping Background

The player screen uses `expo-video` for the ambient background. The video must be **muted** (so it does not conflict with expo-audio playback) and must **pause on navigation away** to avoid the known iOS continue-after-unmount bug.

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/video/
// src/components/VideoBackground.tsx
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

interface VideoBackgroundProps {
  source: number | string; // require('../assets/...') or URI
}

export function VideoBackground({ source }: VideoBackgroundProps) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Pause on blur, resume on focus — prevents iOS audio-continues bug
  useFocusEffect(
    useCallback(() => {
      player.play();
      return () => {
        player.pause();
      };
    }, [player])
  );

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls={false}
    />
  );
}
```

### Pattern 4: Fullscreen Immersive Mode

Fullscreen is managed entirely in JS — no native fullscreen API. The `isFullscreen` state lives in `uiStore` (ephemeral, not persisted). On enter: hide status bar, unmount top bar + bottom pill, activate keep-awake. On tap: reverse.

```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/status-bar/
// Source: https://docs.expo.dev/versions/latest/sdk/keep-awake/
// app/player.tsx (fullscreen logic excerpt)
import { setStatusBarHidden } from 'expo-status-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { TouchableWithoutFeedback } from 'react-native';

const KEEP_AWAKE_TAG = 'fullscreen-player';

function enterFullscreen() {
  setStatusBarHidden(true, 'fade');
  activateKeepAwakeAsync(KEEP_AWAKE_TAG);
  setIsFullscreen(true);
}

function exitFullscreen() {
  setStatusBarHidden(false, 'fade');
  deactivateKeepAwake(KEEP_AWAKE_TAG);
  setIsFullscreen(false);
}

// Wrap the entire screen in TouchableWithoutFeedback to restore on tap
<TouchableWithoutFeedback onPress={isFullscreen ? exitFullscreen : undefined}>
  <View style={styles.container}>
    <VideoBackground source={categoryVideo} />
    {!isFullscreen && <TopBar />}
    <CircularProgressArc />
    {!isFullscreen && <BottomControlPill onFullscreen={enterFullscreen} />}
  </View>
</TouchableWithoutFeedback>
```

### Pattern 5: Onboarding First-Launch Detection

Check AsyncStorage in the root layout before navigation resolves. Keep splash screen open during the async check. Navigate to `(onboarding)` or `(tabs)` after determination.

```typescript
// Source: https://docs.expo.dev/router/advanced/authentication/
// app/_layout.tsx (onboarding check)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = 'has_seen_onboarding';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!seen) {
        router.replace('/(onboarding)');
      } else {
        router.replace('/(tabs)');
      }
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!isReady) return null;
  return <Stack>...</Stack>;
}

// When onboarding completes (user taps "Continue" or "Not now"):
await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
router.replace('/(tabs)');
```

### Pattern 6: Zustand uiStore with AsyncStorage Persist (Dark Mode)

Dark mode is the only persisted UI state in Phase 3. Persist via Zustand `persist` middleware with AsyncStorage storage adapter. Handle async hydration to prevent flash.

```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIState {
  isDarkMode: boolean;
  _hasHydrated: boolean;
  toggleDarkMode: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: true, // dark mode ON by default
      _hasHydrated: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isDarkMode: state.isDarkMode }), // only persist isDarkMode
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

In app root or Settings screen, check `_hasHydrated` before rendering to prevent flash:

```typescript
const { isDarkMode, _hasHydrated } = useUIStore();
if (!_hasHydrated) return null; // or return splash/loading state
```

### Pattern 7: Circular Progress Arc (SVG, no library)

The player mock shows a thin arc around the circular play button that represents timer progress. Implemented with `react-native-svg` `Circle` + `strokeDashoffset`.

```typescript
// Source: react-native-svg docs; pattern from https://reactiive.io/articles/circular-progress-bar
// src/components/CircularProgressArc.tsx
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CircularProgressArcProps {
  progress: Animated.SharedValue<number>; // 0 to 1
}

export function CircularProgressArc({ progress }: CircularProgressArcProps) {
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <Svg width={200} height={200} viewBox="0 0 100 100" style={{ transform: [{ rotate: '-90deg' }] }}>
      {/* Track */}
      <Circle
        cx={50} cy={50} r={RADIUS}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={0.5}
        fill="none"
      />
      {/* Progress arc */}
      <AnimatedCircle
        cx={50} cy={50} r={RADIUS}
        stroke="rgba(255,255,255,0.8)"
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        animatedProps={animatedProps}
        fill="none"
      />
    </Svg>
  );
}
```

### Pattern 8: Horizontal FlatList Sound Card Section

Each category section is an independent `FlatList` with `horizontal={true}` and snap behavior.

```typescript
// Source: https://reactnative.dev/docs/flatlist
// src/components/CategorySection.tsx
import { FlatList, View, Text } from 'react-native';
import { SoundCard } from './SoundCard';

export function CategorySection({ category, sounds }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{category}</Text>
      <FlatList
        horizontal
        data={sounds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SoundCard sound={item} />}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={160 + 16} // card width + gap
        contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
      />
    </View>
  );
}
```

### Anti-Patterns to Avoid

- **Nesting player route inside a tab:** Player must be at root Stack level alongside `(tabs)`. Nesting inside a tab means the tab bar stays visible.
- **Using expo-video's native fullscreen (`allowsFullscreen`):** The design requires custom fullscreen (hiding UI chrome), not the OS-native video fullscreen overlay. Set `allowsFullscreen={false}` on VideoView.
- **Using expo-av Video for background video:** expo-av is deprecated in SDK 54, removed in SDK 55. Use `expo-video`.
- **FlatList inside ScrollView for library screen:** Do not wrap the vertical library scroll (category sections) in a ScrollView containing horizontal FlatLists. Use a single vertical `FlatList` with each category section as a `renderItem` to avoid nested VirtualizedList warnings.
- **Playing video sound:** The VideoView ambient background must always have `player.muted = true`. Video audio would conflict with and override expo-audio playback.
- **Not pausing video on navigation away:** Without explicit `player.pause()` in useFocusEffect cleanup, iOS continues playing video audio after navigating back. Always pair play/pause with screen focus lifecycle.
- **Rendering BlurView before dynamic content:** Known expo-blur limitation — blur effects fail to update when BlurView renders before dynamic content (e.g. FlatList). Ensure BlurView is ordered after or uses `position: 'absolute'`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Screen sleep prevention in fullscreen | Custom JS timer to detect inactivity | `expo-keep-awake` `activateKeepAwakeAsync` | Platform-native wake lock; timer approach is unreliable when app is backgrounded |
| Status bar hiding | Native module bridge | `expo-status-bar` `setStatusBarHidden()` | First-party Expo API; handles iOS safe area adjustments automatically |
| Frosted glass nav bar | Custom opacity + shadow | `expo-blur` `BlurView` | Native UIVisualEffectView on iOS; plain opacity is visually inferior |
| Async storage for dark mode | Custom AsyncStorage wrapper | Zustand `persist` + `createJSONStorage(AsyncStorage)` | Handles serialization, hydration lifecycle, partial persistence, and race conditions |
| Onboarding routing logic | Complex state machine | Single AsyncStorage key check + `router.replace()` in root layout | Minimal, sufficient, no additional libraries |
| Circular progress bar | Custom library | SVG `Circle` + `strokeDashoffset` via `useAnimatedProps` | `react-native-countdown-circle-timer` adds react-native-svg peer anyway; custom gives exact visual control matching mock |

**Key insight:** This phase is primarily UI composition, not engine building. The heavy lifting (audio engine, Firebase, stores) was done in Phases 1-2. Phase 3 should favor assembling proven primitives over inventing solutions.

---

## Common Pitfalls

### Pitfall 1: expo-video Audio Continues After Unmount on iOS

**What goes wrong:** When the player screen unmounts (user navigates back), the expo-video `VideoPlayer` continues emitting audio on iOS. This creates audio overlap with expo-audio playback.

**Why it happens:** A regression introduced in expo-video 2.0.0+ where the cleanup of `AVPlayer.replaceCurrentItem(nil)` was not dispatched on the main queue. Fixed in PR #33922 but the exact version where this is resolved in SDK 54 must be verified.

**How to avoid:** Always implement `useFocusEffect` with `player.pause()` in the cleanup function. Do not rely solely on component unmount for cleanup.

**Warning signs:** On iOS simulator, audio from a previous player screen can still be heard after navigating back to the library.

```typescript
useFocusEffect(
  useCallback(() => {
    player.play();
    return () => { player.pause(); }; // CRITICAL cleanup
  }, [player])
);
```

### Pitfall 2: Zustand Dark Mode Flash on First Render

**What goes wrong:** AsyncStorage hydration is asynchronous. On the first render, `isDarkMode` is `true` (the default), but if the user had previously set it to `false`, there is a brief flash where the dark background is shown before the light theme loads.

**Why it happens:** Zustand `persist` with async storage (AsyncStorage) cannot hydrate synchronously at render time.

**How to avoid:** Track `_hasHydrated` state in the store. Delay rendering of theme-dependent UI until hydration completes. Show nothing (or the splash screen) during that window.

**Warning signs:** Brief color flash on app startup, especially visible on Settings screen.

### Pitfall 3: Nested VirtualizedList Warning (Library Screen)

**What goes wrong:** If the library screen uses a `ScrollView` wrapping multiple horizontal `FlatList` sections, React Native warns "VirtualizedLists should never be nested inside plain ScrollViews."

**Why it happens:** React Native cannot reconcile scroll event handlers between nested scrollable components correctly.

**How to avoid:** Use a single outer vertical `FlatList` where each item is a `CategorySection` (which internally contains a horizontal `FlatList`). This is the standard "nested horizontal in vertical FlatList" pattern.

```typescript
// CORRECT: Outer vertical FlatList, inner horizontal FlatList
<FlatList
  data={categories}
  renderItem={({ item }) => <CategorySection category={item} />}
  keyExtractor={(item) => item.name}
/>
// Inside CategorySection:
<FlatList horizontal data={item.sounds} ... />
```

### Pitfall 4: BlurView on Android Fallback

**What goes wrong:** `BlurView` on Android without `experimentalBlurMethod` renders as a semi-transparent view with no actual blur. The frosted tab bar looks flat on Android.

**Why it happens:** Android does not have a direct equivalent to iOS `UIVisualEffectView`. Blur requires additional native processing.

**How to avoid:** Pass `experimentalBlurMethod="dimezisBlurView"` on Android. Accept that perceived intensity may differ from iOS. Test on a real Android device — emulator may not render blur correctly.

**Warning signs:** Tab bar looks opaque gray on Android rather than frosted.

### Pitfall 5: expo-video Multiple VideoView Instances on Android

**What goes wrong:** Rendering a single `VideoPlayer` into multiple `VideoView` components simultaneously fails on Android. Only iOS supports one player in multiple views.

**Why it happens:** Android platform limitation documented in expo-video.

**How to avoid:** Each screen that shows video should create its own `useVideoPlayer` instance. Do not share a single global video player across screens. Since the player screen is a separate route, this is naturally avoided.

### Pitfall 6: Tab 2 ("Now Playing") Navigation When No Sound Is Active

**What goes wrong:** Tapping the `graphic_eq` tab when no sound is playing navigates to the player screen, which shows an empty state or crashes because there is no `currentSound`.

**How to avoid (Claude's Discretion recommendation):** In `now-playing.tsx`, check `audioStore.currentSound`:
- If a sound is active: `router.push('/player')` immediately
- If no sound is active: render a visual "nothing playing" state (a muted tab icon + disabled appearance) and do NOT navigate

```typescript
// app/(tabs)/now-playing.tsx
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAudioStore } from '@/src/stores/audioStore';

export default function NowPlayingTab() {
  const currentSound = useAudioStore((state) => state.currentSound);

  useEffect(() => {
    if (currentSound) {
      router.replace('/player');
    }
  }, [currentSound]);

  // Render "nothing playing" state — this screen barely flashes
  return <NothingPlayingView />;
}
```

### Pitfall 7: Background Video Competing with expo-audio Audio Session

**What goes wrong:** If `player.muted` is not set on the VideoPlayer, expo-video activates its own audio session on iOS, which can interrupt or conflict with expo-audio's `playsInSilentMode` and `shouldPlayInBackground` session configuration from Phase 2.

**How to avoid:** Always set `player.muted = true` immediately in the `useVideoPlayer` initialization callback. Never allow video to play unmuted in this app.

### Pitfall 8: onboarding `router.replace()` Timing Issue

**What goes wrong:** Calling `router.replace('/(onboarding)')` before the root layout has finished mounting can cause navigation to fail silently in Expo Router v4.

**Why it happens:** The router may not be ready immediately on mount if the root layout is still setting up the navigator tree.

**How to avoid:** Wrap the navigate call in a `useEffect` and check that the layout has mounted. Alternatively, use `router.push` on first render and replace with `router.replace` after the navigator tree is ready. Keep `SplashScreen.preventAutoHideAsync()` called before the layout component function.

---

## Code Examples

Verified patterns from official sources and research:

### Looping Muted Background Video
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/video/
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

const player = useVideoPlayer(videoSource, (p) => {
  p.loop = true;
  p.muted = true;  // REQUIRED: do not conflict with expo-audio
  p.play();
});

<VideoView
  player={player}
  style={StyleSheet.absoluteFill}
  contentFit="cover"
  nativeControls={false}
  allowsFullscreen={false}  // Use custom fullscreen, not OS fullscreen
/>
```

### Status Bar Hide/Show for Fullscreen
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/status-bar/
import { setStatusBarHidden } from 'expo-status-bar';

setStatusBarHidden(true, 'fade');   // Enter fullscreen
setStatusBarHidden(false, 'fade');  // Exit fullscreen
```

### Keep Awake in Fullscreen Mode
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/keep-awake/
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const WAKE_TAG = 'fullscreen';
await activateKeepAwakeAsync(WAKE_TAG);  // Enter fullscreen
deactivateKeepAwake(WAKE_TAG);           // Exit fullscreen or unmount
```

### AsyncStorage Onboarding Flag
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'has_seen_onboarding';
// Check:
const seen = await AsyncStorage.getItem(KEY); // null if never set
// Mark complete:
await AsyncStorage.setItem(KEY, 'true');
```

### Zustand Persist with AsyncStorage (Dark Mode)
```typescript
// Source: https://zustand.docs.pmnd.rs/integrations/persisting-store-data
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      _hasHydrated: false,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ isDarkMode: s.isDarkMode }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
```

### BlurView Tab Bar Background
```typescript
// Source: https://docs.expo.dev/versions/latest/sdk/blur-view/
// Source: https://docs.expo.dev/router/advanced/tabs/
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

// In Tabs screenOptions:
tabBarStyle: { position: 'absolute', borderTopWidth: 0, backgroundColor: 'transparent' },
tabBarBackground: () => (
  <BlurView
    tint="dark"
    intensity={80}
    experimentalBlurMethod="dimezisBlurView"  // Android blur
    style={StyleSheet.absoluteFill}
  />
),
```

---

## Design System Reference

The mock folder (`mock/`) contains HTML + PNG references for all screens in this phase. Key design tokens extracted from the mock HTML:

| Token | Value | Usage |
|-------|-------|-------|
| Primary accent | `#8b5cf6` | PRO badge, active tab icon, toggle active state |
| Background | `#0f1115` | App background (charcoal) |
| Card background | `#1a1c22` | Sound card base fill |
| Font | Inter (weights 100-600) | All text; player uses 100-300 weights |
| Card border radius | 24px | Sound cards |
| Frosted nav height | 64px (h-16) | Bottom tab bar |
| Card min-width | 156px | Horizontal scroll cards |
| Card aspect ratio | 1:1 (square) | All sound cards |
| PRO badge | Purple pill, `bg-primary/20`, `border-primary/40` | Premium sounds |
| Lock badge | Purple circle icon, `bg-primary/20` | Locked sounds |
| Player video BG | `forest.mp4` exists in `background_video/` | Only Nature/Forest has a real video; others need placeholder |

**Video assets inventory:**
- `background_video/forest.mp4` — exists, use for Nature/Forest category
- Rain, Fire, Wave categories — no video file exists yet; use `forest.mp4` as placeholder in Phase 3

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| expo-av Video | expo-video `useVideoPlayer` | SDK 52 deprecated, SDK 55 removes | All video playback must use expo-video |
| React Navigation manual tab setup | Expo Router `(tabs)/_layout.tsx` | SDK 50+ | File-based routing eliminates manual navigator registration |
| Plain AsyncStorage for all persistence | Zustand `persist` + AsyncStorage | Zustand v5+ | Middleware handles serialization, partialize, hydration lifecycle |
| `react-native-keep-awake` community | `expo-keep-awake` first-party | SDK 40+ | No separate install, managed Expo module |
| Custom fullscreen via native bridge | expo-status-bar + JS state | Current | No native module needed for this UI pattern |

**Deprecated/outdated:**
- `expo-av` Video component: deprecated SDK 52, removed SDK 55 — DO NOT USE
- `FLAG_FULLSCREEN` Android API: deprecated since Android 11 — expo-status-bar handles the modern API
- `react-native-async-storage` direct use without Zustand: works but loses hydration lifecycle management

---

## Open Questions

1. **expo-video iOS audio-after-unmount bug — fixed in SDK 54 pinned version?**
   - What we know: Bug reported in expo-video, fixed via PR #33922. Issue #33804 marked closed.
   - What's unclear: The exact expo-video version that ships pinned in SDK 54 (`~2.x.x`) — the fix may or may not be included in that pin.
   - Recommendation: In the execute plan, add a verification step: navigate to player, play a sound, navigate back, confirm video audio stops. If not, add an explicit `player.pause()` in the PlayerScreen unmount/blur effect.

2. **Nav tab 2 ("Now Playing" graphic_eq) — navigation or component-only?**
   - What we know: This is Claude's discretion. Phase 1 set up 3 tabs (Library, Favorites, Settings); Phase 3 adds a 4th.
   - Recommendation: Make `now-playing.tsx` a thin redirect screen — if `audioStore.currentSound != null`, `router.replace('/player')` immediately; otherwise render a subtle "nothing playing" shell that does not navigate. This avoids showing an empty player screen.

3. **Animated progress arc driven from audioStore or local state?**
   - What we know: Timer state lives in `audioStore` (Phase 2). The arc should reflect remaining time.
   - Recommendation: Read `audioStore.timerRemaining` and `audioStore.timerDuration` to compute `progress = remaining / duration` as a `useSharedValue` driven by `withTiming` on each store update. The arc is a pure display derived from audio engine state — do not create parallel timer state.

---

## Sources

### Primary (HIGH confidence)
- `https://docs.expo.dev/versions/latest/sdk/video/` — expo-video API, `useVideoPlayer`, `VideoView` props, mute, loop
- `https://docs.expo.dev/versions/latest/sdk/keep-awake/` — `activateKeepAwakeAsync`, `deactivateKeepAwake` API
- `https://docs.expo.dev/versions/latest/sdk/blur-view/` — `BlurView` props, `tint`, `experimentalBlurMethod`, Android limitations
- `https://docs.expo.dev/versions/latest/sdk/status-bar/` — `setStatusBarHidden()` imperative API
- `https://docs.expo.dev/router/basics/common-navigation-patterns/` — Root Stack + Tabs + Player pattern
- `https://docs.expo.dev/router/advanced/tabs/` — `tabBarBackground`, `tabBarStyle` position absolute, `tabBarButton`
- `https://docs.expo.dev/router/advanced/authentication/` — Onboarding routing pattern with splash screen hold
- `https://docs.expo.dev/router/advanced/modals/` — `presentation: 'fullScreenModal'` for player
- `https://docs.expo.dev/router/advanced/custom-tabs/` — Custom tab bar components from `expo-router/ui`
- `https://zustand.docs.pmnd.rs/integrations/persisting-store-data` — Zustand persist + AsyncStorage hydration
- `https://github.com/expo/expo/issues/33804` — expo-video player not released on unmount (closed/fixed)
- `https://reactnative.dev/docs/flatlist` — FlatList horizontal props

### Secondary (MEDIUM confidence)
- `https://reactiive.io/articles/circular-progress-bar` — SVG `Circle` + `strokeDashoffset` + `useAnimatedProps` pattern
- `https://github.com/vydimitrov/react-countdown-circle-timer` — Evaluated and rejected (see Alternatives Considered)
- `https://medium.com/@shreechandra2378/tutorial-building-a-stunning-glassmorphic-tab-bar-in-react-native-75a15d87a975` — Glassmorphic tab bar tutorial (Jan 2026)

### Tertiary (LOW confidence)
- Community discussions on expo/router re: tab bar hiding — confirmed by official docs approach (sibling screen pattern)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are first-party Expo SDK 54 modules or well-established (react-native-svg); versions verified against official docs
- Architecture: HIGH — navigation pattern (root Stack + sibling player) verified against official Expo Router docs; store patterns verified against Zustand docs
- Pitfalls: HIGH for video and BlurView (verified against open GitHub issues); MEDIUM for router timing (community-reported, no official doc)

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days — stable Expo SDK; expo-video bugs move faster, re-verify if SDK 54 minor update ships)
