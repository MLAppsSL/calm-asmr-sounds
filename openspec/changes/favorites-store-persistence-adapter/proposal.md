## Why

Phase `04-01` is the first breaking slice in the favorites roadmap: the Phase 1 favorites store scaffold is still an in-memory `string[]` contract, while the next favorites UI and the later cloud-sync migration both require persisted metadata-rich favorites and a stable adapter boundary. This change is needed now because Phase `04-02`, `04-03`, and the Phase 5 migration all depend on the upgraded store and UI preference contract landing first.

## What Changes

- Create a dedicated `favorites` slice and upgrade the favorites store contract from an in-memory `favoriteIds: string[]` shape to a persisted `favorites: Favorite[]` shape with `addedAt` timestamps, hydration readiness, toggle semantics, and sorted reads.
- Upgrade the shared UI store contract so `isDarkMode` falls back to the device appearance on first install and `defaultTimerDuration` becomes a persisted shell preference.
- Add a local favorites adapter service inside the favorites slice that exposes a fully async-compatible interface over the favorites store for the later cloud migration path.
- **BREAKING**: replace the favorites store surface from `favoriteIds`, `addFavorite`, and `removeFavorite` with `favorites`, `toggleFavorite`, and `setFavorites(Favorite[])`, and move favorites-specific imports from `shared/` into the dedicated `favorites` slice.

## Capabilities

### New Capabilities

- `local-favorites-adapter`: Provides a class-based local favorites interface in the dedicated favorites slice that reads and writes through the favorites store while matching the async shape needed by a future cloud adapter.

### Modified Capabilities

- `state-store-contracts`: Update the favorites and UI store requirements so the app-state contract covers the dedicated favorites slice, persisted favorites metadata, hydration signaling, default timer duration, and system dark-mode fallback behavior without weakening existing shared-type guarantees.

## Impact

- Affected code: `src/favorites/domain/stores/favoritesStore.ts`, `src/favorites/domain/types/index.ts`, `src/favorites/data/services/LocalFavoritesAdapter.ts`, `src/shared/domain/stores/uiStore.ts`, direct callers that still rely on the old favorites store shape or import path, and any required top-level barrel export updates.
- Affected systems: Zustand state persistence, AsyncStorage-backed shell preferences, favorites ordering and hydration behavior, and the Phase 5 migration boundary for local-to-cloud favorites sync.
- Dependencies: `@react-native-async-storage/async-storage`, Zustand `persist` middleware, React Native `Appearance`, and `expo-system-ui` for Android system dark-mode support in native builds.
