## Phase 04-01 Summary

### Implemented

- Added `expo-system-ui` and changed `app.json` to `"userInterfaceStyle": "automatic"` so first-install theme fallback can follow the device theme on Android and iOS.
- Created the dedicated `src/favorites/` slice with a feature-local `Favorite` model, a persisted Zustand favorites store, and a promise-based `LocalFavoritesAdapter`.
- Migrated the favorites store contract from `favoriteIds: string[]` to `favorites: Favorite[]` with `addedAt`, `_hasHydrated`, `toggleFavorite`, `isFavorite`, `setFavorites`, and `getSortedFavorites()`.
- Added deterministic migration from legacy persisted `favoriteIds` data into `Favorite[]` records.
- Extended `useUIStore` so `isDarkMode` falls back to `Appearance.getColorScheme() === 'dark'` on first install and `defaultTimerDuration` is persisted as a shell preference.

### Verification

- `npx tsc --noEmit`
- `npm run lint`
- `node --test --loader ./src/shared/data/services/tests/AudioService.audio-loader.mjs src/favorites/domain/stores/tests/favoritesStore.test.mjs src/favorites/data/services/tests/LocalFavoritesAdapter.test.mjs`
- `npx expo config --type introspect`

### Notes

- No in-repo callers were still importing `src/shared/domain/stores/favoritesStore.ts`, so the old shared favorites store file was removed without adding compatibility re-exports.
- The `defaultTimerDuration` store field is persisted as a generic fallback preference only. Existing catalog-level `defaultTimerSeconds` values remain the authoritative defaults for sound-specific flows.
- `expo config --type introspect` confirmed `expo-system-ui` is installed and the generated native config now resolves `userInterfaceStyle` to `automatic` with Android `uiMode` support.
