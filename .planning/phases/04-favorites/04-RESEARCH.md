# Phase 4: Favorites - Research

**Researched:** 2026-02-19
**Domain:** Local favorites persistence (Zustand + AsyncStorage), heart animation (react-native-reanimated), Favorites screen, Settings screen completion (dark mode system default, default timer wiring)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Favoriting interaction
- Heart icon (not star or bookmark) — consistent with the calm/emotional tone of the app
- Heart appears in BOTH locations: on the sound card in the library AND on the player screen
- Tap to toggle — no confirmation needed on remove; animation and removal behavior at Claude's discretion

#### Favorites screen layout
- Layout style: Claude's discretion — match library screen cards for consistency
- Ordering: Claude's discretion — most recently added first is the natural default
- Empty state: illustrated empty state using the existing mock at `mock/empty_favorites_state/screen.png`
- Filtering/grouping: Claude's discretion — flat list preferred for Phase 4 simplicity
- Full screen mock available at `mock/your_favorite_sounds/screen.png`

#### Default timer setting
- Available durations: 1, 2, and 3 minutes — same options as the audio engine (Phase 2)
- "No timer" option: Claude's discretion — must respect free vs premium constraints (Infinity mode is Phase 6 premium)
- Timer application when opening player: Claude's discretion — least disruptive approach
- Per-session override: No — changing the timer in any screen updates the saved default (no separate session vs. default concept)

#### Settings screen structure
- Follow the existing mock at `mock/app_settings_and_timer/screen.png` for layout and grouping
- Account section placeholder: Claude's discretion — decide whether to show a greyed-out "Sign in to sync" row or hide it entirely until Phase 5
- Dark mode default: Follow system preference (not forced dark on first install)

### Claude's Discretion
- Heart animation on favoriting (pop, burst, or simple fill — pick what fits the calm aesthetic)
- Unfavorite behavior (immediate vs brief undo toast — pick least disruptive)
- Favorites screen card style (same as library or compact — pick most consistent)
- Favorites ordering (most recent first recommended)
- Favorites grouping (flat list recommended for Phase 4)
- Default timer application in player (silent pre-select vs highlighted indicator)
- No-timer option availability (constrained by free tier: Infinity mode is Phase 6 premium)
- Account section placeholder in Settings (greyed row vs hidden)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FAV-01 | User can save or unsave any sound as a favorite via a heart icon | `FavoriteButton` component using `useFavoritesStore.toggleFavorite`; icon is `favorite` (filled) / `favorite_border` (outlined) from Material Symbols; scale animation via `withSpring` from react-native-reanimated |
| FAV-02 | User can view all saved favorites in a dedicated Favorites screen | Zustand `useFavoritesStore` hydrates instantly from AsyncStorage persist on app start; FlatList with `ListEmptyComponent` showing illustrated empty state from mock; no loading delay because store is already hydrated before navigation |
| SET-02 | User can set a default timer duration that pre-fills for new sessions | `defaultTimerDuration: TimerDuration` field added to `uiStore` (persisted via AsyncStorage); Settings segmented control writes to store; player screen reads `uiStore.defaultTimerDuration` on mount to pre-select the timer — no new library required |
| SET-03 | User can access a Settings screen to manage all app preferences | Settings screen was built as a shell in Phase 3 (03-03-PLAN.md); Phase 4 wires the Session Duration segmented control to `uiStore` and adds the dark mode system-default initialization |
</phase_requirements>

---

## Summary

Phase 4 has three distinct technical areas. First, **local favorites persistence**: the `favoritesStore` scaffolded in Phase 1 (with `favoriteIds: string[]` + `addFavorite`, `removeFavorite`, `isFavorite`, `setFavorites`) needs the `persist` middleware added, pointing to AsyncStorage with `partialize` to persist only the `favoriteIds` array. A `addedAt` timestamp map (or a `favorites: { id: string; addedAt: number }[]` array) enables most-recently-added ordering. The store hydrates asynchronously on app start; the same `_hasHydrated` guard pattern used in `uiStore` (Phase 3) prevents a flash of empty state. Second, **heart animation**: react-native-reanimated is already installed; a `FavoriteButton` component uses `useSharedValue` + `withSequence` + `withSpring` for a subtle pop-then-settle animation that fits the calm aesthetic — no burst or particle effect. Third, **Settings completion**: the Session Duration segmented control (1m / 2m / 3m) is wired from its shell state to `uiStore.defaultTimerDuration`; the dark mode default is changed from `isDarkMode: true` (hardcoded in Phase 3) to `Appearance.getColorScheme() === 'dark'` as the initial value, so first install follows the system. `expo-system-ui` must be installed for Android to respect `userInterfaceStyle: "automatic"` in the development build.

