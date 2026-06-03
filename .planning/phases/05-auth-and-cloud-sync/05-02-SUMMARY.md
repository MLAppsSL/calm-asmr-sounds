# Phase 05-02 Summary

## What Changed

- Added `src/favorites/data/services/FavoritesService.ts` as the Firestore-backed favorites sync service for signed-in users.
- Added `src/favorites/data/hooks/FavoritesSyncController.ts` for the auth-driven sync state machine and `src/favorites/data/hooks/useFavoritesSync.ts` for the root-level hook wiring.
- Updated `app/_layout.tsx` to call `useFavoritesSync()` inside `RootLayoutContent` so the sync lifecycle survives navigation.
- Added focused tests for Firestore favorites conversion/merge helpers and the favorites sync controller behavior.

## FavoritesService

- `getFavorites(uid)` reads `firestore().collection('users').doc(uid)` and converts the `favorites` map into `Favorite[]`.
- `setFavorites(uid, favorites)` writes the full set back to the user document as a `favorites` map.
- `migrateLocalToCloud(uid, localFavorites)` loads the existing cloud set, merges it with local favorites, writes the merged set, and returns it for store replacement.

## Conflict Handling

- Local and cloud favorites are merged by `soundId`.
- When the same sound exists in both places, the earlier `addedAt` timestamp wins so the original save time is preserved across devices.

## useFavoritesSync

- `useFavoritesSync()` is mounted in `RootLayoutContent`, below `AuthProvider`, so it can read `useAuth()` and keep its controller alive across route changes.
- The hook reacts to `user?.uid`, not `user?.id`, because the app now uses Firebase Auth.
- The controller keeps a session-scoped migration guard, performs silent login-time migration/load, suppresses the first echo write after cloud hydration, and writes later signed-in favorites changes back to Firestore.
- Login-time failures are logged with `console.warn` through the controller's warning hook and leave local favorites unchanged.

## Logout Fallback

- The implementation preserves a local favorites snapshot from before login and restores it on logout.
- That snapshot is also stored in AsyncStorage under `favorites-local-snapshot-before-login` so logout fallback still works after an app restart while the user is signed in.

## Path Deviations From The Stale Plan

- The stale plan referenced `src/services/FavoritesService.ts` and `src/hooks/useFavoritesSync.ts`.
- The implementation follows the repo's feature-first structure instead:
  - `src/favorites/data/services/FavoritesService.ts`
  - `src/favorites/data/hooks/FavoritesSyncController.ts`
  - `src/favorites/data/hooks/useFavoritesSync.ts`

## Verification

- Passed: `npx tsc --noEmit`
- Passed: `npm run lint`
- Passed focused tests:
  - `src/favorites/domain/stores/tests/favoritesStore.test.mjs`
  - `src/favorites/data/services/tests/LocalFavoritesAdapter.test.mjs`
  - `src/favorites/data/services/tests/FavoritesService.test.mjs`
  - `src/favorites/data/hooks/tests/useFavoritesSync.test.mjs`

## Notes

- No device-level manual validation was performed in this slice.
- The service uses Firestore user documents and no Supabase code remains in the implemented sync path.
