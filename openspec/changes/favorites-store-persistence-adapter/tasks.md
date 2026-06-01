## 1. Dependency And Shared Type Setup

- [x] 1.1 Verify whether `expo-system-ui` is required for Android system-theme behavior in the current Expo/native setup and add it only if that verification confirms it is needed.
- [x] 1.2 Create the dedicated `src/favorites/` slice structure and add `src/favorites/domain/types/index.ts` exporting the `Favorite` interface without weakening the existing shared app-shell types.

## 2. Favorites Store Migration

- [x] 2.1 Move or replace the existing favorites store so `src/favorites/domain/stores/favoritesStore.ts` owns the persisted `favorites: Favorite[]` contract, including `toggleFavorite`, `isFavorite`, `setFavorites(Favorite[])`, `setHasHydrated`, and `getSortedFavorites()`.
- [x] 2.2 Configure the favorites store persistence to use AsyncStorage JSON storage, persist only the `favorites` collection, flip `_hasHydrated` after rehydration, and migrate legacy persisted `favoriteIds: string[]` data into `Favorite[]` records.
- [x] 2.3 Search for in-repo callers that still reference `favoriteIds`, `addFavorite`, or `removeFavorite`, or import favorites state from `shared/`, and update direct callers and any required barrel exports to the new favorites-slice paths without adding compatibility re-exports from `shared/`.

## 3. UI Store And Adapter Updates

- [x] 3.1 Update `src/shared/domain/stores/uiStore.ts` so `isDarkMode` falls back to `Appearance.getColorScheme() === 'dark'` on first install while preserving the existing persisted hydration pattern.
- [x] 3.2 Add persisted `defaultTimerDuration` and `setDefaultTimerDuration` to the UI store without removing the existing shell fields and actions, and preserve sound-specific timer defaults as the authoritative value where one already exists.
- [x] 3.3 Create `src/favorites/data/services/LocalFavoritesAdapter.ts` as the Phase 5 migration boundary using `useFavoritesStore.getState()` for all reads and writes and a uniformly promise-based interface.

## 4. Validation And Planning Follow-up

- [x] 4.1 Run `npx tsc --noEmit` and `npm run lint` after the slice, store, UI-store, and adapter changes land.
- [x] 4.2 Verify the upgraded contracts meet the change expectations: the `expo-system-ui` decision is documented, old `favoriteIds` references are removed, persisted favorites metadata and hydration wiring are present, legacy favorites migration works, system dark-mode fallback works, and `defaultTimerDuration` remains a fallback rather than overriding explicit sound defaults.
- [x] 4.3 Create `.planning/phases/04-favorites/04-01-SUMMARY.md` documenting the implemented data-layer changes, dependency addition, adapter decisions, and any deviations from the original Phase `04-01` plan.