The Favorites screen uses the same horizontal-card visual language as the library but as a vertical FlatList (one card per row), matching the `mock/your_favorite_sounds/screen.png` design. The empty state uses the illustrated centered layout from `mock/empty_favorites_state/screen.png` — a large outlined heart icon, heading "Your sanctuary is empty", subtext, and an "Explore Sounds" CTA that navigates to the Library tab. There is no network call, no loading state, and no pagination needed — Phase 4 favorites are purely local, fast, and synchronous from Zustand's perspective.

**Primary recommendation:** Add `persist` middleware to `favoritesStore` with `partialize` + `onRehydrateStorage` guard; use a `{ id: string; addedAt: number }[]` array for ordering; implement `FavoriteButton` with `withSequence(withSpring(1.3), withSpring(1))` for the animation; wire the Settings duration segmented control to `uiStore.defaultTimerDuration`; and install `expo-system-ui` for Android dark mode system default support.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-native-async-storage/async-storage | ~2.x (already installed, Phase 1) | Zustand persist storage adapter for favorites and settings | Already in project; Zustand `createJSONStorage(() => AsyncStorage)` is the canonical adapter |
| zustand (persist middleware) | ^5.x (already installed) | Persist `favoritesStore` and `uiStore.defaultTimerDuration` across restarts | `persist` + `createJSONStorage` pattern already proven in `uiStore` Phase 3; no new lib required |
| react-native-reanimated | ~3.x (already installed) | `FavoriteButton` spring animation (`withSequence`, `withSpring`, `useSharedValue`) | Already in project; correct tool for declarative, worklet-thread animations |
| expo-system-ui | ~4.x (SDK 54 pinned) | Enables `userInterfaceStyle: "automatic"` on Android for system dark mode | Required for Android in development builds — without it, the `userInterfaceStyle` key in app.json is silently ignored on Android |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Appearance (react-native built-in) | built-in | Read system color scheme at first install to set `isDarkMode` initial value | Use `Appearance.getColorScheme()` synchronously to initialize `uiStore.isDarkMode` when no persisted value exists |
| useColorScheme (react-native built-in) | built-in | Subscribe to OS color scheme changes at runtime | Optional: listen for system changes if user has not manually toggled — simple approach is ignore runtime changes once user has set a preference |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand persist + AsyncStorage | MMKV + zustand-mmkv-storage | MMKV is synchronous (no hydration delay) but requires a native module not in the managed Expo SDK; async hydration with `_hasHydrated` guard is sufficient for this use case |
| `{ id, addedAt }[]` array for favorites | `Record<string, number>` (id → timestamp) | The array is easier to sort and serialize; the map is marginally faster for `isFavorite` lookup. Array wins because Phase 5 migration iterates over favorites anyway |
| `withSequence(withSpring(...), withSpring(1))` | Lottie heart animation | Lottie requires an additional asset and native module; reanimated is already installed and produces equivalent calm-aesthetic feedback with 5 lines of code |
| Immediate unfavorite (no undo) | Brief undo toast | Undo toast requires a timeout + state machine (cancel timer if user re-favorites); immediate removal is simpler and matches the "tap to toggle" decision. The heart animation reversal (fill → outline) provides sufficient feedback |

**Installation:**
```bash
npx expo install expo-system-ui
# All other libraries already installed in Phases 1–3
```

---

## Architecture Patterns

### Recommended Project Structure

Phase 4 adds to the existing structure established in Phases 1–3:

```
src/
├── components/
│   ├── FavoriteButton.tsx        # NEW — heart icon with spring animation; used in SoundCard + Player
│   └── [existing components]
├── services/
│   └── LocalFavoritesAdapter.ts  # NEW — wraps AsyncStorage for Phase 5 adapter interface
├── stores/
│   ├── favoritesStore.ts         # MODIFIED — add persist middleware, change to { id, addedAt }[] structure
│   └── uiStore.ts                # MODIFIED — add defaultTimerDuration field + system-default initialization
└── types/
    └── index.ts                  # MODIFIED — add Favorite type, expand TimerDuration if needed

app/
└── (tabs)/
    ├── favorites.tsx             # MODIFIED — replace placeholder with real screen
    └── settings.tsx              # MODIFIED — wire Session Duration segmented control
```

### Pattern 1: favoritesStore with persist middleware and ordering

The `favoritesStore` scaffolded in Phase 1 uses `favoriteIds: string[]`. Phase 4 upgrades to `favorites: Favorite[]` (with `addedAt`) to enable ordering. The persist middleware uses `partialize` to only store `favorites` (not internal hydration flags). The `_hasHydrated` guard prevents rendering empty state before AsyncStorage loads.

```typescript
// Source: https://zustand.docs.pmnd.rs/middlewares/persist
// Source: Phase 3 uiStore pattern (verified in 03-RESEARCH.md)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Favorite {
  id: string;       // sound ID
  addedAt: number;  // Date.now() timestamp — used for "most recently added" ordering
}

interface FavoritesState {
  favorites: Favorite[];
  _hasHydrated: boolean;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setFavorites: (favorites: Favorite[]) => void;   // Phase 5 migration entry point
  setHasHydrated: (v: boolean) => void;
  // Derived: sorted most-recently-added first
  getSortedFavorites: () => Favorite[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      _hasHydrated: false,
      toggleFavorite: (id) =>
        set((state) => {
          const exists = state.favorites.some((f) => f.id === id);
          return {
            favorites: exists
              ? state.favorites.filter((f) => f.id !== id)
              : [...state.favorites, { id, addedAt: Date.now() }],
          };
        }),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      setFavorites: (favorites) => set({ favorites }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      getSortedFavorites: () =>
        [...get().favorites].sort((a, b) => b.addedAt - a.addedAt),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ favorites: s.favorites }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
```

**Key design note on `setFavorites`:** Phase 1 scaffolded `setFavorites(ids: string[])`. Phase 4 changes the signature to `setFavorites(favorites: Favorite[])` — the Phase 5 migration plan (`FavoritesService.migrateLocalToCloud`) must receive the updated type. This is a breaking change within the store only; no external callers exist yet.

### Pattern 2: FavoriteButton with spring animation

The `FavoriteButton` is a small reusable component that reads `useFavoritesStore.isFavorite(soundId)` and calls `toggleFavorite(soundId)` on press. The animation uses `withSequence` to scale up to 1.3 then spring back to 1 — the "gentle pop" that communicates interaction without visual noise.

```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/
// Source: https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { useFavoritesStore } from '@/stores/favoritesStore';

interface FavoriteButtonProps {
  soundId: string;
  size?: number;   // icon size, defaults to 24
  color?: string;  // active color, defaults to rose-500
}

export function FavoriteButton({ soundId, size = 24, color = '#f43f5e' }: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(soundId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    toggleFavorite(soundId);
    // Gentle pop — calm aesthetic, not aggressive burst
    scale.value = withSequence(
      withSpring(1.3, { stiffness: 200, damping: 10 }),
      withSpring(1.0, { stiffness: 150, damping: 12 }),
    );
  };

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View style={animatedStyle}>
        {/* Material Symbols "favorite" (filled) vs "favorite_border" (outlined) */}
        {/* Use icon_font or text component per existing project icon approach */}
        <MaterialIcon
          name={isFavorite ? 'favorite' : 'favorite_border'}
          size={size}
          color={isFavorite ? color : '#94a3b8'}  // rose-500 when active, slate-400 when inactive
        />
      </Animated.View>
    </Pressable>
  );
}
```

**Icon approach:** The mocks use Material Symbols Outlined via Google Fonts (web HTML). In the React Native project, icons are likely rendered via `@expo/vector-icons` (Ionicons or MaterialIcons) or a text-based icon_font approach established in Phase 3. Phase 4 should use whatever icon system was chosen in Phase 3 — the planner must check the 03-PLAN summaries to confirm.

### Pattern 3: uiStore additions for default timer and system dark mode

Two changes to `uiStore`:
1. Add `defaultTimerDuration: TimerDuration` (persisted) with an initial value of `60` (1 minute — least disruptive default for free tier).
2. Change `isDarkMode` initialization to use `Appearance.getColorScheme()` as the fallback when no persisted value exists.

```typescript
// Source: https://docs.expo.dev/develop/user-interface/color-themes/
// Source: https://zustand.docs.pmnd.rs/middlewares/persist
import { Appearance } from 'react-native';

// In uiStore initial state:
isDarkMode: Appearance.getColorScheme() === 'dark',
defaultTimerDuration: 60 as TimerDuration, // 1 minute default

// In persist partialize:
partialize: (s) => ({
  isDarkMode: s.isDarkMode,
  defaultTimerDuration: s.defaultTimerDuration,
}),
```

**Why `Appearance.getColorScheme()`:** This is a synchronous read — safe to call during store initialization. It returns `'dark'` | `'light'` | `null`. On first install (no persisted value), the store initializes from the system. On subsequent launches, the persisted value overrides the system reading.

**`expo-system-ui` requirement:** Must be installed for Android to honor `userInterfaceStyle: "automatic"` in `app.json`. Without it, Android ignores the setting in development builds and always renders in light mode regardless of system preference.

### Pattern 4: Favorites screen (FlatList + empty state)

```typescript
// Favorites tab screen — app/(tabs)/favorites.tsx
import { FlatList, View, Text } from 'react-native';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { SoundCard } from '@/components/SoundCard';  // existing component
import { EmptyFavoritesState } from '@/components/EmptyFavoritesState';

export default function FavoritesScreen() {
  const { getSortedFavorites, _hasHydrated } = useFavoritesStore();
  const sortedFavorites = getSortedFavorites();

  // Wait for hydration to avoid flash of empty state
  if (!_hasHydrated) return null;  // or a minimal loading shimmer

  return (
    <FlatList
      data={sortedFavorites}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SoundCard soundId={item.id} />}
      ListEmptyComponent={<EmptyFavoritesState />}
      ListHeaderComponent={
        sortedFavorites.length > 0 ? (
          <Text style={styles.metaText}>{sortedFavorites.length} sounds saved</Text>
        ) : null
      }
      contentContainerStyle={{ flexGrow: 1 }}  // allows EmptyComponent to center vertically
    />
  );
}
```

### Pattern 5: Settings Session Duration segmented control wiring

The Settings screen built in Phase 3 has the Session Duration segment (1m / 2m / 3m) as a non-functional shell. Phase 4 wires it to `uiStore.defaultTimerDuration`:

```typescript
// In app/(tabs)/settings.tsx — add to the existing Session Duration section:
import { useUIStore } from '@/stores/uiStore';

const { defaultTimerDuration, setDefaultTimerDuration } = useUIStore();

// The segmented control (styled radio buttons in the mock):
const DURATIONS: TimerDuration[] = [60, 120, 180]; // 1m, 2m, 3m

DURATIONS.map((duration) => (
  <Pressable
    key={duration}
    onPress={() => setDefaultTimerDuration(duration)}
    style={[
      styles.durationButton,
      defaultTimerDuration === duration && styles.durationButtonActive,
    ]}
  >
    <Text>{duration / 60}m</Text>
  </Pressable>
))
```

**No-timer option:** The mock (`mock/app_settings_and_timer/screen.png`) shows exactly 3 options (1m, 2m, 3m) with no "no timer" option. This aligns with the constraint that Infinity mode is Phase 6 premium. Do not add a "no timer" option — the 3-option segmented control from the mock is the complete implementation.

### Pattern 6: Player timer pre-fill from default setting

When the player screen opens, it should silently pre-select `uiStore.defaultTimerDuration` as the timer — no confirmation, no highlight, just uses it as the starting value. Since Phase 2 already stores timer state in `audioStore.timerDurationMs`, the player should read `uiStore.defaultTimerDuration` on mount and write it to `audioStore` if no sound is currently playing:

```typescript
// In app/player.tsx (or PlayerScreen component):
import { useFocusEffect } from 'expo-router';
import { useUIStore } from '@/stores/uiStore';
import { useAudioStore } from '@/stores/audioStore';

useFocusEffect(() => {
  const { defaultTimerDuration } = useUIStore.getState();
  const { isPlaying, timerDurationMs } = useAudioStore.getState();
  // Only set default timer if not mid-session (no sound playing)
  if (!isPlaying) {
    useAudioStore.getState().setTimerDuration(defaultTimerDuration * 1000);
  }
});
```

**Decision on "per-session override = No":** The locked decision says changing the timer in any screen updates the saved default — there is no separate session vs. default concept. This means `setDefaultTimerDuration` and `setTimerDuration` must be coupled: when the user changes the timer in the player, it also persists to `uiStore.defaultTimerDuration`.

### Pattern 7: LocalFavoritesAdapter (Phase 5 migration interface)

The prior research decision specifies `FavoritesService.migrateLocalToCloud` for Phase 5. Phase 4 should lay the adapter interface now so Phase 5 is purely additive:

```typescript
// src/services/LocalFavoritesAdapter.ts
// Wraps favoritesStore for Phase 5 — no direct AsyncStorage calls here;
// the adapter reads from and writes to the Zustand store, which is already persisted.

export class LocalFavoritesAdapter {
  getFavorites(): Favorite[] {
    return useFavoritesStore.getState().getSortedFavorites();
  }

  async addFavorite(id: string): Promise<void> {
    useFavoritesStore.getState().toggleFavorite(id); // will add if not present
  }

  async removeFavorite(id: string): Promise<void> {
    useFavoritesStore.getState().toggleFavorite(id); // will remove if present
  }

  async setFavorites(favorites: Favorite[]): Promise<void> {
    useFavoritesStore.getState().setFavorites(favorites);
  }
}
```

The planner should decide in the Phase 4 plans whether to build this adapter in Phase 4 or leave it for Phase 5. Given Phase 5's migration requirement (`FavoritesService.migrateLocalToCloud`), defining the interface in Phase 4 is recommended.

### Anti-Patterns to Avoid

- **Anti-pattern: Storing favoriteIds as a plain `string[]` without timestamps.** This loses ordering information. Upgrade to `Favorite[]` with `addedAt` in Phase 4, before any cloud migration logic runs in Phase 5.
- **Anti-pattern: Reading AsyncStorage directly in components.** All favorites state flows through `useFavoritesStore`. Direct AsyncStorage reads in screen components break the single-source-of-truth and create hydration race conditions.
- **Anti-pattern: Adding `_hasHydrated` to the `partialize` array.** Only persist `favorites` (and `defaultTimerDuration` in `uiStore`). Hydration flags are ephemeral session state — do not persist them.
- **Anti-pattern: Showing the Favorites screen content before `_hasHydrated` is true.** The store hydrates asynchronously. Rendering with `favorites: []` before hydration causes a flash of the empty state even when the user has favorites. Return `null` or a shimmer until `_hasHydrated` is `true`.
- **Anti-pattern: Creating a new `Animated.Value` per `FavoriteButton` render.** Use `useSharedValue` which is stable across re-renders. Creating inside `useEffect` is wrong — `useSharedValue` at component top-level is correct.
- **Anti-pattern: Calling `Appearance.getColorScheme()` inside `useEffect` for store initialization.** This is called once, synchronously, at module initialization time. It is safe to call during Zustand store creation (`(set) => ({ isDarkMode: Appearance.getColorScheme() === 'dark' })`).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Favorites persistence | Custom AsyncStorage read/write in screen components | Zustand `persist` middleware | Handles serialization, partialize, hydration lifecycle, `onRehydrateStorage` hook — all the edge cases are solved |
| Heart animation | Custom `Animated.timing` sequence | `withSequence` + `withSpring` (reanimated, already installed) | Worklet-thread execution (no JS thread jank); physics-based spring is calmer and more natural than linear timing |
| Ordering by recency | Sort in render | `getSortedFavorites()` selector in store | Sorting in render re-runs every re-render; selector memoization is cleaner even if Phase 4 list is short |
| Dark mode system detection | Custom native module | `Appearance.getColorScheme()` (react-native built-in) | Synchronous, no install, works on iOS and Android |
| Android dark mode support in dev build | Nothing (broken behavior) | `expo-system-ui` | Required native module; without it, `userInterfaceStyle: "automatic"` is silently ignored on Android in EAS builds |

**Key insight:** The entire Phase 4 technical surface is covered by libraries already installed (Zustand, reanimated, AsyncStorage) plus one new install (`expo-system-ui`). There is nothing novel to build — the risk is in correct wiring of hydration guards and store coupling.

---

## Common Pitfalls

### Pitfall 1: Flash of empty state before hydration
**What goes wrong:** The Favorites screen renders immediately with `favorites: []` while AsyncStorage is still loading the persisted value. User sees the empty state for 50–200ms even if they have saved favorites.
**Why it happens:** Zustand persist with AsyncStorage hydrates asynchronously. The store starts with `favorites: []` and updates after the AsyncStorage read completes.
**How to avoid:** Add `_hasHydrated: false` to `favoritesStore` (same pattern as `uiStore` in Phase 3). Return `null` (or a 1-frame shimmer) from the Favorites screen until `_hasHydrated` is `true`.
**Warning signs:** Favorites screen flashes empty state icon then shows list on every app cold start.

### Pitfall 2: Android dark mode ignored in EAS development build
**What goes wrong:** `Appearance.getColorScheme()` returns `'light'` on Android even when the device is in dark mode, causing the app to always initialize in light mode on Android.
**Why it happens:** `userInterfaceStyle: "automatic"` in `app.json` requires `expo-system-ui` to take effect on Android in development/production builds. Without it, the setting is silently ignored.
**How to avoid:** Run `npx expo install expo-system-ui` and rebuild the development build. Verify on Android device that toggling system dark mode changes `Appearance.getColorScheme()` return value.
**Warning signs:** On Android, `isDarkMode` always initializes as `false` regardless of system setting on first install.

### Pitfall 3: `setFavorites` signature mismatch in Phase 5 migration
**What goes wrong:** Phase 1 scaffolded `setFavorites(ids: string[])`. If Phase 4 does not update this to `setFavorites(favorites: Favorite[])`, Phase 5's migration code will receive type errors or silently lose `addedAt` timestamps.
**Why it happens:** The Phase 1 store was a scaffold placeholder. The Phase 4 upgrade is the first real implementation.
**How to avoid:** Update `setFavorites` signature in both the interface and implementation to accept `Favorite[]` in Phase 4. The prior research decision on `FavoritesService.migrateLocalToCloud` depends on this type being correct.
**Warning signs:** TypeScript errors in Phase 5 migration code referencing `string[]` vs `Favorite[]`.

### Pitfall 4: Timer coupling — player changes not persisting to default
**What goes wrong:** User changes the timer in the player screen (changing from 1m to 3m during a session), exits, reopens app — timer is back to 1m because only `audioStore.timerDurationMs` was updated, not `uiStore.defaultTimerDuration`.
**Why it happens:** The locked decision says "changing the timer in any screen updates the saved default." If the player's timer UI writes only to `audioStore` (Phase 2 implementation), the persisted default is never updated.
**How to avoid:** Wherever the timer duration is changed (player screen timer segmented control), call `useUIStore.getState().setDefaultTimerDuration(newDuration)` in addition to `useAudioStore.getState().setTimerDuration(...)`. This keeps both stores in sync.
**Warning signs:** Timer resets to default on every new session even after user explicitly changed it.

### Pitfall 5: FavoriteButton renders full sound data unnecessarily
**What goes wrong:** `FavoriteButton` subscribes to the entire `favoritesStore` or reads the full sounds catalog, causing re-renders across all SoundCards when any favorite changes.
**Why it happens:** Broad Zustand subscriptions (`useStore()` without selector) re-render every subscriber when any state changes.
**How to avoid:** Use a narrowly scoped selector: `useFavoritesStore((s) => s.isFavorite(soundId))`. This component only re-renders when the specific sound's favorite status changes. Use `useCallback` on `toggleFavorite` or call `useFavoritesStore.getState().toggleFavorite` directly to avoid subscribing to the function reference.
**Warning signs:** All SoundCards in the library re-render simultaneously when one favorite is toggled (visible as a brief flash or measured via React DevTools profiler).

### Pitfall 6: `getSortedFavorites` creates a new array on every render
**What goes wrong:** `getSortedFavorites` creates a new sorted array reference every time it's called, causing FlatList to re-render all items even when nothing changed.
**Why it happens:** `[...get().favorites].sort(...)` always returns a new array reference.
**How to avoid:** Use `useMemo` in the screen component: `const sorted = useMemo(() => getSortedFavorites(), [favorites])`. Or store `getSortedFavorites` as a Zustand `computed`-style selector that is memoized. The simplest fix is `useMemo` in the screen.
**Warning signs:** React DevTools shows FlatList re-rendering all items on every unrelated state update.

---

## Code Examples

Verified patterns from official sources:

### FavoriteButton with spring animation
```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/
// withSpring config: stiffness 200 = snappy enough to feel responsive; damping 10 = slight overshoot for "alive" feel
import { useSharedValue, useAnimatedStyle, withSequence, withSpring } from 'react-native-reanimated';

const scale = useSharedValue(1);

const handlePress = () => {
  toggleFavorite(soundId);
  scale.value = withSequence(
    withSpring(1.3, { stiffness: 200, damping: 10, mass: 1 }),
    withSpring(1.0, { stiffness: 150, damping: 14, mass: 1 }),
  );
};

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

### favoritesStore with persist middleware
```typescript
// Source: https://zustand.docs.pmnd.rs/middlewares/persist
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ favorites: s.favorites }),       // ONLY persist favorites, not _hasHydrated
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
```

### System dark mode initialization
```typescript
// Source: https://reactnative.dev/docs/appearance
// Source: https://docs.expo.dev/develop/user-interface/color-themes/
import { Appearance } from 'react-native';

// In uiStore initial state (synchronous, safe at module init time):
isDarkMode: Appearance.getColorScheme() === 'dark',

// persist partialize — persisted value overrides system on subsequent launches:
partialize: (s) => ({ isDarkMode: s.isDarkMode, defaultTimerDuration: s.defaultTimerDuration }),
```

### Favorites FlatList with empty state
```typescript
// Source: https://reactnative.dev/docs/flatlist (ListEmptyComponent)
<FlatList
  data={sortedFavorites}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <FavoriteSoundCard soundId={item.id} />}
  ListEmptyComponent={<EmptyFavoritesState />}
  contentContainerStyle={sortedFavorites.length === 0 ? styles.emptyContainer : undefined}
  // contentContainerStyle flexGrow:1 ensures empty state centers vertically
/>
```

### Player pre-filling default timer on mount
```typescript
// Source: Locked decision — timer changes in any screen update the saved default
import { useFocusEffect } from 'expo-router';

useFocusEffect(
  useCallback(() => {
    const { defaultTimerDuration } = useUIStore.getState();
    const { isPlaying } = useAudioStore.getState();
    if (!isPlaying) {
      // Silent pre-select — no visual alert; timer display shows the default value
      useAudioStore.getState().setTimerDuration(defaultTimerDuration * 1000);
    }
  }, [])
);
```

---

## Mock Design Reference

All three mock screens for Phase 4 have been reviewed. Key design tokens and component details:

### `mock/your_favorite_sounds/screen.png` (Favorites screen with content)
- **Layout:** Vertical list of cards (not horizontal scroll) — one card per row
- **Card structure:** Icon box (56×56, category color bg) + sound name (bold) + category + duration + heart button (rose-500) + play button (circular, slate-100 background, primary on hover)
- **Playing state card:** Border color `primary/40` with `ring-1 ring-primary/20`; icon box shows animated bars; name and subtitle turn primary color
- **Count meta:** "12 sounds saved" in slate-400 below header, above list
- **Header:** "Your Favorites" centered with back arrow and "Edit" (primary color) — Edit action is out of scope for Phase 4 (can be non-functional)
- **Primary accent:** `#135bec` (blue, consistent with existing app)
- **Background:** `#101622` (dark), `#f6f6f8` (light)
- **Floating premium banner:** Above bottom nav; shown in mock but Phase 4 scope — render as placeholder or skip (Phase 6 gates this)

### `mock/empty_favorites_state/screen.png` (Favorites screen — empty)
- **Icon:** Large outlined heart (`favorite_border`) in white/30 opacity, 48px, inside a 96×96 rounded box with subtle border
- **Heading:** "Your sanctuary is empty" (xl, semibold, white)
- **Subtext:** "Tap the heart icon on any sound to save your moments of peace here." (slate-400, centered, px-4)
- **CTA card:** Frosted glass panel with "Find your rhythm" row and "Explore Sounds" white button (navigates to library tab)
- **Background glow:** Subtle `primary/5` radial blur at center — atmosphere effect

### `mock/app_settings_and_timer/screen.png` (Settings screen)
- **Font:** Manrope (different from Inter used in other screens — the planner must decide whether to use the app's established font or match the mock's Manrope. Recommend using the established font from Phase 3.)
- **Session Duration section:** 3-option segmented control (1m, 2m, 3m) — glass panel with radio buttons, `bg-white/10` on selected option
- **Primary accent in Settings:** `#A78BFA` (soft violet) in mock — this differs from `#135bec` in the Favorites mock. The project likely has one primary color established in Phase 3; use that.
- **Sections present in mock:** Session Duration, Playback Control (Loop Mode toggle, Auto-play Next toggle), Deep Focus (Silence Notifications toggle), Support/FAQ, Share with Friends
- **Dark mode toggle:** NOT shown in Settings mock (`app_settings_and_timer`) — but it IS required by the decision ("dark mode toggle"). It was built as functional in Phase 3 (SET-01). Phase 4 adds it to the completed Settings screen or it was already wired in Phase 3.
- **Account section:** Not present in mock — decision defers to Phase 5; recommendation is to omit it entirely in Phase 4 (don't show a greyed-out row that confuses users pre-auth)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `favoriteIds: string[]` (Phase 1 scaffold) | `favorites: Favorite[]` with `addedAt` timestamp | Phase 4 upgrade | Enables most-recently-added ordering and Phase 5 cloud migration with timestamp preserved |
| `isDarkMode: true` hardcoded (Phase 3) | `isDarkMode: Appearance.getColorScheme() === 'dark'` | Phase 4 — locked decision | First install follows system preference; subsequent launches use persisted value |
| Timer shell (non-functional in Phase 3) | Timer segmented control wired to `uiStore.defaultTimerDuration` | Phase 4 | Session timer default now persists across restarts; player pre-fills on mount |
| Zustand `persist` absent from `favoritesStore` | Zustand `persist` + AsyncStorage on `favoritesStore` | Phase 4 | Favorites survive app restarts |

**Deprecated/outdated for this phase:**
- Phase 1 `setFavorites(ids: string[])` signature: replaced by `setFavorites(favorites: Favorite[])` in Phase 4. Update type in `src/types/index.ts` and the store simultaneously.

---

## Recommendations for Claude's Discretion Areas

Based on research findings, these are the recommended choices for the areas left to Claude's discretion:

### Heart animation: Gentle pop (recommended)
Use `withSequence(withSpring(1.3, ...), withSpring(1.0, ...))` — a brief scale-up then spring-back. This is calmer than a burst/particle effect and fits the ASMR/meditation aesthetic. No color flash or particle emission.

### Unfavorite behavior: Immediate removal, no undo toast (recommended)
Immediate removal matches the "tap to toggle" decision and avoids the complexity of undo state management. The animation reversal (filled rose heart → outlined grey heart) provides sufficient feedback. No toast.

### Favorites screen card style: Match library cards (recommended)
Use the same visual language as library SoundCards — icon box with category color, name, subtitle, duration. The mock (`your_favorite_sounds`) shows exactly this style. Do not create a compact variant.

### Favorites ordering: Most recently added first (recommended)
`getSortedFavorites()` sorts by `addedAt` descending. Simple, predictable, matches user mental model of "I just added this, it should be at the top."

### Favorites grouping: Flat list (recommended)
No category grouping in Phase 4. Single FlatList, sorted by recency. Phase 5+ can add grouping if needed.

### Default timer application in player: Silent pre-select (recommended)
Read `uiStore.defaultTimerDuration` on `useFocusEffect` and write to `audioStore` if not mid-session. No visual highlight or confirmation — the timer display simply shows the correct value.

### No-timer option: Do not offer (recommended)
The mock shows exactly 3 options (1m, 2m, 3m). Infinity mode is Phase 6 premium. Do not add a "no timer" option or a disabled 4th button — this would confuse users and misrepresent the freemium model before Phase 6 is in place.

### Account section placeholder: Hide entirely (recommended)
Do not show a greyed-out "Sign in to sync" row in Settings for Phase 4. It creates user confusion and implies functionality that doesn't exist yet. Phase 5 adds the row when auth is implemented.

---

## Open Questions

1. **Icon system used in Phase 3 (expo-vector-icons vs custom icon_font)**
   - What we know: The mocks use Material Symbols Outlined (Google Fonts, web HTML). The `FavoriteButton` needs the `favorite` / `favorite_border` icons.
   - What's unclear: Whether Phase 3 implemented an `icon_font` component, used `@expo/vector-icons/MaterialIcons`, or another approach. The Phase 3 plans reference Material Symbols but the implementation details are in the Phase 3 plan execution.
   - Recommendation: The planner must check 03-01-SUMMARY.md and 03-02-SUMMARY.md to confirm the icon system before designing FavoriteButton. If `@expo/vector-icons/MaterialIcons` was used, the icons are `favorite` and `favorite_border`. If a custom text-based icon_font was used, replicate that approach.

2. **Phase 3 Settings screen — does dark mode toggle already appear?**
   - What we know: Phase 3 plan (03-03) built a functional dark mode toggle (SET-01). The Settings screen was built with "full mock layout." The `app_settings_and_timer` mock does NOT show a dark mode toggle in its layout.
   - What's unclear: Where exactly the dark mode toggle was placed in the Phase 3 Settings implementation — it may already be in the screen but in a location not shown in this mock.
   - Recommendation: The planner should consult the 03-03-SUMMARY.md to confirm the Settings screen structure before designing Phase 4 additions, to avoid duplicating the toggle.

3. **`audioStore.setTimerDuration` — does this action exist from Phase 2?**
   - What we know: Phase 2 added `timerDurationMs` and `timerStartedAt` to `audioStore`. The timer change mid-session was allowed.
   - What's unclear: The exact action name for updating the timer duration in `audioStore`.
   - Recommendation: Planner checks the 02-SUMMARY.md or audioStore implementation to confirm the setter name before writing the player timer pre-fill code.

---

## Sources

### Primary (HIGH confidence)
- `https://zustand.docs.pmnd.rs/middlewares/persist` — Zustand persist middleware, `createJSONStorage`, `partialize`, `onRehydrateStorage`, async hydration behavior
- `https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/` — `withSpring` config: `stiffness`, `damping`, `mass`; callback after animation completes
- `https://docs.swmansion.com/react-native-reanimated/docs/animations/withSequence/` — Sequential animation composition
- `https://reactnative.dev/docs/appearance` — `Appearance.getColorScheme()` synchronous API, `addChangeListener`
- `https://docs.expo.dev/develop/user-interface/color-themes/` — `userInterfaceStyle: "automatic"`, `expo-system-ui` required for Android
- `https://docs.expo.dev/versions/latest/sdk/system-ui/` — `expo-system-ui` install requirement for Android dev builds
- `https://reactnative.dev/docs/flatlist` — `ListEmptyComponent`, `contentContainerStyle` for empty state centering
- `.planning/phases/01-foundation/01-03-PLAN.md` — Phase 1 `favoritesStore` scaffold (`favoriteIds: string[]`, `addFavorite`, `removeFavorite`, `isFavorite`, `setFavorites`)
- `.planning/phases/03-core-ui/03-RESEARCH.md` — Zustand persist + AsyncStorage pattern (uiStore), `_hasHydrated` guard, existing library choices
- `.planning/phases/03-core-ui/03-03-PLAN.md` — Phase 3 Settings screen structure, dark mode toggle wiring, Session Duration shell
- `mock/your_favorite_sounds/code.html` — Favorites screen design tokens and card structure
- `mock/empty_favorites_state/code.html` — Empty state layout, copy, CTA structure
- `mock/app_settings_and_timer/code.html` — Settings screen layout, Session Duration segmented control, section grouping

### Secondary (MEDIUM confidence)
- `https://www.reactnativepro.com/react-native-animations/animating-the-heart-button-in-react-native/` — Heart button animation with reanimated (verified against official reanimated docs)
- `https://ignitecookbook.com/docs/recipes/Zustand/` — Zustand favorites store pattern with toggle function (community source, pattern matches official Zustand docs)
- `https://piashcse.medium.com/zustand-simplified-effortless-state-management-for-favorites-in-react-native-0b51af8b323a` — Favorites with persist middleware (Medium, verified pattern matches Zustand official docs)

### Tertiary (LOW confidence)
- None — all findings for this phase were verifiable against official sources.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed (except `expo-system-ui`); versions and APIs verified against official docs
- Architecture: HIGH — patterns build directly on Phase 3 established patterns (persist + AsyncStorage, uiStore guard); no novel architecture
- Pitfalls: HIGH — hydration flash, Android dark mode, and store coupling pitfalls verified against official documentation and Phase 3 experience

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days — stable Expo SDK; reanimated API is stable; AsyncStorage and Zustand persist are stable)
